import Image from "next/image"

import { IS_LINE_URL_SET, LINE_URL } from "@/lib/site"

/**
 * 右下角固定的 LINE 聯絡按鈕，公開站全站都在（後台不掛）。
 *
 * 圖示是 LINE 官方素材（public/line.png）。它是**不透明**的 PNG，四角填白 ——
 * 量測過綠色圓角方塊自身的圓角是 21.6%，而內切圓周上沒有任何非綠像素，
 * 所以用 rounded-full + overflow-hidden 可以把白角完全切乾淨。
 *
 * 底色維持 LINE 品牌綠 #06C755（與圖示中的綠完全相同，已比對過像素）：
 * 圖片載入前不會閃一下白，萬一載入失敗也還是一顆綠色按鈕。
 * 這是品牌識別色、刻意不走設計 token —— 換成板岩藍就認不出來了。
 */
export function LineFloatingButton() {
  return (
    <a
      href={LINE_URL}
      aria-label="用 LINE 聯絡我"
      // 連結還沒設定前不要開新分頁，免得跳出一個空白頁
      target={IS_LINE_URL_SET ? "_blank" : undefined}
      rel={IS_LINE_URL_SET ? "noopener noreferrer" : undefined}
      className="fixed right-5 bottom-5 z-50 block size-14 overflow-hidden rounded-full bg-[#06C755] shadow-lg shadow-black/20 transition-transform duration-180 hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:right-6 sm:bottom-6"
    >
      {/* alt 留空：外層 <a> 已經有 aria-label，重複會被螢幕閱讀器唸兩次 */}
      <Image
        src="/line.png"
        alt=""
        width={148}
        height={148}
        className="size-full object-cover"
      />
    </a>
  )
}
