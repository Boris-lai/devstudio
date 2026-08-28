"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

/**
 * 把整份名單複製成逗號分隔的字串，方便貼進電子報服務的匯入欄位。
 *
 * 沒有做 CSV 下載：目前只有 email 與日期兩個欄位，貼上去就能用，
 * 為此多一條 blob 下載的路徑不划算。之後欄位變多再說。
 */
export function CopyEmailsButton({ emails }: { emails: readonly string[] }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(emails.join(", "))
      setCopied(true)
      // 回到原狀，讓下一次點擊仍然看得出有反應
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard 在非 HTTPS 或使用者拒絕授權時會失敗。
      // 這是便利功能，失敗就維持原狀，不要跳錯誤打斷後台。
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      disabled={emails.length === 0}
    >
      {copied ? "已複製" : "複製全部 Email"}
    </Button>
  )
}
