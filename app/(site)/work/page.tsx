import type { Metadata } from "next"

import { EmptyState } from "@/components/EmptyState"
import { ProjectCard } from "@/components/work/ProjectCard"
import { getPublishedProjects } from "@/lib/queries/projects"
import { absoluteUrl, DEFAULT_OG_IMAGE } from "@/lib/site"

export const metadata: Metadata = {
  title: "作品",
  description:
    "接案案例集：形象官網、企業管理系統、自動化表單與手機 App。每個案子都寫下我負責的部分、做法與可量測的成果。",
  alternates: { canonical: "/work" },
  openGraph: {
    type: "website",
    title: "作品 | Boris Lai 的工作室",
    description: "接案案例集：我在每個案子負責什麼、怎麼做、成果如何。",
    url: absoluteUrl("/work"),
    images: [DEFAULT_OG_IMAGE],
  },
}

export default async function WorkPage() {
  const projects = await getPublishedProjects()

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">作品</h1>
        <p className="text-muted-foreground">
          每個案子的角色分工、做法與成果。
        </p>
      </header>

      {projects.length === 0 ? (
        <EmptyState description="目前還沒有公開的作品，之後會陸續補上。" />
      ) : (
        <div className="grid gap-5.5 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
