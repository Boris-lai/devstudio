import { Footer } from "@/components/layout/Footer"
import { Header } from "@/components/layout/Header"

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-12 sm:px-6">
        {children}
      </main>
      <Footer />
    </>
  )
}
