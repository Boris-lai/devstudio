/**
 * 由標題產生 slug。
 *
 * **保留中文字元**（CJK 統一表意文字），刻意不做音譯或整段剝除。
 * 理由：站台是純中文的，純中文標題若把 CJK 剝掉會得到空字串，
 * 等於每篇都要手動打 slug。UTF-8 網址是合法的，瀏覽器顯示時也會解碼還原。
 * 代價是複製出來的連結會是 percent-encoded 的長字串 —— 所以表單裡的
 * slug 欄位一定保持可手動覆寫，想要純 ASCII 網址就自己填。
 *
 * 用明確的 \uXXXX 範圍而不是 \p{Letter}：後者是 ES2018 的
 * Unicode property escape，而本專案的 tsconfig target 是 ES2017。
 */
const CJK_RANGES = "一-鿿豈-﫿"

export function slugify(title: string): string {
  return title
    .normalize("NFKC")
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(new RegExp(`[^a-z0-9${CJK_RANGES}-]+`, "g"), "")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
}
