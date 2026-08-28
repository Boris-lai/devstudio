/**
 * 免費模板的下載設定。
 *
 * 單獨一個模組而不是塞進 lib/site.ts：這是會常換的東西
 * （換檔案、換 bucket、之後可能換成 signed URL），
 * 跟站台的基本識別分開比較好找。
 */

/**
 * 下載連結：Supabase Storage 的 public bucket。
 *
 * 回應是 content-type: application/zip 且沒有 content-disposition，
 * 瀏覽器會直接下載而不是導頁 —— 這正是我們要的，所以前端那個 <a>
 * 不需要（也不能）靠 download 屬性，跨網域時它會被忽略。
 *
 * 檔名有空白，網址裡必須維持 %20 編碼，不要手動改回空白。
 *
 * 之後想控管下載的話，改成 private bucket + signed URL：
 * 那就不能寫死在這裡，要在 server action 裡呼叫 createSignedUrl()
 * 再把網址回傳給前端（signed URL 有到期時間，一定得每次請求現算）。
 */
export const TEMPLATE_DOWNLOAD_URL: string =
  "https://jmgcvzadpgtcqokmhbsu.supabase.co/storage/v1/object/public/covers/Ai%20Specflow.zip"

/**
 * 連結還沒設好時，成功畫面要顯示「準備中」而不是一個壞掉的按鈕。
 * 比照 lib/site.ts 的 IS_LINE_URL_SET。
 */
export const IS_TEMPLATE_DOWNLOAD_SET = TEMPLATE_DOWNLOAD_URL !== "#"
