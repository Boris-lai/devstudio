import { ImageResponse } from "next/og"

import { loadNotoSansTCSubset } from "@/lib/og/font"
import { OG_CONTENT_TYPE, OG_SIZE, OgCard, ogCardText } from "@/lib/og/template"
import { SITE_NAME } from "@/lib/site"

export const alt = `${SITE_NAME} — 一人全端接案`
export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

const CARD = {
  eyebrow: "全端開發 · 前端與產品接案",
  title: SITE_NAME,
  footer: "形象官網 · 管理系統 · 自動化表單 · 手機 App",
}

export default async function Image() {
  const fontData = await loadNotoSansTCSubset(ogCardText(CARD))

  return new ImageResponse(<OgCard {...CARD} />, {
    ...size,
    fonts: [
      { name: "Noto Sans TC", data: fontData, weight: 700, style: "normal" },
    ],
  })
}
