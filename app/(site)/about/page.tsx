import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "關於",
}

export default function AboutPage() {
  return <h1 className="text-3xl font-semibold tracking-tight">關於</h1>
}
