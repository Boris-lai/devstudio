"use client"

import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { signInWithGoogle } from "@/lib/auth/actions"

/**
 * client component 只為了讀 usePathname()：登入完要導回使用者原本待的頁面，
 * 而 server component 沒有取得目前路徑的官方 API。
 */
export function SignInButton() {
  const pathname = usePathname()

  return (
    <form action={signInWithGoogle}>
      <input type="hidden" name="next" value={pathname} />
      <Button type="submit" variant="outline" size="sm">
        使用 Google 登入
      </Button>
    </form>
  )
}
