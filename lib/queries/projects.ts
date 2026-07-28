// 這一層只能在 server 端用：createClient() 走 next/headers 的 cookies()，
// 若不小心被 client component 匯入，Next.js 會直接報錯。
import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database.types"

export type Project = Tables<"projects">

/** 卡片列表只需要這些欄位，不要把 content 整包 markdown 拉下來。 */
const LIST_COLUMNS =
  "id, slug, title, summary, cover_url, tech_stack, sort_order" as const

export type ProjectListItem = Pick<
  Project,
  "id" | "slug" | "title" | "summary" | "cover_url" | "tech_stack" | "sort_order"
>

/**
 * 撈已發布的作品，依 sort_order 由小到大。
 *
 * RLS 已經擋掉未發布的資料，這裡再明確加上 published = true，
 * 讓 admin 登入時看到的公開頁跟訪客一致（避免草稿意外出現在公開列表）。
 */
export async function getPublishedProjects(): Promise<ProjectListItem[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("projects")
    .select(LIST_COLUMNS)
    .eq("published", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`讀取作品列表失敗：${error.message}`)
  }

  return data
}

/**
 * 依 slug 撈單筆已發布的作品。查無資料回傳 null，由呼叫端決定要不要 notFound()。
 */
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle()

  if (error) {
    throw new Error(`讀取作品「${slug}」失敗：${error.message}`)
  }

  return data
}
