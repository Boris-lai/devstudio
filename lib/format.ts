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
 * 把 ISO 時間轉成 <input type="datetime-local"> 吃的「YYYY-MM-DDTHH:mm」，
 * 以 Asia/Taipei 呈現。表單送出後由 server action 補回 +08:00。
 */
export function toTaipeiDateTimeLocal(value: string | null): string {
  if (!value) return ""

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ""

  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`
}

const relativeFormatter = new Intl.RelativeTimeFormat("zh-TW", {
  numeric: "auto",
})

const RELATIVE_UNITS: readonly (readonly [
  Intl.RelativeTimeFormatUnit,
  number,
])[] = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", 30 * 24 * 60 * 60 * 1000],
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
]

/**
 * 相對時間（「3 天前」）。留言區用。
 *
 * 注意：這是在 server 端算的，基準是「render 當下」。文章頁是 dynamic
 * rendering，每次請求都重新計算，所以不會出現卡住的時間。
 */
export function formatRelativeTime(value: string | null): string | null {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  const diffMs = date.getTime() - Date.now()

  for (const [unit, unitMs] of RELATIVE_UNITS) {
    if (Math.abs(diffMs) >= unitMs) {
      return relativeFormatter.format(Math.round(diffMs / unitMs), unit)
    }
  }

  return "剛剛"
}

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
