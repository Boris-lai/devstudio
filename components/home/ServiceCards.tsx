import Image from "next/image"
import Link from "next/link"

const EYEBROW = "font-mono text-xs tracking-[0.08em]"

/**
 * 六種服務類型。目前沒有各自的內頁，六張卡的 CTA 一律連到聯絡表單 ——
 * 卡片上的字（「了解品牌官網」）才是訪客帶進對話的意圖。
 * 之後若開了 /services/[slug]，改的只有這裡的 href。
 */
const SERVICES = [
  {
    title: "品牌形象官網",
    tagline: "把品牌價值，整理成一個值得信任的線上門面。",
    body: "從品牌定位、內容架構到響應式設計，清楚呈現你的服務、優勢與案例，讓第一次認識你的訪客，也能快速建立信任並找到聯絡方式。",
    audience: "公司行號、個人品牌、專業顧問、工作室與服務型商家。",
    cta: "了解品牌官網",
    image: "/services/01-brand-site.webp",
    alt: "品牌形象官網在桌機與手機上的畫面",
  },
  {
    title: "一頁式銷售網站",
    tagline: "用一個頁面說清楚價值，引導訪客採取行動。",
    body: "依照廣告流量與銷售目標規劃內容順序，整合產品特色、服務優勢、客戶見證與行動按鈕，讓訪客從了解、信任到詢問，在同一個頁面完成。",
    audience: "廣告活動、新品上市、課程招生、服務推廣與短期行銷專案。",
    cta: "提升頁面轉換",
    image: "/services/02-landing-page.webp",
    alt: "一頁式銷售網站的版面，含轉換漏斗與客戶見證區塊",
  },
  {
    title: "預約網站",
    tagline: "讓客戶自己選服務、挑時間，減少來回確認。",
    body: "整合服務項目、可預約時段、顧客資料與預約通知，讓客戶隨時完成預約，也讓你更容易掌握行程、訂單與後續服務。",
    audience: "美容美髮、教練、顧問、攝影、診所、工作室與場地租借。",
    cta: "規劃預約流程",
    image: "/services/03-booking.webp",
    alt: "線上預約流程：選服務、選日期時間，手機顯示預約成功",
  },
  {
    title: "電商購物網站",
    tagline: "建立自己的銷售通路，從瀏覽商品到完成付款。",
    body: "依照商品與營運方式，規劃產品分類、購物車、會員、付款、物流及訂單流程，讓顧客更容易購買，也讓後續管理更有效率。",
    audience: "自有品牌、食品、生活選物、服飾、美妝、文創商品與零售業者。",
    cta: "建立線上商店",
    image: "/services/04-ecommerce.webp",
    alt: "電商網站的商品列表、購物車與結帳流程",
  },
  {
    title: "後台管理系統",
    tagline: "把分散的資料與工作流程，集中到一套好管理的系統。",
    body: "依照實際營運需求，整合訂單、客戶、商品、權限、報表與工作進度，減少紙本、Excel 與重複輸入，讓團隊更快掌握營運狀況。",
    audience: "需要管理大量資料、多人協作或客製化流程的企業與團隊。",
    cta: "討論管理需求",
    image: "/services/05-admin-system.webp",
    alt: "後台管理系統的儀表板與角色權限設定畫面",
  },
  {
    title: "產品型錄與詢價網站",
    tagline: "讓客戶看懂產品規格，也能快速送出完整需求。",
    body: "透過產品分類、規格說明、技術文件與結構化詢價流程，協助客戶快速找到合適產品，降低業務來回確認的時間，提高詢價品質。",
    audience: "製造業、設備商、零組件供應商、批發商與 B2B 企業。",
    cta: "規劃產品型錄",
    image: "/services/06-catalog.webp",
    alt: "工業零組件的產品型錄頁與詢價單流程",
  },
] as const

const CONTACT_HREF = "/about#contact"

/**
 * 服務項目：左右交錯的橫幅列表，一項一列。
 *
 * 不做卡片 —— 每一項有標題、主張、說明、適合對象四段文字，
 * 塞進卡片後不是被擠成窄欄就是要一路縮字級。這裡讓文字吃滿半欄，
 * 字級回到全站標準（說明 17，DESIGN.md 第 3 節）。
 *
 * 桌機才交錯，窄螢幕收合成單欄：DOM 順序固定「文字先、圖後」，
 * 所以每一項都是標題在圖上面。
 */
export function ServiceCards() {
  return (
    <section className="flex flex-col gap-10">
      <header className="flex flex-col items-center gap-2 text-center">
        <p className={`${EYEBROW} text-primary`}>服務項目</p>
        <h2 className="text-[32px] leading-[1.3] font-bold tracking-tight text-pretty">
          你需要的是哪一種？
        </h2>
        <p className="mt-1 max-w-155 text-[17px] leading-[1.85] text-muted-foreground">
          六種最常被問到的類型。不確定自己屬於哪一種也沒關係，直接聊聊也可以。
        </p>
      </header>

      <ol className="flex flex-col gap-16 lg:gap-24">
        {SERVICES.map((service, index) => {
          // 偶數項把圖換到左邊。DOM 順序固定「文字先、圖後」，
          // 收合成單欄時每一項都是標題在圖上面，不會一項一個樣。
          const imageOnLeft = index % 2 === 1

          return (
            <li
              key={service.title}
              className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
            >
              <div
                className={
                  imageOnLeft
                    ? "flex flex-col items-start gap-4 lg:col-start-2 lg:row-start-1"
                    : "flex flex-col items-start gap-4 lg:col-start-1 lg:row-start-1"
                }
              >
                {/* 編號圓圈沿用流程時間軸那顆的規格，兩區的視覺語彙一致 */}
                <span
                  aria-hidden
                  className="flex size-12 items-center justify-center rounded-full border border-[color-mix(in_oklch,var(--primary)_22%,transparent)] bg-accent-soft font-mono text-sm text-primary"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div className="flex flex-col gap-3">
                  <h3 className="text-[24px] leading-[1.4] font-bold tracking-tight text-pretty">
                    {service.title}
                  </h3>

                  {/* 一句主張，字重比說明重，是這一項的重點 */}
                  <p className="text-[17px] leading-[1.7] font-medium text-pretty">
                    {service.tagline}
                  </p>

                  <p className="text-[17px] leading-[1.85] text-muted-foreground">
                    {service.body}
                  </p>

                  <p className="text-[15px] leading-[1.8] text-muted-foreground">
                    <span className={`${EYEBROW} mr-1.5`}>適合</span>
                    {service.audience}
                  </p>
                </div>

                <Link
                  href={CONTACT_HREF}
                  className={`${EYEBROW} rounded-md text-primary transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none`}
                >
                  {service.cta} →
                </Link>
              </div>

              {/*
                圖片本身是淺底的情境示意圖，用邊框與圓角框住 ——
                跟 hero 那張同樣的處理，不加陰影：這裡有六張，
                六個 shadow 疊起來整頁會變得很吵。
              */}
              <div
                className={
                  imageOnLeft
                    ? "relative aspect-4/3 w-full overflow-hidden rounded-xl border border-border bg-muted lg:col-start-1 lg:row-start-1"
                    : "relative aspect-4/3 w-full overflow-hidden rounded-xl border border-border bg-muted lg:col-start-2 lg:row-start-1"
                }
              >
                <Image
                  src={service.image}
                  alt={service.alt}
                  fill
                  sizes="(min-width: 1024px) 470px, 100vw"
                  className="object-cover"
                />
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
