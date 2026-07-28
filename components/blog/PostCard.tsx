import Image from "next/image"
import Link from "next/link"

import { formatPublishedDate } from "@/lib/format"
import type { PostListItem } from "@/lib/queries/posts"

export function PostCard({ post }: { post: PostListItem }) {
  const publishedAt = formatPublishedDate(post.published_at)

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-[transform,border-color] duration-180 hover:-translate-y-0.75 hover:border-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {post.cover_url ? (
        <div className="relative h-40 w-full border-b border-border bg-muted">
          <Image
            src={post.cover_url}
            alt=""
            fill
            sizes="(min-width: 640px) 380px, 100vw"
            className="object-cover"
          />
        </div>
      ) : (
        // 無封面 fallback：文章卡只留乾淨的 surface-2 淡底
        <div
          aria-hidden
          className="h-40 w-full border-b border-border bg-muted"
        />
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h2 className="text-[17px] leading-[1.55] font-semibold">
          {post.title}
        </h2>

        {post.excerpt ? (
          <p className="line-clamp-2 text-sm leading-[1.75] text-muted-foreground">
            {post.excerpt}
          </p>
        ) : null}

        {publishedAt ? (
          <time
            dateTime={post.published_at ?? undefined}
            className="mt-auto pt-1 font-mono text-xs text-muted-foreground"
          >
            {publishedAt}
          </time>
        ) : null}
      </div>
    </Link>
  )
}
