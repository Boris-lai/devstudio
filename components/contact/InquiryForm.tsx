"use client"

import { usePathname } from "next/navigation"
import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import { submitInquiry, type InquiryResult } from "@/lib/inquiries/actions"

const FIELD_CLASS =
  "w-full rounded-[12px] border border-border bg-card px-4 py-3 text-sm leading-[1.75] text-foreground transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"

const LABEL_CLASS = "font-mono text-xs tracking-[0.08em] text-muted-foreground"

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-sm text-destructive">{message}</p>
}

export function InquiryForm() {
  // source 記錄「從哪個頁面送出的」，之後表單若出現在別頁也不用改。
  const pathname = usePathname()

  const [state, formAction, isPending] = useActionState<
    InquiryResult | null,
    FormData
  >(submitInquiry, null)

  if (state?.status === "success") {
    return (
      <div className="rounded-[12px] border border-[color-mix(in_oklch,var(--primary)_22%,transparent)] bg-accent-soft px-6 py-8">
        <p className="font-mono text-xs tracking-[0.08em] text-primary uppercase">
          已送出
        </p>
        <p className="mt-2.5 text-[19px] leading-[1.6] font-semibold">
          謝謝你的訊息，我收到了。
        </p>
        <p className="mt-2 text-[15px] leading-[1.75] text-muted-foreground">
          我會在一到兩個工作天內回信。若比較急，也可以直接寄信給我。
        </p>
      </div>
    )
  }

  const fieldErrors = state?.status === "error" ? state.fieldErrors : undefined

  return (
    <form action={formAction} className="relative flex flex-col gap-5">
      <input type="hidden" name="source" value={pathname} />

      {/* Honeypot：對使用者隱藏、對 bot 可見。被填就靜默丟棄。 */}
      <div
        aria-hidden
        className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0"
      >
        <label>
          公司網站
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="inquiry-name" className={LABEL_CLASS}>
          稱呼
        </label>
        <input
          id="inquiry-name"
          name="name"
          required
          maxLength={100}
          autoComplete="name"
          disabled={isPending}
          placeholder="怎麼稱呼你？"
          className={FIELD_CLASS}
        />
        <FieldError message={fieldErrors?.name} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="inquiry-email" className={LABEL_CLASS}>
          Email
        </label>
        <input
          id="inquiry-email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          disabled={isPending}
          placeholder="我回信會用這個信箱"
          className={FIELD_CLASS}
        />
        <FieldError message={fieldErrors?.email} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="inquiry-message" className={LABEL_CLASS}>
          需求訊息
        </label>
        <textarea
          id="inquiry-message"
          name="message"
          required
          maxLength={2000}
          rows={6}
          disabled={isPending}
          placeholder="想做什麼？目前卡在哪裡？有沒有時間或預算的範圍？講多講少都可以。"
          className={`${FIELD_CLASS} resize-y`}
        />
        <FieldError message={fieldErrors?.message} />
      </div>

      {state?.status === "error" && !state.fieldErrors ? (
        <p className="text-sm text-destructive">{state.message}</p>
      ) : null}

      <div>
        <Button
          type="submit"
          disabled={isPending}
          className="h-auto rounded-lg px-5.5 py-3"
        >
          {isPending ? "送出中⋯" : "送出詢價"}
        </Button>
      </div>
    </form>
  )
}
