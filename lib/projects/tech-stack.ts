/**
 * tech_stack 在表單上是逗號分隔的字串，資料庫欄位是 text[]。
 *
 * 全形逗號一起吃：中文輸入法很容易打成「，」，只認半角的話整串會變成
 * 一個標籤。欄位是 not null default '{}'，所以沒填就是空陣列而不是 null。
 *
 * 抽成獨立模組是為了能單獨測試 —— 放在 "use server" 檔案裡的私有函式
 * 沒辦法直接呼叫（那種檔案只能匯出 async 函式）。
 */
export function parseTechStack(raw: string): string[] {
  return raw
    .split(/[,，]/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
}

/** 讀回編輯表單時把陣列轉回逗號字串。 */
export function formatTechStack(items: readonly string[]): string {
  return items.join(", ")
}
