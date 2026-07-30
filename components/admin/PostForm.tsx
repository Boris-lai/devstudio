"use client"

import Link from "next/link"
import { useActionState, useState } from "react"

import { Markdown } from "@/components/markdown/Markdown"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { PostActionResult } from "@/lib/posts/actions"
import { slugify } from "@/lib/slug"

export type PostFormValues = {
  title: string
  slug: string
  excerpt: string
  content: string
  coverUrl: string
  published: boolean
  /** 已經是 datetime-local 格式（Asia/Taipei），由 server 端算好傳進來 */
  publishedAtLocal: string
}

export const EMPTY_POST_FORM: PostFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverUrl: "",
  published: false,
  publishedAtLocal: "",
}

type PostFormProps = {
  action: (
    previous: PostActionResult | null,
    formData: FormData,
  ) => Promise<PostActionResult>
  initial: PostFormValues
  submitLabel: string
  /** 新建時 slug 跟著標題走；編輯既有文章時不要覆寫已存在的 slug */
  autoSlug: boolean
}

export function PostForm({
  action,
  initial,
  submitLabel,
  autoSlug,
}: PostFormProps) {
  const [state, formAction, isPending] = useActionState<
    PostActionResult | null,
    FormData
  >(action, null)

  const [title, setTitle] = useState(initial.title)
  const [slug, setSlug] = useState(initial.slug)
  const [content, setContent] = useState(initial.content)

  // 使用者動過 slug 之後就不再自動覆寫。用衍生值而不是 useEffect 同步，
  // 避免多一次 render。
  const [slugTouched, setSlugTouched] = useState(!autoSlug)
  const effectiveSlug = slugTouched ? slug : slugify(title)

  const fieldErrors = state?.status === "error" ? state.fieldErrors : undefined

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {state?.status === "error" && !state.fieldErrors ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="title">標題</Label>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={isPending}
            required
            maxLength={200}
          />
          {fieldErrors?.title ? (
            <p className="text-sm text-destructive">{fieldErrors.title}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="slug">slug</Label>
          <Input
            id="slug"
            name="slug"
            value={effectiveSlug}
            onChange={(event) => {
              setSlugTouched(true)
              setSlug(event.target.value)
            }}
            disabled={isPending}
            maxLength={200}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            留空會由標題自動生成（中文會保留）。手動改過就不再自動覆寫。
          </p>
          {fieldErrors?.slug ? (
            <p className="text-sm text-destructive">{fieldErrors.slug}</p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="excerpt">摘要</Label>
        <Textarea
          id="excerpt"
          name="excerpt"
          defaultValue={initial.excerpt}
          disabled={isPending}
          rows={2}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="cover_url">封面圖網址</Label>
        <Input
          id="cover_url"
          name="cover_url"
          type="url"
          defaultValue={initial.coverUrl}
          disabled={isPending}
          className="font-mono"
        />
        <p className="text-xs text-muted-foreground">
          目前 next/image 只允許 Supabase Storage 的網域，別的來源要先加進
          next.config.ts。
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-8">
        <div className="flex flex-col gap-2">
          <Label htmlFor="published_at">發布時間</Label>
          <Input
            id="published_at"
            name="published_at"
            type="datetime-local"
            defaultValue={initial.publishedAtLocal}
            disabled={isPending}
          />
          <p className="text-xs text-muted-foreground">
            以台灣時間輸入。發布時若留空會自動填現在時間。
          </p>
        </div>

        <div className="flex items-center gap-3 pb-1">
          <Switch
            id="published"
            name="published"
            defaultChecked={initial.published}
            disabled={isPending}
          />
          <Label htmlFor="published">發布</Label>
        </div>
      </div>

      {/* 左編輯右預覽。預覽用的是與前台同一個 <Markdown> renderer */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="content">內容（Markdown）</Label>
        <div className="grid gap-4 lg:grid-cols-2">
          <Textarea
            id="content"
            name="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            disabled={isPending}
            rows={24}
            className="font-mono text-[13px] leading-[1.7]"
          />

          <div className="min-h-40 overflow-x-auto rounded-lg border border-border bg-background p-5">
            {content.trim() ? (
              <Markdown content={content} />
            ) : (
              <p className="text-sm text-muted-foreground">
                左邊開始打字，這裡會即時預覽。
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "儲存中⋯" : submitLabel}
        </Button>
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link href="/admin/posts">取消</Link>}
        />
      </div>
    </form>
  )
}
