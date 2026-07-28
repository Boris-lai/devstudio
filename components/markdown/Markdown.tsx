import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import remarkGfm from "remark-gfm"

// 程式碼區塊配色。這個主題是深色底，亮暗模式下都維持深色，
// 不隨主題切換（highlight.js 的主題是固定色票，且沒有跟著 .dark class 走的版本）。
import "highlight.js/styles/github-dark.css"

import { cn } from "@/lib/utils"

type MarkdownProps = {
  content: string | null | undefined
  className?: string
}

/**
 * 作品內頁與文章內頁共用的 markdown 渲染器（Server Component）。
 *
 * 刻意不掛 rehype-raw：內容是手動在 Supabase Studio 寫的，
 * 但保持 react-markdown 預設「不解析原始 HTML」的行為，
 * 之後若開放留言或外部投稿才不會變成 XSS 破口。
 */
export function Markdown({ content, className }: MarkdownProps) {
  if (!content?.trim()) {
    return null
  }

  return (
    <div
      className={cn(
        "prose prose-neutral dark:prose-invert max-w-none",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
