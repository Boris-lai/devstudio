import type { Element } from "hast"
import ReactMarkdown, { type Components } from "react-markdown"
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

const LANGUAGE_PREFIX = "language-"

/**
 * 從 hast 節點取出程式碼區塊的語言名。
 * rehype-highlight 會在 <pre> 內的 <code> 上加 `language-xxx`。
 */
function readCodeLanguage(node: Element | undefined): string | undefined {
  const child = node?.children?.[0]
  if (child?.type !== "element") return undefined

  const classNames = child.properties?.className
  if (!Array.isArray(classNames)) return undefined

  for (const entry of classNames) {
    if (typeof entry === "string" && entry.startsWith(LANGUAGE_PREFIX)) {
      return entry.slice(LANGUAGE_PREFIX.length)
    }
  }

  return undefined
}

/**
 * ⚠️ 這個 renderer 是文章內頁與作品內頁共用的，改動會同時影響兩邊。
 *
 * 目前只做一件事：把語言名寫成 <pre data-language="ts">，
 * 左上角的標籤本身由 globals.css 的 `.prose pre[data-language]::before` 畫出來。
 * 沒有語言時屬性是 undefined，React 會整個省略，CSS 選擇器就不會命中。
 */
const COMPONENTS: Components = {
  pre({ node, children, ...props }) {
    return (
      <pre {...props} data-language={readCodeLanguage(node)}>
        {children}
      </pre>
    )
  },
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
        components={COMPONENTS}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
