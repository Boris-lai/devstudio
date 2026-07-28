import type { ReactElement } from "react"

export const OG_SIZE = { width: 1200, height: 630 } as const
export const OG_CONTENT_TYPE = "image/png"

/**
 * DESIGN.md 第 1 節的亮色 token，這裡寫死成 hex。
 * satori 不吃 CSS 變數，也不吃 oklch()。
 */
const COLOR = {
  background: "#fbfbfa",
  foreground: "#1a1a19",
  muted: "#6f6f69",
  border: "#e6e6e1",
  primary: "#317093",
} as const

/** 標題越長字級越小，盡量不換到第三行。 */
function titleFontSize(title: string): number {
  if (title.length <= 16) return 76
  if (title.length <= 28) return 62
  return 50
}

/** 真的太長就截斷，避免溢出畫面。 */
function truncate(title: string, max = 52): string {
  return title.length > max ? `${title.slice(0, max - 1)}…` : title
}

export type OgCardInput = {
  eyebrow: string
  title: string
  footer: string
}

/** 三張 OG 圖共用的排版。回傳的文字集合要拿去切字型子集。 */
export function ogCardText({ eyebrow, title, footer }: OgCardInput): string {
  return eyebrow + truncate(title) + footer
}

export function OgCard({ eyebrow, title, footer }: OgCardInput): ReactElement {
  const displayTitle = truncate(title)

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: COLOR.background,
        padding: "72px 80px",
        // 左側一道板岩藍，是整張圖唯一的點綴色
        borderLeft: `16px solid ${COLOR.primary}`,
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 2,
            color: COLOR.primary,
          }}
        >
          {eyebrow}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: titleFontSize(displayTitle),
            lineHeight: 1.3,
            color: COLOR.foreground,
          }}
        >
          {displayTitle}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          fontSize: 28,
          color: COLOR.muted,
          borderTop: `2px solid ${COLOR.border}`,
          paddingTop: 28,
        }}
      >
        {footer}
      </div>
    </div>
  )
}
