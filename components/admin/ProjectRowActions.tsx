"use client"

import Link from "next/link"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  deleteProject,
  toggleProjectFeatured,
  toggleProjectPublished,
} from "@/lib/projects/actions"

/**
 * 列表每一列的操作：編輯、發布切換、精選切換、刪除。
 * 比照文章列表用 useTransition —— 這些動作不吃表單欄位。
 */
export function ProjectRowActions({
  id,
  title,
  published,
  featured,
}: {
  id: string
  title: string
  published: boolean
  featured: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const run = (task: () => Promise<{ status: string; message?: string }>) => {
    setError(null)
    startTransition(async () => {
      const result = await task()
      if (result.status === "error") setError(result.message ?? "操作失敗。")
    })
  }

  const runDelete = () => {
    // 刪除不可復原，先攔一道確認
    if (!window.confirm(`確定要刪除「${title}」？這個動作無法復原。`)) return
    run(() => deleteProject(id))
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href={`/admin/projects/${id}/edit`}>編輯</Link>}
        />
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() => run(() => toggleProjectFeatured(id, !featured))}
        >
          {featured ? "取消精選" : "設為精選"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={() => run(() => toggleProjectPublished(id, !published))}
        >
          {published ? "取消發布" : "發布"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={runDelete}
          className="text-destructive"
        >
          刪除
        </Button>
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
