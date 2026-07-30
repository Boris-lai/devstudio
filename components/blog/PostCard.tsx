import Image from "next/image"
import Link from "next/link"

import { formatPublishedDate } from "@/lib/format"
import type { PostListItem } from "@/lib/queries/posts"

/**
 * 文章卡走「編輯感」：以文字為主，刻意與作品卡的櫥窗式結構區隔
 * （作品卡是封面在上、圖先於字）。詳見 DESIGN.md 第 4 節。
 *
 * 結構：日期 eyebrow → 標題 → 摘要 →（次要的封面，若有）→ 閱讀全文
 */
export function PostCard({ post }: { post: PostListItem }) {
  const publishedAt = formatPublishedDate(post.published_at)

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-6 transition-[transform,border-color] duration-180 hover:-translate-y-0.75 hover:border-primary focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      {/* 日期當 eyebrow：板岩藍 mono 小標，不再是壓在底部的灰色時間 */}
      {publishedAt ? (
        <time
          dateTime={post.published_at ?? undefined}
          className="font-mono text-xs tracking-[0.08em] text-primary"
        >
          {publishedAt}
        </time>
      ) : null}

      <h2 className="text-xl leading-[1.45] font-semibold">{post.title}</h2>

      {post.excerpt ? (
        <p className="line-clamp-3 text-sm leading-[1.8] text-muted-foreground">
          {post.excerpt}
        </p>
      ) : null}

      {/*
        封面刻意降級為次要元素：矮圖、放在文字之後。
        沒有封面時整塊不渲染 —— 不放佔位方塊，這是與作品卡首字母 fallback
        最明顯的區隔。
      */}
      {post.cover_url ? (
        <div className="relative h-32 w-full overflow-hidden rounded-lg border border-border bg-muted">
          <Image
            src={post.cover_url}
            alt=""
            fill
            sizes="(min-width: 640px) 380px, 100vw"
            className="object-cover"
          />
        </div>
      ) : null}

      {/*
        行動點。整張卡本來就是 <a>，這裡用 span 避免巢狀 <a>，
        比照作品卡的做法；hover 效果由外層卡片負責。
        靠左對齊，順著閱讀方向。
      */}
      <span className="mt-auto pt-1 font-mono text-xs text-primary">
        閱讀全文 →
      </span>
    </Link>
  )
}
