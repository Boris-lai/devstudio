import type { Metadata } from "next"

import { TemplateGate } from "@/components/template/TemplateGate"
import { absoluteUrl, DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/site"

/**
 * 描述刻意寫得中性：這句會出現在 Google 搜尋結果與社群分享卡片上，
 * 說的是「這一頁在做什麼」而不是「模板裡有什麼」——
 * 模板內容之後換了，這句也不會變成錯的。
 */
const PAGE_DESCRIPTION =
  "留下 Email 就能免費下載模板，送出後這一頁會直接出現下載連結。"

export const metadata: Metadata = {
  title: "免費模板",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/template" },
  openGraph: {
    type: "website",
    title: `免費模板 | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: absoluteUrl("/template"),
    // 自訂 openGraph 會整個取代繼承來的物件，images 一定要自己補回來。
    // 理由見 lib/site.ts 的 DEFAULT_OG_IMAGE 註解。
    images: [DEFAULT_OG_IMAGE],
  },
}

const EYEBROW = "font-mono text-xs tracking-[0.08em]"

/**
 * 整頁只有一件事：留 Email 換下載連結。
 *
 * 刻意不介紹模板內容 —— 來的人是從 YouTube 影片點進來的，
 * 已經知道自己要拿什麼了，再鋪陳一次只是擋在他跟按鈕中間。
 *
 * max-w-135 而不是跟著 layout 的 max-w-5xl：一個 email 欄位的表單
 * 拉到整頁寬會看起來像個大工程，窄一點才像「填一格就好」。
 */
export default function TemplatePage() {
  return (
    <div className="mx-auto flex w-full max-w-135 flex-col gap-8 py-4">
      <div className="flex flex-col gap-3">
        <p className={`${EYEBROW} text-primary`}>免費下載</p>

        <h1 className="text-[32px] leading-[1.4] font-bold tracking-tight text-pretty">
          拿模板
        </h1>

        <p className="text-[17px] leading-[1.85] text-muted-foreground">
          留一個 Email ，送出後這一頁會直接出現下載連結。
        </p>
      </div>

      <TemplateGate />
    </div>
  )
}
