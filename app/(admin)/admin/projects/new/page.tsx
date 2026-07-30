import type { Metadata } from "next"

import { EMPTY_PROJECT_FORM, ProjectForm } from "@/components/admin/ProjectForm"
import { createProject } from "@/lib/projects/actions"

export const metadata: Metadata = {
  title: "新增作品",
  robots: { index: false, follow: false },
}

export default function NewProjectPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold tracking-tight">新增作品</h1>

      <ProjectForm
        action={createProject}
        initial={EMPTY_PROJECT_FORM}
        submitLabel="建立"
        autoSlug
      />
    </div>
  )
}
