import { MessagesSquare, Network, PenTool, Rocket } from "lucide-react"

const EYEBROW = "font-mono text-xs tracking-[0.08em]"

/**
 * 文案改寫自四步驟說明，但把「我們」換成第一人稱單數 ——
 * 全站的聲音是一人接案（hero「我是接案開發者」、關於頁「一個人從設計到上線全包」），
 * 這裡用「我們」會前後打架。
 *
 * icon 目前是 lucide 佔位，等自製線稿 SVG 到位後直接抽換 `icon` 這一欄即可，
 * 版型不用動。素材規格：透明底、單色線稿、用 currentColor 上色。
 */
const STEPS = [
  {
    title: "告訴我你的想法",
    body: "不需要先準備完整規格，只要說明你的品牌、目標客群，以及希望網站達成什麼目的，我會協助你把需求整理出來。",
    icon: MessagesSquare,
  },
  {
    title: "規劃網站架構",
    body: "分析內容與使用者需求，規劃頁面、功能與瀏覽動線，讓網站不只好看，也更容易使用。",
    icon: Network,
  },
  {
    title: "設計與製作網站",
    body: "確認方向後開始視覺設計與開發。過程中會跟你確認內容與細節，確保成果符合品牌形象。",
    icon: PenTool,
  },
  {
    title: "網站正式上線",
    body: "完成測試與調整後協助正式上線，並提供基本操作說明，讓你可以輕鬆管理網站內容。",
    icon: Rocket,
  },
] as const

/**
 * 流程時間軸。桌機由左往右四欄，手機由上往下單欄。
 *
 * 每一步自己畫自己右邊（桌機）或下面（手機）的那一段連接線，最後一步不畫 ——
 * 比在容器上拉一條長線好維護：步數增減不用重算端點，也不會有線穿過末端的問題。
 *
 * 兩個方向的排版差異只靠 li 的 flex 方向切換：
 * 手機 flex-row（圓圈在左、文字在右），桌機 lg:flex-col（圓圈在上、文字在下）。
 */
export function ProcessTimeline() {
  return (
    <section className="flex flex-col gap-12">
      <header className="flex flex-col items-center gap-2 text-center">
        <p className={`${EYEBROW} text-primary`}>合作流程</p>
        <h2 className="text-[32px] leading-[1.3] font-bold tracking-tight text-pretty">
          從想法到上線，只需要 4 個步驟
        </h2>
      </header>

      <ol className="flex flex-col gap-10 lg:grid lg:grid-cols-4 lg:gap-x-8 lg:gap-y-0">
        {STEPS.map((step, index) => {
          const Icon = step.icon
          const isLast = index === STEPS.length - 1

          return (
            <li key={step.title} className="relative flex gap-4 lg:flex-col">
              {/*
                連接線。兩個方向各一條，切版差太多，共用一個元素只會變成
                一長串互相覆寫的 utility。
              */}
              {!isLast ? (
                <>
                  {/* 手機：圓圈下方 8px 起，往下延伸到距離下一顆圓圈 8px 處 */}
                  <span
                    aria-hidden
                    className="absolute top-14 -bottom-8 left-6 w-px bg-border lg:hidden"
                  />
                  {/*
                    桌機：從圓圈右側 8px 拉到下一欄。-right-6 是 32px 的
                    gap-x-8 減去要留給下一顆圓圈的 8px。
                  */}
                  <span
                    aria-hidden
                    className="absolute top-6 -right-6 left-14 hidden h-px bg-border lg:block"
                  />
                </>
              ) : null}

              <span
                aria-hidden
                className="flex size-12 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_oklch,var(--primary)_22%,transparent)] bg-accent-soft text-primary"
              >
                <Icon className="size-5" strokeWidth={1.75} />
              </span>

              <div className="flex flex-col gap-2 lg:pt-2">
                {/*
                  順序訊號從圓圈搬到這裡 —— 圓圈讓給 icon 了，
                  但「4 個步驟」是這一區的主訊息，編號不能消失。
                */}
                <p className={`${EYEBROW} text-muted-foreground`}>
                  STEP {String(index + 1).padStart(2, "0")}
                </p>
                {/*
                  桌機四欄時每欄只剩約 224px，字級各收一級 ——
                  17 是 DESIGN.md 第 3 節的內文標準，但那是給滿欄寬用的。
                */}
                <h3 className="text-[21px] leading-normal font-semibold lg:text-[19px]">
                  {step.title}
                </h3>
                <p className="text-[17px] leading-[1.85] text-muted-foreground lg:text-[15px]">
                  {step.body}
                </p>
              </div>
            </li>
          )
        })}
      </ol>

      <p className="text-center text-[19px] leading-[1.85] font-medium">
        你只需要帶著想法來，剩下的交給我。
      </p>
    </section>
  )
}
