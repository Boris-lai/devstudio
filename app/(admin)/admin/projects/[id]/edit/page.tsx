import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ProjectForm } from "@/components/admin/ProjectForm"
import { updateProject } from "@/lib/projects/actions"
import { formatTechStack } from "@/lib/projects/tech-stack"
import { getAdminProjectById } from "@/lib/queries/admin-projects"

export const metadata: Metadata = {
  title: "編輯作品",
  robots: { index: false, follow: false },
}

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await getAdminProjectById(id)

  if (!project) {
    notFound()
  }

  // updateProject 的第一個參數是 id，bind 之後才符合 useActionState 的
  // (prevState, formData) 形狀
  const action = updateProject.bind(null, project.id)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">編輯作品</h1>
        <p className="font-mono text-xs text-muted-foreground">
          /work/{project.slug}
        </p>
      </div>

      <ProjectForm
        action={action}
        initial={{
          title: project.title,
          slug: project.slug,
          summary: project.summary ?? "",
          content: project.content ?? "",
          role: project.role ?? "",
          outcome: project.outcome ?? "",
          clientType: project.client_type ?? "",
          // 陣列讀回來轉成逗號字串預填
          techStack: formatTechStack(project.tech_stack),
          coverUrl: project.cover_url ?? "",
          liveUrl: project.live_url ?? "",
          repoUrl: project.repo_url ?? "",
          featured: project.featured,
          sortOrder: project.sort_order,
          published: project.published,
        }}
        submitLabel="儲存"
        autoSlug={false}
      />
    </div>
  )
}
