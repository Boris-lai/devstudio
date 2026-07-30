import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { ReadingProgress } from "@/components/blog/ReadingProgress"
import { CommentsSection } from "@/components/comments/CommentsSection"
import { Markdown } from "@/components/markdown/Markdown"
import { estimateReadingMinutes, formatPublishedDate } from "@/lib/format"
import { getPostBySlug } from "@/lib/queries/posts"
import { absoluteUrl, SITE_NAME } from "@/lib/site"

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

  // excerpt 可能是空字串（seed 資料就有這種），空字串當作沒有描述
  const description = post.excerpt?.trim() ? post.excerpt : undefined
  const url = absoluteUrl(`/blog/${post.slug}`)

  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url,
      publishedTime: post.published_at ?? undefined,
      // 不指定 images：交給同層的 opengraph-image.tsx 產生動態 OG 圖。
      // 這裡若明確給值會蓋掉檔案慣例。
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
    },
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt?.trim() ? post.excerpt : undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    url: absoluteUrl(`/blog/${post.slug}`),
    image: post.cover_url ?? undefined,
    author: { "@type": "Person", name: "Boris Lai" },
    publisher: { "@type": "Organization", name: SITE_NAME },
  }

  return (
    <article className="mx-auto flex w-full max-w-170 flex-col gap-8">
      <ReadingProgress />

      {/* JSON.stringify 會把 undefined 欄位自動略掉，不會輸出 null */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="flex flex-col gap-4">
        {publishedAt || readingMinutes ? (
          <p className="flex items-center gap-2 font-mono text-xs tracking-[0.08em] text-primary">
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

        {/* 標題下方的短分隔線，取代原本直接接內容的空白 */}
        <div aria-hidden className="h-0.75 w-11 bg-primary" />
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
