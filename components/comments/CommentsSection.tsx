import { SignInButton } from "@/components/auth/SignInButton"
import { CommentForm } from "@/components/comments/CommentForm"
import { CommentList } from "@/components/comments/CommentList"
import { isCurrentUserAdmin } from "@/lib/auth/is-admin"
import { getCommentsByPostId } from "@/lib/queries/comments"
import { createClient } from "@/lib/supabase/server"

/**
 * 文章底部的留言區（server component）。
 * 刻意放在 <Markdown> 的 prose 容器之外 —— 這裡是 UI，不是文章內文。
 */
export async function CommentsSection({ postId }: { postId: string }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [comments, isAdmin] = await Promise.all([
    getCommentsByPostId(postId),
    user ? isCurrentUserAdmin() : Promise.resolve(false),
  ])

  return (
    <section className="flex flex-col gap-6 border-t border-border pt-10">
      <h2 className="text-xl font-semibold tracking-tight">
        留言
        {comments.length > 0 ? (
          <span className="ml-2 font-mono text-sm font-normal text-muted-foreground">
            {comments.length}
          </span>
        ) : null}
      </h2>

      <CommentList
        comments={comments}
        currentUserId={user?.id ?? null}
        isAdmin={isAdmin}
      />

      {user ? (
        <CommentForm postId={postId} />
      ) : (
        <div className="flex flex-col items-start gap-3 rounded-[12px] border border-border bg-muted px-4 py-5">
          <p className="text-sm text-muted-foreground">登入後即可留言。</p>
          <SignInButton />
        </div>
      )}
    </section>
  )
}
