import { createBrowserClient } from "@supabase/ssr"

import type { Database } from "@/types/database.types"

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env"

/**
 * Client Component 用的 Supabase client。
 *
 * cookie 存取由 @supabase/ssr 自行處理（fallback 到 document.cookie），
 * 所以不要自訂 cookies 選項。
 */
export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
}
