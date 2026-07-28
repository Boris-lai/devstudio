import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { Markdown } from "@/components/markdown/Markdown"
import { Button } from "@/components/ui/button"
import { TechPills } from "@/components/work/TechPills"
import { getProjectBySlug } from "@/lib/queries/projects"

type WorkDetailPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: WorkDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project) {
    return { title: "找不到作品" }
  }

  return {
    title: project.title,
    description: project.summary ?? undefined,
  }
}

/** meta 欄位有值才顯示（DESIGN.md 第 5 節），沒值就整欄消失、不留空標籤。 */
function MetaItem({ label, value }: { label: string; value: string | null }) {
  if (!value) return null

  return (
    <div className="flex flex-col gap-1.5">
      <dt className="font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </dt>
      <dd className="text-[15px] leading-[1.7]">{value}</dd>
    </div>
  )
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project) {
    notFound()
  }

  const hasMeta = Boolean(project.role || project.client_type)
  const hasOutcome = Boolean(project.outcome)
  const hasTech = project.tech_stack.length > 0
  const hasLinks = Boolean(project.live_url || project.repo_url)

  // 全空邊界：案例資訊一項都沒有時整區省略，只渲染內文（DESIGN.md 第 5 節）
  const hasCaseDetails = hasMeta || hasOutcome || hasTech || hasLinks

  return (
    <article className="mx-auto flex w-full max-w-205 flex-col gap-10">
      <header className="flex flex-col gap-4">
        <h1 className="text-[32px] leading-[1.4] font-bold">{project.title}</h1>

        {project.summary ? (
          <p className="text-[17px] leading-[1.85] text-muted-foreground">
            {project.summary}
          </p>
        ) : null}
      </header>

      {project.cover_url ? (
        <div className="relative h-75 w-full overflow-hidden rounded-xl border border-border bg-muted">
          <Image
            src={project.cover_url}
            alt=""
            fill
            sizes="(min-width: 820px) 820px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <div
          aria-hidden
          className="h-75 w-full rounded-xl border border-border bg-muted"
        />
      )}

      {hasCaseDetails ? (
        <section className="flex flex-col gap-8">
          {hasMeta ? (
            <dl className="grid gap-8 sm:grid-cols-2">
              <MetaItem label="Role" value={project.role} />
              <MetaItem label="Client" value={project.client_type} />
            </dl>
          ) : null}

          {/* 案例的賣點，用 accent-soft 突出框拉出來 */}
          {project.outcome ? (
            <div className="rounded-[12px] border border-[color-mix(in_oklch,var(--primary)_22%,transparent)] bg-accent-soft px-[26px] py-[22px]">
              <p className="font-mono text-xs tracking-[0.08em] text-primary uppercase">
                成果 · OUTCOME
              </p>
              <p className="mt-2.5 text-[19px] leading-[1.6] font-semibold">
                {project.outcome}
              </p>
            </div>
          ) : null}

          <TechPills items={project.tech_stack} />

          {hasLinks ? (
            <div className="flex flex-wrap gap-3">
              {project.live_url ? (
                <Button
                  className="h-auto rounded-lg px-[22px] py-3"
                  nativeButton={false}
                  render={
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      查看網站 ↗
                    </a>
                  }
                />
              ) : null}

              {project.repo_url ? (
                <Button
                  variant="outline"
                  className="h-auto rounded-lg px-[22px] py-3"
                  nativeButton={false}
                  render={
                    <a
                      href={project.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      原始碼 ↗
                    </a>
                  }
                />
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      {hasCaseDetails && project.content ? (
        <hr className="border-border" />
      ) : null}

      <Markdown content={project.content} className="max-w-170" />

      <div>
        <Link
          href="/work"
          className="rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          ← 回作品列表
        </Link>
      </div>
    </article>
  )
}
