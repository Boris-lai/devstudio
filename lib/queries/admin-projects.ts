// 只能在 server 端用：createClient() 走 next/headers 的 cookies()。
import { requireAdmin } from "@/lib/auth/is-admin"
import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/types/database.types"

export type AdminProject = Tables<"projects">

export type AdminProjectListItem = Pick<
  AdminProject,
  "id" | "slug" | "title" | "published" | "featured" | "sort_order"
>

const LIST_COLUMNS = "id, slug, title, published, featured, sort_order" as const

/**
 * 後台作品列表，**包含未發布** —— admin 的 select 政策看得到 published = false。
 *
 * 依 sort_order 排序（與前台一致），同序時用 created_at 由新到舊墊底，
 * 這樣新建的作品不會夾在中間找不到。
 *
 * requireAdmin() 放在資料層而不只是 layout，理由見 lib/auth/is-admin.ts。
 */
export async function getAdminProjects(): Promise<AdminProjectListItem[]> {
  await requireAdmin()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("projects")
    .select(LIST_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`讀取後台作品列表失敗：${error.message}`)
  }

  return data
}

/** 編輯頁用：依 id 撈單筆（含未發布）。查無資料回傳 null。 */
export async function getAdminProjectById(
  id: string,
): Promise<AdminProject | null> {
  await requireAdmin()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error) {
    throw new Error(`讀取作品失敗：${error.message}`)
  }

  return data
}
