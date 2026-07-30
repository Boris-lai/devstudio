import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PostForm } from "@/components/admin/PostForm"
import { toTaipeiDateTimeLocal } from "@/lib/format"
import { updatePost } from "@/lib/posts/actions"
import { getAdminPostById } from "@/lib/queries/admin-posts"

export const metadata: Metadata = {
  title: "編輯文章",
  robots: { index: false, follow: false },
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const post = await getAdminPostById(id)

  if (!post) {
    notFound()
  }

  // updatePost 的第一個參數是 id，bind 之後才符合 useActionState 的
  // (prevState, formData) 形狀
  const action = updatePost.bind(null, post.id)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">編輯文章</h1>
        <p className="font-mono text-xs text-muted-foreground">
          /blog/{post.slug}
        </p>
      </div>

      <PostForm
        action={action}
        initial={{
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt ?? "",
          content: post.content ?? "",
          coverUrl: post.cover_url ?? "",
          published: post.published,
          publishedAtLocal: toTaipeiDateTimeLocal(post.published_at),
        }}
        submitLabel="儲存"
        autoSlug={false}
      />
    </div>
  )
}
