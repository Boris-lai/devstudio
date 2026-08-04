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

/**
 * 把網址上的 dynamic segment 還原成資料庫裡的 slug。
 *
 * **page component 拿到的 params 是還沒解碼的原字串**（route handler 反而是
 * 解碼過的，兩者不一致，很容易誤判）。中文 slug 在網址上是 percent-encoded，
 * 不先解碼就會拿 "%E7%B6%B2..." 去比對資料庫，永遠查無資料 → 整篇 404。
 * 純 ASCII 的 slug 不會踩到，所以只有中文標題的文章會出事。
 *
 * 對已經解碼過的字串再解一次是安全的：slugify() 的允許字元裡沒有 %，
 * 解出來的結果不可能再含有跳脫序列。
 *
 * 網址被亂填成 %zz 這種非法序列時 decodeURIComponent 會丟錯，
 * 這裡接住並回傳原字串，讓它照常查不到、走正常的 404。
 */
export function decodeSlugParam(raw: string): string {
  try {
    return decodeURIComponent(raw)
  } catch {
    return raw
  }
}
