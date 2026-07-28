import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env"

/**
 * 每個請求刷新 Supabase session，並把更新後的 auth cookie 同時寫回
 * 「往下傳的 request」跟「回給瀏覽器的 response」。
 *
 * 由根目錄的 proxy.ts 呼叫（Next.js 16 起 middleware 慣例改名為 proxy）。
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        // 先寫進 request，下游的 Server Component 這次請求就讀得到新 token。
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value)
        }

        // 用更新後的 request headers 重建 response，再把 cookie 寫上去。
        supabaseResponse = NextResponse.next({
          request: { headers: request.headers },
        })

        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options)
        }

        // @supabase/ssr 給的 no-store 類 header，避免 CDN / reverse proxy
        // 把帶著別人 session cookie 的 response 快取起來。
        for (const [key, value] of Object.entries(headers)) {
          supabaseResponse.headers.set(key, value)
        }
      },
    },
  })

  // 一定要在產生 response 之前就呼叫：token refresh 若發生在 response 送出
  // 之後，新的 session 就寫不回 cookie 了。
  await supabase.auth.getClaims()

  return supabaseResponse
}
