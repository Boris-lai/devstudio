import type { Metadata } from "next"
import Link from "next/link"

import { PostRowActions } from "@/components/admin/PostRowActions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPublishedDate } from "@/lib/format"
import { getAdminPosts } from "@/lib/queries/admin-posts"

export const metadata: Metadata = {
  title: "文章管理",
  robots: { index: false, follow: false },
}

export default async function AdminPostsPage() {
  const posts = await getAdminPosts()

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">文章</h1>
          <p className="text-sm text-muted-foreground">
            共 {posts.length} 篇，含未發布的草稿。
          </p>
        </div>

        <Button
          nativeButton={false}
          render={<Link href="/admin/posts/new">新增文章</Link>}
        />
      </header>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            還沒有任何文章。按右上角的「新增文章」開始。
          </p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
          {posts.map((post) => {
            const publishedAt = formatPublishedDate(post.published_at)

            return (
              <li
                key={post.id}
                className="flex flex-wrap items-center justify-between gap-4 p-4"
              >
                <div className="flex min-w-0 flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{post.title}</span>
                    {post.published ? (
                      <Badge className="h-auto rounded-full border-transparent bg-accent-soft px-2 py-0.5 text-[11px] font-normal text-primary">
                        已發布
                      </Badge>
                    ) : (
                      <Badge className="h-auto rounded-full border-transparent bg-muted px-2 py-0.5 text-[11px] font-normal text-muted-foreground">
                        草稿
                      </Badge>
                    )}
                  </div>

                  <p className="font-mono text-xs text-muted-foreground">
                    /blog/{post.slug}
                    {publishedAt ? ` · ${publishedAt}` : " · 尚無發布日期"}
                  </p>
                </div>

                <PostRowActions
                  id={post.id}
                  title={post.title}
                  published={post.published}
                />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
