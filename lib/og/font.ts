/**
 * 為 OG 圖載入 Noto Sans TC 的「動態子集」字型。
 *
 * ImageResponse（satori）內建字型畫不出中文，會變成空白方塊，
 * 所以每張圖都要自己帶字型進去。完整的 Noto Sans TC 有好幾 MB，
 * 但 Google Fonts 的 `text=` 參數可以只切出這張圖用得到的那幾個字，
 * 通常只有幾 KB。
 *
 * ⚠️ 關鍵：**不要送現代瀏覽器的 User-Agent**。
 * Google 會依 UA 決定回傳格式 —— 送 Chrome UA 會拿到 woff2，
 * 而 satori 不支援 woff2，圖會整個生不出來或變成方塊。
 * 送舊版 UA 才會拿到 truetype。這點已實測驗證過。
 */
const GOOGLE_FONTS_CSS = "https://fonts.googleapis.com/css2"

/** 只接受 satori 吃得下的格式，避免 Google 哪天改行為時默默壞掉。 */
const FONT_SRC_PATTERN =
  /src:\s*url\((https:\/\/[^)]+)\)\s*format\('(?:truetype|opentype)'\)/

export async function loadNotoSansTCSubset(
  text: string,
  weight: 400 | 500 | 700 = 700,
): Promise<ArrayBuffer> {
  // 去重可以縮短 URL，字型子集的結果完全相同
  const uniqueText = [...new Set(text)].join("")

  const cssUrl = `${GOOGLE_FONTS_CSS}?family=Noto+Sans+TC:wght@${weight}&text=${encodeURIComponent(uniqueText)}`

  const cssResponse = await fetch(cssUrl, {
    headers: { "User-Agent": "Mozilla/4.0" },
  })

  if (!cssResponse.ok) {
    throw new Error(`取得字型 CSS 失敗：HTTP ${cssResponse.status}`)
  }

  const css = await cssResponse.text()
  const match = css.match(FONT_SRC_PATTERN)

  if (!match) {
    throw new Error(
      "字型 CSS 裡找不到 truetype/opentype 來源（Google 可能改回傳 woff2 了）",
    )
  }

  const fontResponse = await fetch(match[1])

  if (!fontResponse.ok) {
    throw new Error(`下載字型檔失敗：HTTP ${fontResponse.status}`)
  }

  return fontResponse.arrayBuffer()
}
