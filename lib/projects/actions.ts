"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireAdmin } from "@/lib/auth/is-admin"
import { slugify } from "@/lib/slug"
import { createClient } from "@/lib/supabase/server"

export type ProjectFieldErrors = Partial<
  Record<"title" | "slug" | "sort_order", string>
>

export type ProjectActionResult =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: ProjectFieldErrors }

const TITLE_MAX = 200
const SLUG_MAX = 200

type ProjectInput = {
  title: string
  slug: string
  summary: string | null
  content: string | null
  role: string | null
  outcome: string | null
  client_type: string | null
  cover_url: string | null
  tech_stack: string[]
  live_url: string | null
  repo_url: string | null
  featured: boolean
  sort_order: number
  published: boolean
}

function readText(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

/** 空字串一律存成 null，避免資料庫裡混著 "" 與 null 兩種「沒有值」。 */
function readNullableText(formData: FormData, key: string): string | null {
  const value = readText(formData, key)
  return value.length > 0 ? value : null
}

/**
 * tech_stack 在表單上是逗號分隔的字串，存進資料庫要是 text[]。
 * 全形逗號也一起吃，中文輸入法很容易打成全形。
 * 欄位是 not null default '{}'，所以沒填就是空陣列而不是 null。
 */
function readTechStack(formData: FormData): string[] {
  return readText(formData, "tech_stack")
    .split(/[,，]/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
}

function readProjectInput(
  formData: FormData,
):
  | { ok: true; input: ProjectInput }
  | { ok: false; result: ProjectActionResult } {
  const title = readText(formData, "title")
  // slug 留空就由標題生成，但使用者填了就尊重他填的
  const slug = slugify(readText(formData, "slug") || title)

  const fieldErrors: ProjectFieldErrors = {}

  if (title.length === 0) {
    fieldErrors.title = "標題必填。"
  } else if (title.length > TITLE_MAX) {
    fieldErrors.title = `標題最多 ${TITLE_MAX} 字。`
  }

  if (slug.length === 0) {
    fieldErrors.slug = "slug 必填。標題若全是無法轉換的字元，請手動填寫。"
  } else if (slug.length > SLUG_MAX) {
    fieldErrors.slug = `slug 最多 ${SLUG_MAX} 字。`
  }

  const sortOrderRaw = readText(formData, "sort_order")
  const sortOrder = sortOrderRaw.length > 0 ? Number(sortOrderRaw) : 0

  if (!Number.isInteger(sortOrder)) {
    fieldErrors.sort_order = "排序必須是整數。"
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      result: {
        status: "error",
        message: "表單還有欄位需要修正。",
        fieldErrors,
      },
    }
  }

  return {
    ok: true,
    input: {
      title,
      slug,
      summary: readNullableText(formData, "summary"),
      content: readNullableText(formData, "content"),
      role: readNullableText(formData, "role"),
      outcome: readNullableText(formData, "outcome"),
      client_type: readNullableText(formData, "client_type"),
      cover_url: readNullableText(formData, "cover_url"),
      tech_stack: readTechStack(formData),
      live_url: readNullableText(formData, "live_url"),
      repo_url: readNullableText(formData, "repo_url"),
      featured: formData.get("featured") !== null,
      sort_order: sortOrder,
      published: formData.get("published") !== null,
    },
  }
}

/**
 * 後台列表 + 前台作品列表 + 該作品頁 + 首頁。
 * 首頁也要 revalidate，因為精選作品區會跟著 featured / published 變。
 * slug 變更時舊網址也要一起失效。
 */
function revalidateProjectPaths(slugs: readonly string[]): void {
  revalidatePath("/admin/projects")
  revalidatePath("/work")
  revalidatePath("/")
  for (const slug of new Set(slugs)) {
    revalidatePath(`/work/${slug}`)
  }
}

/**
 * slug 是否已被別人用掉。
 * excludeId 讓「編輯時沿用自己原本的 slug」不會被誤判成重複。
 */
async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const supabase = await createClient()

  let query = supabase.from("projects").select("id").eq("slug", slug)
  if (excludeId) query = query.neq("id", excludeId)

  const { data, error } = await query.maybeSingle()

  // 查不出來時保守當成「已被使用」，讓資料庫的 unique 約束當最後防線
  if (error) return true
  return data !== null
}

export async function createProject(
  _previous: ProjectActionResult | null,
  formData: FormData,
): Promise<ProjectActionResult> {
  await requireAdmin()

  const parsed = readProjectInput(formData)
  if (!parsed.ok) return parsed.result

  const { input } = parsed

  if (await isSlugTaken(input.slug)) {
    return {
      status: "error",
      message: "表單還有欄位需要修正。",
      fieldErrors: { slug: "這個 slug 已經有人用了。" },
    }
  }

  const supabase = await createClient()
  const { error } = await supabase.from("projects").insert(input)

  if (error) {
    return { status: "error", message: `建立失敗：${error.message}` }
  }

  revalidateProjectPaths([input.slug])

  // redirect() 是靠 throw 運作的，要放在最後、不能包在 try/catch 裡
  redirect("/admin/projects")
}

export async function updateProject(
  id: string,
  _previous: ProjectActionResult | null,
  formData: FormData,
): Promise<ProjectActionResult> {
  await requireAdmin()

  const parsed = readProjectInput(formData)
  if (!parsed.ok) return parsed.result

  const { input } = parsed

  if (await isSlugTaken(input.slug, id)) {
    return {
      status: "error",
      message: "表單還有欄位需要修正。",
      fieldErrors: { slug: "這個 slug 已經有人用了。" },
    }
  }

  const supabase = await createClient()

  // 撈舊 slug：改過 slug 的話舊網址的快取也要失效
  const { data: existing } = await supabase
    .from("projects")
    .select("slug")
    .eq("id", id)
    .maybeSingle()

  const { error } = await supabase
    .from("projects")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    return { status: "error", message: `更新失敗：${error.message}` }
  }

  revalidateProjectPaths(
    [input.slug, existing?.slug].filter((slug): slug is string =>
      Boolean(slug),
    ),
  )

  redirect("/admin/projects")
}

export async function deleteProject(id: string): Promise<ProjectActionResult> {
  await requireAdmin()

  const supabase = await createClient()

  // 用 select() 拿回被刪的那列：被 RLS 擋下時會是 0 列，可以據此回報
  const { data, error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .select("slug")
    .maybeSingle()

  if (error) {
    return { status: "error", message: `刪除失敗：${error.message}` }
  }

  if (!data) {
    return { status: "error", message: "沒有權限刪除，或這筆已經被刪掉了。" }
  }

  revalidateProjectPaths([data.slug])

  return { status: "idle" }
}

/** 切換發布狀態。作品沒有 published_at 欄位，不需要補時間。 */
export async function toggleProjectPublished(
  id: string,
  nextPublished: boolean,
): Promise<ProjectActionResult> {
  return updateProjectFlag(id, { published: nextPublished })
}

/** 切換首頁精選。 */
export async function toggleProjectFeatured(
  id: string,
  nextFeatured: boolean,
): Promise<ProjectActionResult> {
  return updateProjectFlag(id, { featured: nextFeatured })
}

/** 兩個開關共用的更新流程，避免重複。 */
async function updateProjectFlag(
  id: string,
  patch: { published: boolean } | { featured: boolean },
): Promise<ProjectActionResult> {
  await requireAdmin()

  const supabase = await createClient()

  const { data, error } = await supabase
    .from("projects")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("slug")
    .maybeSingle()

  if (error) {
    return { status: "error", message: `切換失敗：${error.message}` }
  }

  if (!data) {
    return { status: "error", message: "找不到這筆作品，或沒有權限修改。" }
  }

  revalidateProjectPaths([data.slug])

  return { status: "idle" }
}
