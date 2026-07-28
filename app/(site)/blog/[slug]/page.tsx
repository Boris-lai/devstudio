import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { CommentsSection } from "@/components/comments/CommentsSection"
import { Markdown } from "@/components/markdown/Markdown"
import { estimateReadingMinutes, formatPublishedDate } from "@/lib/format"
import { getPostBySlug } from "@/lib/queries/posts"

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return { title: "找不到文章" }
  }

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
  }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const publishedAt = formatPublishedDate(post.published_at)
  const readingMinutes = estimateReadingMinutes(post.content)

  return (
    <article className="mx-auto flex w-full max-w-170 flex-col gap-8">
      <header className="flex flex-col gap-4">
        {publishedAt || readingMinutes ? (
          <p className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            {publishedAt ? (
              <time dateTime={post.published_at ?? undefined}>
                {publishedAt}
              </time>
            ) : null}
            {publishedAt && readingMinutes ? <span>·</span> : null}
            {readingMinutes ? <span>約 {readingMinutes} 分鐘</span> : null}
          </p>
        ) : null}

        <h1 className="text-4xl leading-[1.4] font-bold">{post.title}</h1>
      </header>

      {post.cover_url ? (
        <div className="relative h-80 w-full overflow-hidden rounded-xl border border-border bg-muted">
          <Image
            src={post.cover_url}
            alt=""
            fill
            sizes="(min-width: 680px) 680px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      ) : null}

      <Markdown content={post.content} />

      <CommentsSection postId={post.id} />

      <div>
        <Link
          href="/blog"
          className="rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          ← 回文章列表
        </Link>
      </div>
    </article>
  )
}
