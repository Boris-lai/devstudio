import type { Metadata } from "next"
import Link from "next/link"

import { ProjectRowActions } from "@/components/admin/ProjectRowActions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getAdminProjects } from "@/lib/queries/admin-projects"

export const metadata: Metadata = {
  title: "作品管理",
  robots: { index: false, follow: false },
}

const PILL = "h-auto rounded-full border-transparent px-2 py-0.5 text-[11px]"

export default async function AdminProjectsPage() {
  const projects = await getAdminProjects()

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">作品</h1>
          <p className="text-sm text-muted-foreground">
            共 {projects.length} 筆，含未發布的。依排序由小到大。
          </p>
        </div>

        <Button
          nativeButton={false}
          render={<Link href="/admin/projects/new">新增作品</Link>}
        />
      </header>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            還沒有任何作品。按右上角的「新增作品」開始。
          </p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
          {projects.map((project) => (
            <li
              key={project.id}
              className="flex flex-wrap items-center justify-between gap-4 p-4"
            >
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">
                    #{project.sort_order}
                  </span>
                  <span className="font-medium">{project.title}</span>

                  {project.published ? (
                    <Badge
                      className={`${PILL} bg-accent-soft font-normal text-primary`}
                    >
                      已發布
                    </Badge>
                  ) : (
                    <Badge
                      className={`${PILL} bg-muted font-normal text-muted-foreground`}
                    >
                      未發布
                    </Badge>
                  )}

                  {project.featured ? (
                    <Badge
                      className={`${PILL} bg-primary font-normal text-primary-foreground`}
                    >
                      精選
                    </Badge>
                  ) : null}
                </div>

                <p className="font-mono text-xs text-muted-foreground">
                  /work/{project.slug}
                </p>
              </div>

              <ProjectRowActions
                id={project.id}
                title={project.title}
                published={project.published}
                featured={project.featured}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
