import { AuthStatus } from "@/components/auth/AuthStatus"
import { Footer } from "@/components/layout/Footer"
import { Header } from "@/components/layout/Header"
import { LineFloatingButton } from "@/components/layout/LineFloatingButton"
import { createClient } from "@/lib/supabase/server"

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient()

  // 用 getUser() 而不是 getSession()：getSession() 只讀 cookie，內容可被偽造；
  // getUser() 會回 Auth server 驗證這組 token 真的有效。
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <>
      <Header authSlot={<AuthStatus user={user} />} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6">
        {children}
      </main>
      <Footer />

      {/* 全站固定在右下角。掛在 (site) 而不是 root layout，後台就不會出現 */}
      <LineFloatingButton />
    </>
  )
}
