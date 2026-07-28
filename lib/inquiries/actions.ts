"use server"

import { Resend } from "resend"

import { createClient } from "@/lib/supabase/server"

export type InquiryFieldErrors = Partial<
  Record<"name" | "email" | "message", string>
>

export type InquiryResult =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldErrors?: InquiryFieldErrors }

const MESSAGE_MAX = 2000
const NAME_MAX = 100
const EMAIL_MAX = 254

/** 不追求完全符合 RFC，擋掉明顯不是 email 的輸入即可，真正的驗證靠回信。 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function readField(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

/**
 * 尚未驗證自有網域，所以只能用 Resend 的共用寄件位址。
 * 這個位址有限制：只寄得到 Resend 帳號本身的 email，
 * 剛好就是 INQUIRY_NOTIFY_TO。之後驗證網域後改成自己的位址即可。
 */
const NOTIFY_FROM = "onboarding@resend.dev"

const submittedAtFormatter = new Intl.DateTimeFormat("zh-TW", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Taipei",
})

/**
 * 詢價進來後寄一封通知信到站主信箱。
 *
 * 這個函式**永遠不會 throw**：詢價已經寫進資料庫了，
 * 寄信失敗只是收不到即時通知，不該讓使用者看到送出失敗。
 * 所有失敗都在這裡自行吞掉並記 log。
 */
async function notifyNewInquiry(inquiry: {
  name: string
  email: string
  message: string
  source: string | null
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.INQUIRY_NOTIFY_TO

  // 沒設定的環境（例如還沒配好的預覽環境）也要能正常運作，不要壞掉
  if (!apiKey || !to) {
    console.warn(
      "[inquiry] 未設定 RESEND_API_KEY 或 INQUIRY_NOTIFY_TO，略過寄信通知。",
    )
    return
  }

  const body = [
    `姓名：${inquiry.name}`,
    `Email：${inquiry.email}`,
    `來源頁面：${inquiry.source ?? "（未提供）"}`,
    `送出時間：${submittedAtFormatter.format(new Date())}`,
    "",
    "需求訊息：",
    inquiry.message,
  ].join("\n")

  try {
    const resend = new Resend(apiKey)

    // Resend SDK 的 send() 是回傳 { data, error }，API 層級的失敗不會 throw，
    // 所以一定要自己檢查 error，光靠 try/catch 會漏掉。
    const { error } = await resend.emails.send({
      from: NOTIFY_FROM,
      to,
      // 在 Gmail 直接按回覆就是回給客戶，不用再複製貼上信箱
      replyTo: inquiry.email,
      subject: `新的接案詢價：${inquiry.name}`,
      text: body,
    })

    if (error) {
      console.error("[inquiry] 寄信通知失敗：", error.name, error.message)
    }
  } catch (cause) {
    // 網路層級的例外（DNS、逾時等）才會走到這裡
    console.error("[inquiry] 寄信通知發生例外：", cause)
  }
}

export async function submitInquiry(
  _previous: InquiryResult | null,
  formData: FormData,
): Promise<InquiryResult> {
  // Honeypot：正常使用者看不到也填不到這欄，被填代表是 bot。
  // 回報成功但不寫入，讓對方以為送出了，不給它重試的訊號。
  if (readField(formData, "website").length > 0) {
    return { status: "success" }
  }

  const name = readField(formData, "name")
  const email = readField(formData, "email")
  const message = readField(formData, "message")
  const sourceRaw = readField(formData, "source")
  const source = sourceRaw.length > 0 ? sourceRaw : null

  const fieldErrors: InquiryFieldErrors = {}

  if (name.length === 0) {
    fieldErrors.name = "請留下稱呼。"
  } else if (name.length > NAME_MAX) {
    fieldErrors.name = `姓名最多 ${NAME_MAX} 字。`
  }

  if (email.length === 0) {
    fieldErrors.email = "請留下 Email，我才回得了你。"
  } else if (email.length > EMAIL_MAX || !EMAIL_PATTERN.test(email)) {
    fieldErrors.email = "Email 格式看起來不太對。"
  }

  if (message.length === 0) {
    fieldErrors.message = "簡單描述一下你的需求吧。"
  } else if (message.length > MESSAGE_MAX) {
    fieldErrors.message = `需求訊息最多 ${MESSAGE_MAX} 字，目前 ${message.length} 字。`
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", message: "表單還有欄位需要修正。", fieldErrors }
  }

  const supabase = await createClient()

  // 不要鏈 .select()：inquiries 的 select 政策限 admin，
  // 訪客送出後讀不回自己那列，接上去只會拿到 RLS 錯誤。
  const { error } = await supabase
    .from("inquiries")
    .insert({ name, email, message, source })

  if (error) {
    return { status: "error", message: "送出失敗，請稍後再試一次。" }
  }

  // notifyNewInquiry 自己會吞掉並記錄所有失敗，正常情況不會 throw。
  // 這層 try/catch 純粹是防禦性的：詢價已經寫進資料庫，
  // 就算通知那側日後改壞了，也不該讓使用者看到送出失敗。
  try {
    await notifyNewInquiry({ name, email, message, source })
  } catch {
    // 故意忽略
  }

  return { status: "success" }
}
