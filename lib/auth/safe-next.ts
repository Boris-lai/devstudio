/**
 * 只接受站內的相對路徑。
 * 若放行外部網址，攻擊者可以構造 ?next=https://evil.example 讓登入流程
 * 把使用者導到站外（open redirect）。
 *
 * 放在獨立模組是因為 "use server" 的檔案只能匯出 async 函式，
 * 這個同步的小工具沒辦法跟 server action 放同一支。
 */
export function toSafeNextPath(value: string | null | undefined): string {
  if (typeof value !== "string" || value.length === 0) return "/"
  // 開頭必須是單一斜線；"//evil.com" 會被瀏覽器當成 protocol-relative 的外部網址
  if (!value.startsWith("/") || value.startsWith("//")) return "/"
  return value
}
