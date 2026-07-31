import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { PostCard } from "@/components/blog/PostCard"
import { EmptyState } from "@/components/EmptyState"
import { Button } from "@/components/ui/button"
import { ProjectCard } from "@/components/work/ProjectCard"
import { getLatestPosts } from "@/lib/queries/posts"
import { getFeaturedProjects } from "@/lib/queries/projects"
import { getSiteSettings } from "@/lib/queries/site-settings"
import {
  DEFAULT_OG_IMAGE,
  LINE_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site"

export const metadata: Metadata = {
  // 首頁用 root 的預設標題，不套 "%s | ..." template
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: `${SITE_NAME} — 一人全端接案`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [DEFAULT_OG_IMAGE],
  },
}

const PERSON_DESCRIPTION =
  "五年前端工程師經驗，現在以一人全端的形式接案。從形象官網、員工管理系統、自動化表單回覆到手機 App，設計到上線一手包辦。"

const HOME_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: "zh-Hant-TW",
    },
    {
      "@type": "Person",
      name: "Boris Lai",
      jobTitle: "一人全端開發者",
      url: SITE_URL,
      description: PERSON_DESCRIPTION,
    },
  ],
}

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOME_JSON_LD) }}
      />

      {/*
        兩欄 hero：文字在左、示意圖在右。窄螢幕收合成單欄，
        DOM 順序讓圖片自然落在文字之後。
      */}
      <section className="grid items-center gap-10 pt-6 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
        <div className="flex flex-col items-start gap-7">
          <p className={`${EYEBROW} text-primary`}>全端開發 · 前端與產品接案</p>

          <div className="flex flex-col gap-6">
            <h1 className="text-[clamp(2.125rem,5vw,52px)] leading-[1.28] font-bold tracking-tight text-pretty">
              把你的生意流程，做成一個好維護、跑得快的網站
            </h1>

            <p className="text-[17px] leading-[1.85] text-muted-foreground">
              我是接案開發者，服務對象多半是小型商家與早期團隊。
              從需求訪談、系統設計到上線後維運都一手包辦，交付的是可以量測的成果
              —— 少一點抄單時間、多一則詢價，而不只是一份漂亮的畫面。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              className="h-auto rounded-lg px-5.5 py-3"
              nativeButton={false}
              render={<Link href="/about#contact">聊聊你的專案</Link>}
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
        </div>

        {/*
          圖片本身是淺色底，在深色模式下會變成一塊亮面 ——
          用邊框與圓角框住，讓它讀起來像刻意擺放的產品照而不是破圖。
          priority：這張在第一屏，不要等到捲動才載入。
        */}
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-border bg-muted shadow-xl shadow-black/10">
          <Image
            src="/hero-workflow.webp"
            alt="筆電上展開的多個介面設計稿與程式碼片段"
            fill
            sizes="(min-width: 1024px) 520px, 100vw"
            className="object-cover"
            priority
          />
        </div>
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

      {/* 結尾 CTA band。LINE 連結還沒拿到，暫時留 # 佔位。 */}
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
            render={<Link href="/about#contact">取得報價</Link>}
          />
          <Button
            variant="outline"
            className="h-auto rounded-lg px-5.5 py-3"
            nativeButton={false}
            render={<a href={LINE_URL}>加 LINE 聯絡</a>}
          />
        </div>

        <a
          href="mailto:borislai0713@gmail.com"
          className={`${EYEBROW} rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50`}
        >
          borislai0713@gmail.com
        </a>
      </section>
    </div>
  )
}
