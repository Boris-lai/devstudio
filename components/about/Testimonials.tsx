import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Testimonial } from "@/lib/queries/testimonials"

/** 把 role 與 company 併成一行，任一為空都不留多餘的分隔符。 */
function formatAttribution(testimonial: Testimonial): string | null {
  const parts = [testimonial.role, testimonial.company].filter(
    (part): part is string => Boolean(part?.trim()),
  )

  return parts.length > 0 ? parts.join(" · ") : null
}

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  // 沒有好評就整區不顯示，不留空框（與作品內頁的空欄位收合同一套原則）
  if (testimonials.length === 0) return null

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl font-semibold tracking-tight">客戶怎麼說</h2>

      <ul className="grid grid-cols-1 gap-5.5 md:grid-cols-2">
        {testimonials.map((testimonial) => {
          const attribution = formatAttribution(testimonial)
          const name = testimonial.name.trim()

          return (
            <li
              key={testimonial.id}
              className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6"
            >
              <blockquote className="text-[15px] leading-[1.85] text-foreground">
                「{testimonial.quote}」
              </blockquote>

              <div className="mt-auto flex items-center gap-3">
                <Avatar size="sm">
                  {testimonial.avatar_url ? (
                    <AvatarImage src={testimonial.avatar_url} alt="" />
                  ) : null}
                  <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
                </Avatar>

                <div className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium">{name}</span>
                  {attribution ? (
                    <span className="text-xs text-muted-foreground">
                      {attribution}
                    </span>
                  ) : null}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
