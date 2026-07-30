import { TrendingUp } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { TechPills } from "@/components/work/TechPills"
import type { ProjectListItem } from "@/lib/queries/projects"

export function ProjectCard({ project }: { project: ProjectListItem }) {
  return (
    <Link
      href={`/work/${project.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-[transform,border-color] duration-180 hover:-translate-y-0.75 hover:border-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {project.cover_url ? (
        <div className="relative h-43 w-full border-b border-border bg-muted">
          <Image
            src={project.cover_url}
            alt=""
            fill
            sizes="(min-width: 640px) 380px, 100vw"
            className="object-cover"
          />
        </div>
      ) : (
        // 無封面 fallback：surface-2 底 + 置中的標題首字，板岩藍淡出
        <div
          aria-hidden
          className="flex h-43 w-full items-center justify-center border-b border-border bg-muted"
        >
          <span className="text-5xl font-semibold text-primary opacity-55">
            {project.title.slice(0, 1)}
          </span>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h2 className="text-[17px] leading-[1.55] font-semibold">
          {project.title}
        </h2>

        {project.summary ? (
          <p className="line-clamp-2 text-sm leading-[1.75] text-muted-foreground">
            {project.summary}
          </p>
        ) : null}

        {/*
          成果 chip：案例的賣點，拉到卡片上當誘因。
          outcome 通常帶數字且可能很長，這裡單行截斷避免撐版；
          完整內容在內頁的 OUTCOME 突出框裡。
        */}
        {project.outcome ? (
          <div className="flex w-fit max-w-full items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 font-mono text-xs text-primary">
            <TrendingUp aria-hidden className="size-3 shrink-0" />
            <span className="min-w-0 truncate">{project.outcome}</span>
          </div>
        ) : null}

        <TechPills items={project.tech_stack} />

        {/*
          行動提示。整張卡本來就是 <a>，這裡刻意用 span 而非連結，
          避免巢狀 <a>；hover 效果由外層卡片負責。
        */}
        <span className="mt-auto pt-1 font-mono text-xs text-primary">
          看完整案例 →
        </span>
      </div>
    </Link>
  )
}
