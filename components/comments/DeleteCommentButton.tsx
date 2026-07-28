"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { deleteComment, type CommentActionResult } from "@/lib/comments/actions"

type FormState = CommentActionResult | null

export function DeleteCommentButton({ commentId }: { commentId: string }) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async () => deleteComment(commentId),
    null,
  )

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <Button
        type="submit"
        variant="ghost"
        size="xs"
        disabled={isPending}
        className="text-muted-foreground"
      >
        {isPending ? "刪除中⋯" : "刪除"}
      </Button>

      {state && !state.ok ? (
        <p className="text-xs text-destructive">{state.error}</p>
      ) : null}
    </form>
  )
}
