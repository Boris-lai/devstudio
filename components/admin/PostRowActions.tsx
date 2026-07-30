"use client"

import Link from "next/link"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { deletePost, togglePostPublished } from "@/lib/posts/actions"

/**
 * 列表每一列的操作：編輯、發布切換、刪除。
 *
 * 用 useTransition 而不是 useActionState —— 這兩個動作不吃表單欄位，
 * 只需要 pending 狀態與錯誤訊息。
 */
export function PostRowActions({
  id,
  title,
  published,
}: {
  id: string
  title: string
  published: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const runToggle = () => {
    setError(null)
    startTransition(async () => {
      const result = await togglePostPublished(id, !published)
      if (result.status === "error") setError(result.message)
    })
  }

  const runDelete = () => {
    // 刪除不可復原，先攔一道確認
    if (!window.confirm(`確定要刪除「${title}」？這個動作無法復原。`)) return

    setError(null)
    startTransition(async () => {
      const result = await deletePost(id)
      if (result.status === "error") setError(result.message)
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          render={<Link href={`/admin/posts/${id}/edit`}>編輯</Link>}
        />
        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={runToggle}
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
