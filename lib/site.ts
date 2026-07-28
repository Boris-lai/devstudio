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
  "Boris Lai — 五年經驗的一人全端開發者，接案製作形象官網、企業管理系統、自動化表單與手機 App，從設計到上線一手包辦。"

/** 把站內相對路徑組成絕對網址。 */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString()
}
