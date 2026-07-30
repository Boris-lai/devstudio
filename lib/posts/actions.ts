"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { requireAdmin } from "@/lib/auth/is-admin"
import { slugify } from "@/lib/slug"
import { createClient } from "@/lib/supabase/server"

export type PostFieldErrors = Partial<Record<"title" | "slug", string>>

export type PostActionResult =
  | { status: "idle" }
  | { status: "error"; message: string; fieldErrors?: PostFieldErrors }

const TITLE_MAX = 200
const SLUG_MAX = 200

type PostInput = {
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  cover_url: string | null
  published: boolean
  published_at: string | null
}

/** <input type="datetime-local"> 的格式，沒有時區資訊。 */
const LOCAL_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/

/**
 * 把表單的時間轉成 ISO。
 *
 * datetime-local 給的是「2026-07-30T14:30」這種沒有時區的字串，直接塞進
 * timestamptz 會被資料庫當成 UTC，於台灣時間差 8 小時。這裡明確補上
 * +08:00 —— 站台只服務台灣，與全站顯示用的 Asia/Taipei 一致。
 */
function toIsoFromTaipeiLocal(value: string | null): string | null {
  if (!value) return null

  const candidate = LOCAL_DATETIME.test(value) ? `${value}:00+08:00` : value
  const parsed = new Date(candidate)

  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString()
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
 * 從表單讀出一篇文章的欄位並驗證。
 *
 * published 切成 true 而 published_at 是空的時候自動補現在時間 ——
 * 發布了卻沒有日期，前台列表的排序會把它沉到最後。
 */
function readPostInput(
  formData: FormData,
): { ok: true; input: PostInput } | { ok: false; result: PostActionResult } {
  const title = readText(formData, "title")
  // slug 留空就由標題生成，但使用者填了就尊重他填的
  const slug = slugify(readText(formData, "slug") || title)
  const published = formData.get("published") !== null

  const fieldErrors: PostFieldErrors = {}

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

  const publishedAtRaw = toIsoFromTaipeiLocal(
    readNullableText(formData, "published_at"),
  )
  const published_at =
    published && !publishedAtRaw ? new Date().toISOString() : publishedAtRaw

  return {
    ok: true,
    input: {
      title,
      slug,
      excerpt: readNullableText(formData, "excerpt"),
      content: readNullableText(formData, "content"),
      cover_url: readNullableText(formData, "cover_url"),
      published,
      published_at,
    },
  }
}

/** 後台列表 + 前台文章列表 + 該篇內頁。slug 變更時舊網址也要一起失效。 */
function revalidatePostPaths(slugs: readonly string[]): void {
  revalidatePath("/admin/posts")
  revalidatePath("/blog")
  revalidatePath("/")
  for (const slug of new Set(slugs)) {
    revalidatePath(`/blog/${slug}`)
  }
}

/**
 * slug 是否已被別人用掉。
 * excludeId 讓「編輯時沿用自己原本的 slug」不會被誤判成重複。
 */
async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const supabase = await createClient()

  let query = supabase.from("posts").select("id").eq("slug", slug)
  if (excludeId) query = query.neq("id", excludeId)

  const { data, error } = await query.maybeSingle()

  // 查不出來時保守當成「已被使用」，讓資料庫的 unique 約束當最後防線
  if (error) return true
  return data !== null
}

export async function createPost(
  _previous: PostActionResult | null,
  formData: FormData,
): Promise<PostActionResult> {
  await requireAdmin()

  const parsed = readPostInput(formData)
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
  const { error } = await supabase.from("posts").insert(input)

  if (error) {
    return { status: "error", message: `建立失敗：${error.message}` }
  }

  revalidatePostPaths([input.slug])

  // redirect() 是靠 throw 運作的，要放在最後、不能包在 try/catch 裡
  redirect("/admin/posts")
}

export async function updatePost(
  id: string,
  _previous: PostActionResult | null,
  formData: FormData,
): Promise<PostActionResult> {
  await requireAdmin()

  const parsed = readPostInput(formData)
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
    .from("posts")
    .select("slug")
    .eq("id", id)
    .maybeSingle()

  const { error } = await supabase
    .from("posts")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) {
    return { status: "error", message: `更新失敗：${error.message}` }
  }

  revalidatePostPaths([input.slug, existing?.slug].filter(Boolean) as string[])

  redirect("/admin/posts")
}

export async function deletePost(id: string): Promise<PostActionResult> {
  await requireAdmin()

  const supabase = await createClient()

  // 用 select() 拿回被刪的那列：被 RLS 擋下時會是 0 列，可以據此回報
  const { data, error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id)
    .select("slug")
    .maybeSingle()

  if (error) {
    return { status: "error", message: `刪除失敗：${error.message}` }
  }

  if (!data) {
    return { status: "error", message: "沒有權限刪除，或這篇已經被刪掉了。" }
  }

  revalidatePostPaths([data.slug])

  return { status: "idle" }
}

/**
 * 切換發布狀態。從未發布切成發布時，若沒有 published_at 就補現在時間。
 */
export async function togglePostPublished(
  id: string,
  nextPublished: boolean,
): Promise<PostActionResult> {
  await requireAdmin()

  const supabase = await createClient()

  const { data: existing, error: readError } = await supabase
    .from("posts")
    .select("slug, published_at")
    .eq("id", id)
    .maybeSingle()

  if (readError || !existing) {
    return { status: "error", message: "找不到這篇文章。" }
  }

  const published_at =
    nextPublished && !existing.published_at
      ? new Date().toISOString()
      : existing.published_at

  const { error } = await supabase
    .from("posts")
    .update({
      published: nextPublished,
      published_at,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    return { status: "error", message: `切換失敗：${error.message}` }
  }

  revalidatePostPaths([existing.slug])

  return { status: "idle" }
}
