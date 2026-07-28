import type { User } from "@supabase/supabase-js"

import { SignInButton } from "@/components/auth/SignInButton"
import { SignOutButton } from "@/components/auth/SignOutButton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

/**
 * Google 登入後，顯示名稱與頭像放在 user_metadata。
 * 不同 provider 的欄位名不一致，full_name / name 都試一次，
 * 最後退回 email 帳號的前半段。
 */
function readDisplayName(user: User): string {
  const metadata = user.user_metadata
  const fullName = metadata.full_name
  if (typeof fullName === "string" && fullName.trim()) return fullName

  const name = metadata.name
  if (typeof name === "string" && name.trim()) return name

  return user.email?.split("@")[0] ?? "使用者"
}

function readAvatarUrl(user: User): string | null {
  const avatarUrl = user.user_metadata.avatar_url
  return typeof avatarUrl === "string" && avatarUrl ? avatarUrl : null
}

export function AuthStatus({ user }: { user: User | null }) {
  if (!user) {
    return <SignInButton />
  }

  const displayName = readDisplayName(user)
  const avatarUrl = readAvatarUrl(user)

  return (
    <div className="flex items-center gap-2">
      <Avatar size="sm">
        {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
        <AvatarFallback>{displayName.slice(0, 1)}</AvatarFallback>
      </Avatar>

      <span className="hidden text-sm text-muted-foreground sm:inline">
        {displayName}
      </span>

      <SignOutButton />
    </div>
  )
}
