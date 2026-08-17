"use client"

import { Drawer } from "@base-ui/react/drawer"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { isActive, NAV_ITEMS } from "@/components/layout/Nav"
import { buttonVariants } from "@/components/ui/button"
import { IS_LINE_URL_SET, LINE_URL } from "@/lib/site"
import { cn } from "@/lib/utils"

/** 抽屜裡每一列連結共用的樣式；py 給足，手指點得到。 */
const ROW =
  "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"

/**
 * 抽屜滑出時要蓋過 header（z-50）與閱讀進度條（z-60）。
 *
 * Base UI 的 Portal 不會自己給 z-index，而 z-50 的 header 是獨立的堆疊脈絡，
 * 光靠「DOM 順序在後面」蓋不過去 —— 一定要明確標高。
 */
const LAYER = "z-[70]"

/**
 * 手機版導覽：漢堡按鈕 + 從右側滑出的抽屜。
 *
 * 桌機版由 Header 直接排 <Nav />，這個元件在 md 以上整個 hidden，
 * 所以裡面不用再考慮寬螢幕的樣子。
 *
 * authSlot 是 server component（AuthStatus）算好後傳進來的節點。
 * 抽屜關著的時候 Portal 不會掛載，不會出現兩份登入表單。
 */
export function MobileNav({
  authSlot,
  className,
}: {
  authSlot?: React.ReactNode
  className?: string
}) {
  const pathname = usePathname()

  return (
    <Drawer.Root swipeDirection="right">
      <Drawer.Trigger
        aria-label="開啟選單"
        className={cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          className,
        )}
      >
        <Menu />
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Backdrop
          className={cn(
            LAYER,
            // 滑動關閉時，背景跟著手指的進度一起淡出
            "fixed inset-0 min-h-dvh bg-black opacity-[calc(0.45*(1-var(--drawer-swipe-progress)))] transition-opacity duration-450 ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:duration-0 data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)]",
            // iOS 26+：fixed 會被瀏覽器工具列裁掉，改 absolute 才蓋滿整個可視範圍
            "supports-[-webkit-touch-callout:none]:absolute",
          )}
        />

        <Drawer.Viewport
          className={cn(LAYER, "fixed inset-0 flex items-stretch justify-end")}
        >
          {/*
            右邊多留 3rem 的 bleed 再用負 margin 拉回去：
            往右滑過頭時橡皮筋回彈不會露出背景，關閉動畫也只需位移到「100% - bleed」。
          */}
          <Drawer.Popup
            className={cn(
              "h-full w-[calc(17rem+3rem)] max-w-[calc(100vw-3.5rem+3rem)] -mr-[3rem]",
              "overflow-y-auto overscroll-contain border-l border-border bg-background p-6 pr-[calc(1.5rem+3rem)] shadow-xl shadow-black/10 outline-none",
              "touch-auto [transform:translateX(var(--drawer-swipe-movement-x))] transition-transform duration-450 ease-[cubic-bezier(0.32,0.72,0,1)]",
              "data-swiping:select-none data-starting-style:[transform:translateX(calc(100%-3rem+2px))] data-ending-style:[transform:translateX(calc(100%-3rem+2px))] data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)]",
            )}
          >
            <Drawer.Content className="flex h-full flex-col">
              <div className="flex items-center justify-between">
                <Drawer.Title className="text-sm font-medium text-muted-foreground">
                  選單
                </Drawer.Title>

                <Drawer.Close
                  aria-label="關閉選單"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "icon",
                  })}
                >
                  <X />
                </Drawer.Close>
              </div>

              <nav className="mt-4 flex flex-col gap-1">
                {NAV_ITEMS.map((item) => {
                  const active = isActive(pathname, item.href)

                  return (
                    // Drawer.Close 包住連結：點了先關抽屜再換頁，
                    // 不然回上一頁時抽屜還開著。
                    <Drawer.Close
                      key={item.href}
                      nativeButton={false}
                      className={cn(
                        ROW,
                        active
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                      )}
                      render={
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                        >
                          {item.label}
                        </Link>
                      }
                    />
                  )
                })}

                {/* 分隔線獨立一條：掛在 ROW 上會跟著圓角彎起來 */}
                <div className="my-2 h-px bg-border" />

                <Drawer.Close
                  nativeButton={false}
                  className={cn(
                    ROW,
                    "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                  render={
                    <a
                      href={LINE_URL}
                      // 同 LineFloatingButton：連結沒設定好就不要開空白分頁
                      target={IS_LINE_URL_SET ? "_blank" : undefined}
                      rel={IS_LINE_URL_SET ? "noopener noreferrer" : undefined}
                    >
                      {/* 用官方綠色圖示比文字更好認，alt 留空避免被唸兩次 */}
                      <Image
                        src="/line.png"
                        alt=""
                        width={148}
                        height={148}
                        className="size-5 shrink-0 overflow-hidden rounded-full object-cover"
                      />
                      LINE 聯絡
                    </a>
                  }
                />
              </nav>

              {authSlot ? (
                <div className="mt-auto border-t border-border pt-4">
                  {authSlot}
                </div>
              ) : null}
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
