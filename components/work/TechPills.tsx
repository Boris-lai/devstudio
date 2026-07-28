import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * 技術標籤（DESIGN.md 第 4 節）：outline 膠囊，作品卡與作品內頁共用。
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
          className="h-auto rounded-full border-border px-[11px] py-1.5 text-xs font-normal text-muted-foreground"
        >
          {tech}
        </Badge>
      ))}
    </div>
  )
}
