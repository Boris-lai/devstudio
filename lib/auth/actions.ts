"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { toSafeNextPath } from "@/lib/auth/safe-next"
import { resolveOrigin } from "@/lib/auth/site-url"
import { createClient } from "@/lib/supabase/server"

function readNext(formData: FormData): string {
  const raw = formData.get("next")
  return toSafeNextPath(typeof raw === "string" ? raw : null)
}

export async function signInWithGoogle(formData: FormData) {
  const next = readNext(formData)
  const origin = resolveOrigin(await headers())
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })

  // redirect() 是靠 throw 運作的，必須寫在 try/catch 之外，否則會被吞掉。
  if (error || !data.url) {
    redirect("/?auth_error=sign_in_failed")
  }

  redirect(data.url)
}

export async function signOut(formData: FormData) {
  const next = readNext(formData)
  const supabase = await createClient()

  await supabase.auth.signOut()

  redirect(next)
}
