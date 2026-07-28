// 這一層只能在 server 端用：createClient() 走 next/headers 的 cookies()，
// 若不小心被 client component 匯入，Next.js 會直接報錯。
import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database.types"

export type Post = Tables<"posts">

/** 列表不需要整包 markdown content，只撈卡片會用到的欄位。 */
const LIST_COLUMNS =
  "id, slug, title, excerpt, cover_url, published_at" as const

export type PostListItem = Pick<
  Post,
  "id" | "slug" | "title" | "excerpt" | "cover_url" | "published_at"
>

/**
 * 撈已發布的文章，最新的排前面。
 *
 * RLS 已經擋掉未發布的資料，這裡再明確加上 published = true，
 * 讓 admin 登入時看到的公開頁跟訪客一致（比照作品頁的做法）。
 * published_at 可能是 null，用 nullsFirst: false 把它排到最後。
 */
export async function getPublishedPosts(): Promise<PostListItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("posts")
    .select(LIST_COLUMNS)
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false })

  if (error) {
    throw new Error(`讀取文章列表失敗：${error.message}`)
  }

  return data
}

/**
 * 依 slug 撈單筆已發布的文章。查無資料回傳 null，由呼叫端決定要不要 notFound()。
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle()

  if (error) {
    throw new Error(`讀取文章「${slug}」失敗：${error.message}`)
  }

  return data
}
