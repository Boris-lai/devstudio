"use client"

import { useActionState, useRef } from "react"

import { Button } from "@/components/ui/button"
import { addComment, type CommentActionResult } from "@/lib/comments/actions"

type FormState = CommentActionResult | null

export function CommentForm({ postId }: { postId: string }) {
  const formRef = useRef<HTMLFormElement>(null)

  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (_previous, formData) => {
      const content = formData.get("content")
      const result = await addComment(
        postId,
        typeof content === "string" ? content : "",
      )

      // 送出成功才清空，失敗時保留使用者打的字
      if (result.ok) {
        formRef.current?.reset()
      }

      return result
    },
    null,
  )

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <textarea
        name="content"
        required
        maxLength={5000}
        rows={4}
        disabled={isPending}
        placeholder="留個言吧⋯⋯"
        className="w-full resize-y rounded-[12px] border border-border bg-card px-4 py-3 text-sm leading-[1.75] text-foreground transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"
      />

      {state && !state.ok ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "送出中⋯" : "送出留言"}
        </Button>
      </div>
    </form>
  )
}
