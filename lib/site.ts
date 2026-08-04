/**
 * 站台對外的絕對網址，metadata / sitemap / robots / JSON-LD 都用它。
 *
 * 刻意直接寫出 process.env.NEXT_PUBLIC_SITE_URL 的字面值：
 * Next.js 只替換字面形式的存取，動態存取在瀏覽器 bundle 會變成 undefined。
 *
 * 未設定時 fallback 到 localhost，這樣本機開發不用先配環境變數；
 * 但部署前一定要設成正式網域，否則 sitemap 與 canonical 會指到 localhost。
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

export const SITE_NAME = "Boris Lai 的工作室"

export const SITE_DESCRIPTION =
  "Boris Lai — 三年經驗的一人全端開發者，接案製作形象官網、企業管理系統、自動化表單與手機 App，從設計到上線一手包辦。"

/**
 * 站台預設 OG 圖（由 app/opengraph-image.tsx 產生）。
 *
 * 為什麼要明確引用：Next.js 的 metadata 合併是「整個 openGraph 物件被子層取代」，
 * 只要頁面自己定義了 openGraph，從上層繼承來的 images（包含 opengraph-image
 * 檔案慣例自動加上的那張）就會整個消失。所以凡是自訂 openGraph 的頁面，
 * 都要自己把 images 補回來。
 *
 * 內頁（work/[slug]、blog/[slug]）不需要用這個常數 ——
 * 它們有同層的 opengraph-image.tsx，會自動接上各自的動態圖。
 */
export const DEFAULT_OG_IMAGE = "/opengraph-image"

/**
 * LINE 官方帳號連結。
 *
 * TODO: 換成真正的連結（例如 https://line.me/ti/p/~你的ID）。
 * 首頁 CTA band 的「加 LINE 聯絡」與右下角的浮動按鈕都讀這個常數，
 * 集中在一處是為了之後只要改這裡、不用兩邊找。
 */
export const LINE_URL = "#"

/** 連結還沒設定好，用來決定要不要開新分頁、以及要不要標成外部連結。 */
export const IS_LINE_URL_SET = LINE_URL !== "#"

/** 把站內相對路徑組成絕對網址。 */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString()
}
