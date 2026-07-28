// 這一層只能在 server 端用：createClient() 走 next/headers 的 cookies()。
import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database.types"

export type CommentAuthor = Pick<
  Tables<"profiles">,
  "id" | "display_name" | "avatar_url"
>

export type CommentWithAuthor = Pick<
  Tables<"comments">,
  "id" | "content" | "created_at" | "user_id"
> & {
  author: CommentAuthor | null
}

/**
 * 撈某篇文章的留言，依 created_at 由舊到新，並一併帶出留言者的 profile。
 *
 * 用 PostgREST 的關聯查詢一次撈完。這是靠 comments.user_id → public.profiles(id)
 * 這條外鍵（見 migration 20260728064008）；在那之前 user_id 指向 auth.users，
 * 與 profiles 沒有直接外鍵，只能分兩次查詢再自行合併。
 *
 * 只列頂層留言：巢狀回覆是 v2 的範圍，目前也沒有建立回覆的 UI。
 */
export async function getCommentsByPostId(
  postId: string,
): Promise<CommentWithAuthor[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("comments")
    .select("id, content, created_at, user_id, profiles(id, display_name, avatar_url)")
    .eq("post_id", postId)
    .is("parent_id", null)
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error(`讀取留言失敗：${error.message}`)
  }

  return data.map(({ profiles, ...comment }) => ({
    ...comment,
    // 外鍵保證對得到 profile，但保留 fallback：
    // profiles 的 RLS 若日後收緊，這裡會拿到 null 而不是整頁爆掉。
    author: profiles ?? null,
  }))
}

/**
 * 目前使用者是否為 admin。
 * 直接呼叫資料庫的 is_admin()，與 RLS 政策用的是同一份定義，避免兩邊判斷漂移。
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc("is_admin")

  if (error) return false
  return data === true
}
