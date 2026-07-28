import { Square } from "lucide-react"

/**
 * 列表空狀態（DESIGN.md 第 4 節）：虛線框、圓角 14、置中。
 */
export function EmptyState({
  title = "還沒有任何內容",
  description,
}: {
  title?: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-16 text-center">
      <div className="flex size-10 items-center justify-center rounded-[10px] bg-muted">
        <Square className="size-4 text-muted-foreground" />
      </div>
      <p className="text-base font-semibold">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
