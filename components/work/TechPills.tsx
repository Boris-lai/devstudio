import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * 技術標籤的色調。
 *
 * 刻意不用各家原廠品牌色：Next.js 與 Vercel 都是黑色會撞，
 * 原廠的飽和色放在暖中性底上也容易顯得花。這裡取每個技術「大致的色相」，
 * 統一調到低飽和的淺底 + 深字，讓整排標籤有區分又不吵。
 *
 * 每組都明確寫出 dark: 變體，深色模式才跟得上。
 * 這些是 Tailwind 內建色階而非設計系統 token —— 屬於裝飾性的分類色，
 * 不影響 --primary／--accent-soft 那套核心配色。
 */
const TONE = {
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
  cyan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300",
  emerald:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  indigo:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
  violet:
    "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  rose: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  neutral:
    "bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
} as const

/** key 一律小寫比對，所以 "Next.js" 與 "next.js" 都對得上。 */
const TECH_TONES: Record<string, string> = {
  "next.js": TONE.neutral,
  next: TONE.neutral,
  vercel: TONE.neutral,
  react: TONE.sky,
  "react native": TONE.sky,
  typescript: TONE.blue,
  ts: TONE.blue,
  javascript: TONE.amber,
  js: TONE.amber,
  "tailwind css": TONE.cyan,
  tailwind: TONE.cyan,
  supabase: TONE.emerald,
  "node.js": TONE.emerald,
  node: TONE.emerald,
  postgres: TONE.indigo,
  postgresql: TONE.indigo,
  expo: TONE.indigo,
  stripe: TONE.violet,
  figma: TONE.violet,
  resend: TONE.rose,
  python: TONE.amber,
}

/** 沒對應到的技術沿用原本的房子配色，維持整體調性。 */
const FALLBACK_TONE = "bg-accent-soft text-primary"

function toneFor(tech: string): string {
  return TECH_TONES[tech.trim().toLowerCase()] ?? FALLBACK_TONE
}

/**
 * 技術標籤：小尺寸膠囊，依技術給不同色調。作品卡與作品內頁共用
 * （改動會同時影響兩邊，這是刻意保持一致）。
 * 空陣列直接不渲染，讓版面自然收合。
 */
export function TechPills({
  items,
  className,
}: {
  items: readonly string[]
  className?: string
}) {
  if (items.length === 0) return null

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {items.map((tech) => (
        <Badge
          key={tech}
          variant="outline"
          className={cn(
            "h-auto rounded-full border-transparent px-2 py-0.5 text-[11px] leading-[1.6] font-medium",
            toneFor(tech),
          )}
        >
          {tech}
        </Badge>
      ))}
    </div>
  )
}
