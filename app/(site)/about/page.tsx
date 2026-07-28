import type { Metadata } from "next"

import { Testimonials } from "@/components/about/Testimonials"
import { InquiryForm } from "@/components/contact/InquiryForm"
import { getPublishedTestimonials } from "@/lib/queries/testimonials"
import { absoluteUrl, DEFAULT_OG_IMAGE } from "@/lib/site"

export const metadata: Metadata = {
  title: "關於",
  description:
    "五年前端工程師經驗，現在以一人全端的形式接案。從形象官網、企業管理系統、自動化表單到手機 App，設計到上線一手包辦。",
  alternates: { canonical: "/about" },
  openGraph: {
    type: "profile",
    title: "關於 | Boris Lai 的工作室",
    description:
      "五年前端工程師經驗，現在以一人全端的形式接案。設計到上線一手包辦，溝通不用轉手。",
    url: absoluteUrl("/about"),
    images: [DEFAULT_OG_IMAGE],
  },
}

const SERVICES = [
  {
    title: "從零開始的網站",
    body: "官網、產品型錄、線上預訂。從需求訪談、資訊架構到上線，一個人接完整條線，不用你在多個窗口之間轉述。",
  },
  {
    title: "既有網站重寫",
    body: "舊站太慢、改不動、沒人維護。我會先評估值不值得重寫，再決定是整包重來還是逐步替換。",
  },
  {
    title: "內部流程工具",
    body: "還在用 Excel 或 LINE 手動接單的流程，做成一個夠簡單、同事願意用的後台。",
  },
]

export default async function AboutPage() {
  const testimonials = await getPublishedTestimonials()

  return (
    <div className="mx-auto flex w-full max-w-205 flex-col gap-16">
      <section className="flex flex-col gap-6">
        <h1 className="text-[32px] leading-[1.4] font-bold tracking-tight">
          關於我
        </h1>

        <div className="flex max-w-170 flex-col gap-4 text-[17px] leading-[1.85] text-muted-foreground">
          <p>
            你好，我是 Boris Lai，五年前端工程師經驗，現在以一人全端的形式接案。
            從形象官網、員工管理系統、自動化表單回覆，到手機 App——
            只要你講得出需求，我就想辦法把它做出來。
            一個人從設計到上線全包，溝通不用轉手，成品也更貼近你真正要的樣子。
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold tracking-tight">我能接的案子</h2>

        <ul className="grid grid-cols-1 gap-5.5 md:grid-cols-3">
          {SERVICES.map((service) => (
            <li
              key={service.title}
              className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6"
            >
              <h3 className="text-[17px] leading-[1.55] font-semibold">
                {service.title}
              </h3>
              <p className="text-sm leading-[1.75] text-muted-foreground">
                {service.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <Testimonials testimonials={testimonials} />

      <section
        id="contact"
        className="flex scroll-mt-24 flex-col gap-8 border-t border-border pt-12"
      >
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs tracking-[0.08em] text-primary">
            詢價
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            說說你的專案
          </h2>
          <p className="max-w-170 text-[17px] leading-[1.85] text-muted-foreground">
            填一下表單，我會在一到兩個工作天內回信。
            還在發想階段也沒關係，先聊聊方向也可以。
          </p>
        </div>

        <div className="max-w-170">
          <InquiryForm />
        </div>
      </section>
    </div>
  )
}
