import { DeleteCommentButton } from "@/components/comments/DeleteCommentButton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatRelativeTime } from "@/lib/format"
import type { CommentWithAuthor } from "@/lib/queries/comments"

function CommentItem({
  comment,
  canDelete,
}: {
  comment: CommentWithAuthor
  canDelete: boolean
}) {
  const displayName = comment.author?.display_name?.trim() || "匿名讀者"
  const avatarUrl = comment.author?.avatar_url ?? null
  const relativeTime = formatRelativeTime(comment.created_at)

  return (
    <li className="flex gap-3 border-b border-border pb-6 last:border-b-0 last:pb-0">
      <Avatar size="sm" className="mt-0.5">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
        <AvatarFallback>{displayName.slice(0, 1)}</AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{displayName}</span>
          {relativeTime ? (
            <time
              dateTime={comment.created_at}
              className="font-mono text-xs text-muted-foreground"
            >
              {relativeTime}
            </time>
          ) : null}
        </div>

        {/* 使用者輸入的純文字，保留換行但不做 markdown 渲染 */}
        <p className="text-sm leading-[1.75] whitespace-pre-wrap">
          {comment.content}
        </p>
      </div>

      {canDelete ? <DeleteCommentButton commentId={comment.id} /> : null}
    </li>
  )
}

export function CommentList({
  comments,
  currentUserId,
  isAdmin,
}: {
  comments: CommentWithAuthor[]
  currentUserId: string | null
  isAdmin: boolean
}) {
  if (comments.length === 0) {
    return (
      <p className="rounded-[12px] border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
        還沒有留言。
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-6">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          // 只是決定要不要顯示按鈕；真正的權限把關在 RLS
          canDelete={isAdmin || comment.user_id === currentUserId}
        />
      ))}
    </ul>
  )
}
