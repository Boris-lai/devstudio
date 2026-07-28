// 站台只服務台灣讀者，時區寫死 Asia/Taipei。
// 不指定的話會跟著執行環境走（Vercel 上是 UTC），
// 台灣時間凌晨發的文在列表上會顯示成前一天。
const dateFormatter = new Intl.DateTimeFormat("zh-TW", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "Asia/Taipei",
})

/**
 * 粗估閱讀時間（DESIGN.md 第 6 節）：字數 / 500，四捨五入取分鐘，至少 1 分鐘。
 * 中文以字元數計算，沒有內容就回傳 null。
 */
export function estimateReadingMinutes(content: string | null): number | null {
  if (!content?.trim()) return null

  return Math.max(1, Math.round(content.trim().length / 500))
}

/** 把 timestamptz 格式化成中文日期；沒有日期就回傳 null 讓呼叫端自己決定怎麼呈現。 */
export function formatPublishedDate(value: string | null): string | null {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return dateFormatter.format(date)
}
