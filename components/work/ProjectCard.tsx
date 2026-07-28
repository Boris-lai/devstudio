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

        <TechPills items={project.tech_stack} className="mt-auto pt-1" />
      </div>
    </Link>
  )
}
