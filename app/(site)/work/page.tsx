import type { Metadata } from "next"

import { EmptyState } from "@/components/EmptyState"
import { ProjectCard } from "@/components/work/ProjectCard"
import { getPublishedProjects } from "@/lib/queries/projects"

export const metadata: Metadata = {
  title: "作品",
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
