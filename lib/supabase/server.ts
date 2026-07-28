import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

import type { Database } from "@/types/database.types"

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env"

/**
 * Server Component / Route Handler / Server Action 用的 Supabase client。
 *
 * 每次請求都要重新呼叫，不要把回傳值放到模組層變數共用，否則會跨請求
 * 洩漏 session。
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Server Component render 期間不能寫 cookie，Next.js 會丟錯。
          // 這裡吞掉是安全的：根目錄 proxy.ts 已經在每個請求刷新 session
          // 並把新 cookie 寫回 response。
        }
      },
    },
  })
}
