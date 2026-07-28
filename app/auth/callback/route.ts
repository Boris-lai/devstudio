import { NextResponse } from "next/server"

import { toSafeNextPath } from "@/lib/auth/safe-next"
import { resolveOrigin } from "@/lib/auth/site-url"
import { createClient } from "@/lib/supabase/server"

/**
 * Google OAuth 的 callback：拿 code 換 session，cookie 由 server client 的
 * setAll 寫進回應。
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const next = toSafeNextPath(searchParams.get("next"))

  // 必須跟 signInWithGoogle 算出同一個 origin，否則 cookie 會寫在不同網域上。
  const baseUrl = resolveOrigin(request.headers)

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/?auth_error=missing_code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${baseUrl}/?auth_error=exchange_failed`)
  }

  return NextResponse.redirect(`${baseUrl}${next}`)
}
