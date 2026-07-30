"use client"

import { useEffect, useState } from "react"

/**
 * 頁頂的閱讀進度條（選配）。只掛在文章內頁，拿掉這個元件不影響其他東西。
 *
 * z-index 要比 Header 的 z-50 高，否則會被 sticky header 蓋住。
 */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const el = document.documentElement
      const scrollable = el.scrollHeight - el.clientHeight
      setProgress(scrollable > 0 ? (el.scrollTop / scrollable) * 100 : 0)
    }

    // 用 rAF 補算初始值（例如帶 #anchor 進來時不是從頂端開始）。
    // 不直接在 effect 內同步呼叫，避免觸發 cascading render。
    const frame = requestAnimationFrame(update)

    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  return (
    <div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[60] h-0.5 bg-transparent"
    >
      <div
        className="h-full bg-primary transition-[width] duration-75 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
