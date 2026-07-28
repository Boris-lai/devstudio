import type { Metadata } from "next"

import { PostCard } from "@/components/blog/PostCard"
import { EmptyState } from "@/components/EmptyState"
import { getPublishedPosts } from "@/lib/queries/posts"

export const metadata: Metadata = {
  title: "文章",
}

export default async function BlogPage() {
  const posts = await getPublishedPosts()

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">文章</h1>
        <p className="text-muted-foreground">
          接案途中踩過的坑、用得上的做法。
        </p>
      </header>

      {posts.length === 0 ? (
        <EmptyState description="還沒有發布的文章，之後會陸續補上。" />
      ) : (
        <div className="grid gap-5.5 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
