"use server"

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
 * 寄信通知的接口（Chunk 8b 接真正的實作）。
 *
 * 目前刻意是 no-op：介面先定好，8b 只要換掉函式內容，
 * 呼叫端與錯誤處理都不用動。
 *
 * TODO(Chunk 8b): 接上寄信服務（Resend / Supabase Edge Function 等），
 * 寄一封通知信到站主信箱。注意不要把寄信失敗變成使用者的錯誤 ——
 * 詢價已經寫進資料庫了，通知失敗只該記 log。
 */
async function notifyNewInquiry(inquiry: {
  name: string
  email: string
  message: string
  source: string | null
}): Promise<void> {
  // 8b 之前刻意什麼都不做。標記為已使用，避免 lint 警告。
  void inquiry
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

  // 通知失敗不影響使用者：資料已經進資料庫了。
  try {
    await notifyNewInquiry({ name, email, message, source })
  } catch {
    // TODO(Chunk 8b): 這裡改成記錄到 log 服務
  }

  return { status: "success" }
}
