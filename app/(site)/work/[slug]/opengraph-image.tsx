import { ImageResponse } from "next/og"

import { loadNotoSansTCSubset } from "@/lib/og/font"
import { OG_CONTENT_TYPE, OG_SIZE, OgCard, ogCardText } from "@/lib/og/template"
import { getProjectBySlug } from "@/lib/queries/projects"
import { SITE_NAME } from "@/lib/site"
import { decodeSlugParam } from "@/lib/slug"

export const alt = `作品 | ${SITE_NAME}`
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug: rawSlug } = await params
  const slug = decodeSlugParam(rawSlug)
  const project = await getProjectBySlug(slug)

  const card = {
    eyebrow: "作品案例",
    title: project?.title ?? SITE_NAME,
    footer: SITE_NAME,
  }

  const fontData = await loadNotoSansTCSubset(ogCardText(card))

  return new ImageResponse(<OgCard {...card} />, {
    ...size,
    fonts: [
      { name: "Noto Sans TC", data: fontData, weight: 700, style: "normal" },
    ],
  })
}
