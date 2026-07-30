import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * 技術標籤：accent-soft 底 + 板岩藍文字的膠囊，作品卡與作品內頁共用
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
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map((tech) => (
        <Badge
          key={tech}
          variant="outline"
          className="h-auto rounded-full border-transparent bg-accent-soft px-2.75 py-1.5 text-xs font-normal text-primary"
        >
          {tech}
        </Badge>
      ))}
    </div>
  )
}
