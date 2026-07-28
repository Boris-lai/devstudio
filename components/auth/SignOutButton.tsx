"use client"

import { usePathname } from "next/navigation"

import { Button } from "@/components/ui/button"
import { signOut } from "@/lib/auth/actions"

/** 同 SignInButton：登出後留在原頁，需要 usePathname()。 */
export function SignOutButton() {
  const pathname = usePathname()

  return (
    <form action={signOut}>
      <input type="hidden" name="next" value={pathname} />
      <Button type="submit" variant="ghost" size="sm">
        登出
      </Button>
    </form>
  )
}
