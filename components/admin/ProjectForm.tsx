"use client"

import Link from "next/link"
import { useActionState, useState } from "react"

import { Markdown } from "@/components/markdown/Markdown"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { ProjectActionResult } from "@/lib/projects/actions"
import { slugify } from "@/lib/slug"

export type ProjectFormValues = {
  title: string
  slug: string
  summary: string
  content: string
  role: string
  outcome: string
  clientType: string
  /** 逗號分隔的字串，送出後由 server action 轉回陣列 */
  techStack: string
  coverUrl: string
  liveUrl: string
  repoUrl: string
  featured: boolean
  sortOrder: number
  published: boolean
}

export const EMPTY_PROJECT_FORM: ProjectFormValues = {
  title: "",
  slug: "",
  summary: "",
  content: "",
  role: "",
  outcome: "",
  clientType: "",
  techStack: "",
  coverUrl: "",
  liveUrl: "",
  repoUrl: "",
  featured: false,
  sortOrder: 0,
  published: false,
}

type ProjectFormProps = {
  action: (
    previous: ProjectActionResult | null,
    formData: FormData,
  ) => Promise<ProjectActionResult>
  initial: ProjectFormValues
  submitLabel: string
  /** 新建時 slug 跟著標題走；編輯既有作品時不要覆寫已存在的 slug */
  autoSlug: boolean
}

export function ProjectForm({
  action,
  initial,
  submitLabel,
  autoSlug,
}: ProjectFormProps) {
  const [state, formAction, isPending] = useActionState<
    ProjectActionResult | null,
    FormData
  >(action, null)

  const [title, setTitle] = useState(initial.title)
  const [slug, setSlug] = useState(initial.slug)
  const [content, setContent] = useState(initial.content)

  // 使用者動過 slug 之後就不再自動覆寫。用衍生值而不是 useEffect 同步。
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
        <Label htmlFor="summary">卡片短描述</Label>
        <Textarea
          id="summary"
          name="summary"
          defaultValue={initial.summary}
          disabled={isPending}
          rows={2}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="role">我的角色</Label>
          <Textarea
            id="role"
            name="role"
            defaultValue={initial.role}
            disabled={isPending}
            rows={3}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="outcome">成果</Label>
          <Textarea
            id="outcome"
            name="outcome"
            defaultValue={initial.outcome}
            disabled={isPending}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            盡量帶數字，這是案例的賣點。
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="client_type">客戶類型</Label>
          <Input
            id="client_type"
            name="client_type"
            defaultValue={initial.clientType}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tech_stack">技術標籤</Label>
        <Input
          id="tech_stack"
          name="tech_stack"
          defaultValue={initial.techStack}
          disabled={isPending}
          className="font-mono"
        />
        <p className="text-xs text-muted-foreground">
          用逗號分隔，例如 Next.js, TypeScript, Supabase。全形逗號也可以。
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
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
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="live_url">網站網址</Label>
          <Input
            id="live_url"
            name="live_url"
            type="url"
            defaultValue={initial.liveUrl}
            disabled={isPending}
            className="font-mono"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="repo_url">原始碼網址</Label>
          <Input
            id="repo_url"
            name="repo_url"
            type="url"
            defaultValue={initial.repoUrl}
            disabled={isPending}
            className="font-mono"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-8">
        <div className="flex flex-col gap-2">
          <Label htmlFor="sort_order">排序</Label>
          <Input
            id="sort_order"
            name="sort_order"
            type="number"
            step={1}
            defaultValue={initial.sortOrder}
            disabled={isPending}
            className="w-28"
          />
          <p className="text-xs text-muted-foreground">數字小的排前面。</p>
          {fieldErrors?.sort_order ? (
            <p className="text-sm text-destructive">{fieldErrors.sort_order}</p>
          ) : null}
        </div>

        <div className="flex items-center gap-3 pb-1">
          <Switch
            id="featured"
            name="featured"
            defaultChecked={initial.featured}
            disabled={isPending}
          />
          <Label htmlFor="featured">首頁精選</Label>
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
          render={<Link href="/admin/projects">取消</Link>}
        />
      </div>
    </form>
  )
}
