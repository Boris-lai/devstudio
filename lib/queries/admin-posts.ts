// 只能在 server 端用：createClient() 走 next/headers 的 cookies()。
import { requireAdmin } from "@/lib/auth/is-admin"
import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database.types"

export type AdminPost = Tables<"posts">

export type AdminPostListItem = Pick<
  AdminPost,
  "id" | "slug" | "title" | "published" | "published_at" | "updated_at"
>

const LIST_COLUMNS =
  "id, slug, title, published, published_at, updated_at" as const

/**
 * 後台文章列表，**包含草稿** —— admin 的 select 政策看得到 published = false。
 *
 * 依 created_at 由新到舊：後台要的是「最近動過的在上面」，
 * 而草稿沒有 published_at，用它排序會把草稿全部沉底。
 *
 * requireAdmin() 放在資料層而不只是 layout，理由見 lib/auth/is-admin.ts。
 */
export async function getAdminPosts(): Promise<AdminPostListItem[]> {
  await requireAdmin()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("posts")
    .select(LIST_COLUMNS)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`讀取後台文章列表失敗：${error.message}`)
  }

  return data
}

/** 編輯頁用：依 id 撈單篇（含草稿）。查無資料回傳 null。 */
export async function getAdminPostById(id: string): Promise<AdminPost | null> {
  await requireAdmin()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(`讀取文章失敗：${error.message}`)
  }

  return data
}
