"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"

export type CommentActionResult = { ok: true } | { ok: false; error: string }

/** 與資料表的 check (char_length(content) between 1 and 5000) 對齊。 */
const MAX_LENGTH = 5000

/** 留言送出／刪除後，讓該文章頁重新取資料。 */
async function revalidatePostPage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  postId: string,
): Promise<void> {
  const { data: post } = await supabase
    .from("posts")
    .select("slug")
    .eq("id", postId)
    .maybeSingle()

  if (post) {
    revalidatePath(`/blog/${post.slug}`)
  }
}

export async function addComment(
  postId: string,
  content: string,
): Promise<CommentActionResult> {
  const trimmed = content.trim()

  if (trimmed.length === 0) {
    return { ok: false, error: "留言內容不能空白。" }
  }

  if (trimmed.length > MAX_LENGTH) {
    return {
      ok: false,
      error: `留言最多 ${MAX_LENGTH} 字，目前 ${trimmed.length} 字。`,
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false, error: "請先登入再留言。" }
  }

  // user_id 帶自己的 id，RLS 的 with check (auth.uid() = user_id) 會再把關一次。
  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    user_id: user.id,
    content: trimmed,
  })

  if (error) {
    return { ok: false, error: "留言送出失敗，請稍後再試。" }
  }

  await revalidatePostPage(supabase, postId)

  return { ok: true }
}

export async function deleteComment(
  commentId: string,
): Promise<CommentActionResult> {
  const supabase = await createClient()

  // 不自己判斷權限：RLS 已限定「只能刪自己的、admin 可刪任何」。
  // 加上 select() 之後，被 RLS 擋下時回傳 0 列，據此回報無權限。
  const { data, error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)
    .select("post_id")
    .maybeSingle()

  if (error) {
    return { ok: false, error: "刪除失敗，請稍後再試。" }
  }

  if (!data) {
    return { ok: false, error: "沒有權限刪除這則留言，或它已經被刪除了。" }
  }

  await revalidatePostPage(supabase, data.post_id)

  return { ok: true }
}
