"use client"

import { useActionState } from "react"

import { Button } from "@/components/ui/button"
import {
  subscribeForTemplate,
  type SubscribeResult,
} from "@/lib/subscribers/actions"
import { IS_TEMPLATE_DOWNLOAD_SET, TEMPLATE_DOWNLOAD_URL } from "@/lib/template"

const FIELD_CLASS =
  "w-full rounded-[12px] border border-border bg-card px-4 py-3 text-sm leading-[1.75] text-foreground transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-60"

const LABEL_CLASS = "font-mono text-xs tracking-[0.08em] text-muted-foreground"

const PANEL_CLASS =
  "rounded-[12px] border border-[color-mix(in_oklch,var(--primary)_22%,transparent)] bg-accent-soft px-6 py-8"

/**
 * Email 換模板下載。
 *
 * 只問 email，一個欄位就好 —— 這是公開答應要送的東西，
 * 多問姓名／公司會讓人覺得被將一軍，轉換率也一定掉。
 */
export function TemplateGate() {
  const [state, formAction, isPending] = useActionState<
    SubscribeResult | null,
    FormData
  >(subscribeForTemplate, null)

  if (state?.status === "success") {
    return (
      <div className={PANEL_CLASS}>
        <p className="font-mono text-xs tracking-[0.08em] text-primary uppercase">
          已解鎖
        </p>
        <p className="mt-2.5 text-[19px] leading-[1.6] font-semibold">
          模板可以拿囉 😊
        </p>

        {IS_TEMPLATE_DOWNLOAD_SET ? (
          <>
            <p className="mt-2 text-[15px] leading-[1.75] text-muted-foreground">
              下載後解壓縮，照 README 的步驟就能跑起來。有問題歡迎直接來信問我。
            </p>
            <div className="mt-5">
              {/*
                跨網域的檔案連結不能靠 download 屬性，瀏覽器會忽略它並改成導頁；
                直接連過去，讓檔案伺服器的 Content-Disposition 決定要不要下載。
              */}
              <Button
                className="h-auto rounded-lg px-5.5 py-3"
                nativeButton={false}
                render={
                  <a
                    href={TEMPLATE_DOWNLOAD_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    下載模板
                  </a>
                }
              />
            </div>
          </>
        ) : (
          // 連結還沒設好時不要給一個點了沒反應的按鈕，老實說明比較好。
          <p className="mt-2 text-[15px] leading-[1.75] text-muted-foreground">
            你的 Email 已經收到了。檔案正在做最後整理，弄好我會寄到這個信箱。
          </p>
        )}
      </div>
    )
  }

  const fieldError = state?.status === "error" ? state.fieldError : undefined

  return (
    <form action={formAction} className="relative flex flex-col gap-4">
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
        <label htmlFor="template-email" className={LABEL_CLASS}>
          Email
        </label>
        <input
          id="template-email"
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
          disabled={isPending}
          placeholder="you@example.com"
          className={FIELD_CLASS}
        />
        {fieldError ? (
          <p className="text-sm text-destructive">{fieldError}</p>
        ) : null}
      </div>

      {state?.status === "error" && !state.fieldError ? (
        <p className="text-sm text-destructive">{state.message}</p>
      ) : null}

      <div>
        <Button
          type="submit"
          disabled={isPending}
          className="h-auto w-full rounded-lg px-5.5 py-3 sm:w-auto"
        >
          {isPending ? "送出中⋯" : "免費取得模板"}
        </Button>
      </div>

      {/* 明講 email 會拿來做什麼。不寫的話等於默默把人加進名單。 */}
      <p className="text-xs leading-[1.75] text-muted-foreground">
        只會用來寄模板的更新通知，不會給第三方，隨時可以回信說不要。
      </p>
    </form>
  )
}
