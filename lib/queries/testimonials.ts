// 這一層只能在 server 端用：createClient() 走 next/headers 的 cookies()。
import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database.types"

export type Testimonial = Tables<"testimonials">

/**
 * 撈已發布的客戶好評，依 sort_order 由小到大。
 *
 * RLS 已擋掉未發布的資料，這裡再明確加上 published = true，
 * 讓 admin 登入時看到的公開頁與訪客一致（比照作品／文章的做法）。
 */
export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true })

  if (error) {
    throw new Error(`讀取客戶好評失敗：${error.message}`)
  }

  return data
}
