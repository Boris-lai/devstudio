import Link from "next/link"

import { PostCard } from "@/components/blog/PostCard"
import { EmptyState } from "@/components/EmptyState"
import { Button } from "@/components/ui/button"
import { ProjectCard } from "@/components/work/ProjectCard"
import { getLatestPosts } from "@/lib/queries/posts"
import { getFeaturedProjects } from "@/lib/queries/projects"
import { getSiteSettings } from "@/lib/queries/site-settings"

/** 桌機三欄、窄螢幕收合單欄（DESIGN.md 第 7 節）。 */
const CARD_GRID = "grid grid-cols-1 gap-5.5 lg:grid-cols-3"

const EYEBROW = "font-mono text-xs tracking-[0.08em]"

/**
 * 接案狀態 badge（DESIGN.md 第 7 節）。
 * 開放時圓點帶一圈 glow ring，暫不接案則是安靜的 muted 圓點。
 */
function AvailabilityBadge({ acceptingWork }: { acceptingWork: boolean }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-2.5 rounded-full border border-border bg-card px-3.5 py-2 ${EYEBROW} text-muted-foreground`}
    >
      <span
        aria-hidden
        className={
          acceptingWork
            ? "size-1.5 rounded-full bg-primary shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_20%,transparent)]"
            : "size-1.5 rounded-full bg-muted-foreground"
        }
      />
      {acceptingWork ? "目前開放接案" : "暫不接案"}
    </span>
  )
}

/** 區塊 header 列：左邊 eyebrow + 大標，右邊 mono 的「看全部」連結。 */
function SectionHeader({
  eyebrow,
  title,
  href,
  linkLabel,
}: {
  eyebrow: string
  title: string
  href: string
  linkLabel: string
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="flex flex-col gap-2">
        <p className={`${EYEBROW} text-primary`}>{eyebrow}</p>
        <h2 className="text-[32px] leading-[1.3] font-bold tracking-tight">
          {title}
        </h2>
      </div>

      <Link
        href={href}
        className={`${EYEBROW} rounded-md whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50`}
      >
        {linkLabel}
      </Link>
    </div>
  )
}

export default async function HomePage() {
  const [featuredProjects, latestPosts, siteSettings] = await Promise.all([
    getFeaturedProjects(3),
    getLatestPosts(3),
    getSiteSettings(),
  ])

  return (
    <div className="flex flex-col gap-24">
      <section className="flex flex-col items-start gap-7 pt-6">
        <p className={`${EYEBROW} text-primary`}>
          全端開發 · 前端與產品接案
        </p>

        <div className="flex flex-col gap-6">
          <h1 className="max-w-205 text-[clamp(2.125rem,6.5vw,58px)] leading-[1.28] font-bold tracking-tight text-pretty">
            把你的生意流程，做成一個好維護、跑得快的網站
          </h1>

          <p className="max-w-155 text-[17px] leading-[1.85] text-muted-foreground">
            我是接案開發者，服務對象多半是小型商家與早期團隊。
            從需求訪談、系統設計到上線後維運都一手包辦，交付的是可以量測的成果 ——
            少一點抄單時間、多一則詢價，而不只是一份漂亮的畫面。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            className="h-auto rounded-lg px-5.5 py-3"
            nativeButton={false}
            render={<Link href="/about">聊聊你的專案</Link>}
          />
          <Button
            variant="outline"
            className="h-auto rounded-lg px-5.5 py-3"
            nativeButton={false}
            render={<Link href="/work">看作品 →</Link>}
          />
        </div>

        {siteSettings ? (
          <AvailabilityBadge acceptingWork={siteSettings.accepting_work} />
        ) : null}
      </section>

      <section className="flex flex-col gap-8">
        <SectionHeader
          eyebrow="近期案例"
          title="精選作品"
          href="/work"
          linkLabel="查看全部作品 →"
        />

        {featuredProjects.length === 0 ? (
          <EmptyState description="作品整理中，很快會放上來。" />
        ) : (
          <div className={CARD_GRID}>
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-8">
        <SectionHeader
          eyebrow="筆記與心得"
          title="最新文章"
          href="/blog"
          linkLabel="看更多文章 →"
        />

        {latestPosts.length === 0 ? (
          <EmptyState description="還沒有發布的文章，之後會陸續補上。" />
        ) : (
          <div className={CARD_GRID}>
            {latestPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      {/*
        結尾 CTA band。聯絡目的地屬 Chunk 8：
        「取得報價」先連 /about，LINE 與 email 先用 # 佔位。
      */}
      <section className="flex flex-col items-center gap-6 border-t border-border bg-muted px-6 py-16 text-center">
        <p className={`${EYEBROW} text-primary`}>開始合作</p>

        <div className="flex flex-col items-center gap-4">
          <h2 className="text-[32px] leading-[1.3] font-bold tracking-tight text-pretty">
            有專案想聊聊？
          </h2>
          <p className="max-w-155 text-[17px] leading-[1.85] text-muted-foreground">
            不論還在發想階段，或已經有明確規格，都歡迎找我。
            我會先了解你的實際流程與目標，再一起判斷值不值得做、怎麼做最省。
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button
            className="h-auto rounded-lg px-5.5 py-3"
            nativeButton={false}
            render={<Link href="/about">取得報價</Link>}
          />
          <Button
            variant="outline"
            className="h-auto rounded-lg px-5.5 py-3"
            nativeButton={false}
            render={<a href="#">加 LINE 聯絡</a>}
          />
        </div>

        <a
          href="#"
          className={`${EYEBROW} rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50`}
        >
          或直接寄信給我
        </a>
      </section>
    </div>
  )
}
