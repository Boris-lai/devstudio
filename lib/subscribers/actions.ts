"use server"

import { createClient } from "@/lib/supabase/server"

export type SubscribeResult =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string; fieldError?: string }

const EMAIL_MAX = 254

/** 不追求完全符合 RFC，擋掉明顯不是 email 的輸入即可。比照 lib/inquiries/actions.ts。 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Postgres 的 unique_violation。subscribers.email 有 unique 約束。 */
const UNIQUE_VIOLATION = "23505"

function readField(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

/**
 * 訂閱以換取模板下載。
 *
 * 交付方式刻意是「送出後同頁直接給連結」，不是寄信 ——
 * Resend 目前用的是共用寄件位址 onboarding@resend.dev，它只寄得到
 * 帳號本身的信箱（見 lib/inquiries/actions.ts 的 NOTIFY_FROM 註解），
 * 寄不到陌生訂閱者。等自有網域驗證完成後，可以在這裡補一封
 * 「備份下載連結」的信給 email 本人，前端不用改。
 *
 * email 一律轉小寫再寫入：unique 約束是區分大小寫的，
 * 不正規化的話 A@b.com 與 a@b.com 會變成兩列。
 */
export async function subscribeForTemplate(
  _previous: SubscribeResult | null,
  formData: FormData,
): Promise<SubscribeResult> {
  // Honeypot：正常使用者看不到也填不到這欄，被填代表是 bot。
  // 回報成功但不寫入，不給它重試的訊號。
  if (readField(formData, "website").length > 0) {
    return { status: "success" }
  }

  const email = readField(formData, "email").toLowerCase()

  if (email.length === 0) {
    return {
      status: "error",
      message: "表單還有欄位需要修正。",
      fieldError: "請留下 Email。",
    }
  }

  if (email.length > EMAIL_MAX || !EMAIL_PATTERN.test(email)) {
    return {
      status: "error",
      message: "表單還有欄位需要修正。",
      fieldError: "Email 格式看起來不太對。",
    }
  }

  const supabase = await createClient()

  // 不要鏈 .select()：subscribers 只有 admin 讀得到，
  // 訪客送出後讀不回自己那列，接上去只會拿到 RLS 錯誤。
  const { error } = await supabase.from("subscribers").insert({ email })

  // 已經訂閱過的人再回來一次，要照樣拿得到檔案 ——
  // 對他來說「我留過 email 了」就是成功，重複不是錯誤。
  if (error && error.code !== UNIQUE_VIOLATION) {
    return { status: "error", message: "送出失敗，請稍後再試一次。" }
  }

  return { status: "success" }
}
