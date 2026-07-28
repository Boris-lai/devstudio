/**
 * Supabase 連線設定，讀 .env.local。
 *
 * 這裡刻意「直接寫出」`process.env.NEXT_PUBLIC_*` 的完整字面值：Next.js 只會
 * 在建置時替換字面形式的存取，動態存取（例如 process.env[key]）在瀏覽器
 * bundle 裡會變成 undefined。
 */
function readEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `缺少環境變數 ${name}。請在 .env.local 設定後重新啟動 dev server。`,
    )
  }
  return value
}

export const SUPABASE_URL = readEnv(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
)

export const SUPABASE_ANON_KEY = readEnv(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
)
