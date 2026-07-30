"use client"

import Image from "next/image"
import { useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

const BUCKET = "covers"

/** 副檔名由 MIME 決定，不信任使用者的檔名。 */
const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

const MAX_BYTES = 5 * 1024 * 1024

function formatMb(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/**
 * 封面上傳，文章與作品表單共用。
 *
 * 值透過一個 hidden input 帶進表單，所以 server action 那側完全不用改 ——
 * 它讀到的仍然是 cover_url 這個欄位，只是內容改由上傳產生而非手貼。
 *
 * 上傳走 browser client，帶的是登入者自己的 session；非 admin 會被
 * storage 的 RLS 擋下（實測 anon 上傳回 403）。
 */
export function CoverUpload({
  name,
  initialUrl,
  disabled,
}: {
  name: string
  initialUrl: string
  disabled?: boolean
}) {
  const [url, setUrl] = useState(initialUrl)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError(null)

    const extension = EXTENSION_BY_TYPE[file.type]
    if (!extension) {
      setError("只接受 JPG、PNG 或 WebP。")
      return
    }

    if (file.size > MAX_BYTES) {
      setError(
        `檔案 ${formatMb(file.size)}，超過 ${formatMb(MAX_BYTES)} 上限。請先壓縮。`,
      )
      return
    }

    setIsUploading(true)

    try {
      const supabase = createClient()
      // 隨機檔名：避免同名覆蓋，也不會把原始檔名洩漏到公開網址上
      const path = `${crypto.randomUUID()}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { contentType: file.type, upsert: false })

      if (uploadError) {
        // 不要靜默失敗：把原始訊息帶出來，權限問題才看得出是 RLS 擋的
        setError(`上傳失敗：${uploadError.message}`)
        return
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(path)

      setUrl(publicUrl)
    } catch (cause) {
      setError(
        `上傳時發生錯誤：${cause instanceof Error ? cause.message : "未知原因"}`,
      )
    } finally {
      setIsUploading(false)
      // 清掉 input，這樣選同一個檔案也會再次觸發 change
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const isBusy = disabled || isUploading

  return (
    <div className="flex flex-col gap-3">
      {/* 表單真正送出的欄位 */}
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className="relative h-40 w-full max-w-md overflow-hidden rounded-lg border border-border bg-muted">
          <Image
            src={url}
            alt=""
            fill
            sizes="448px"
            className="object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="flex h-40 w-full max-w-md items-center justify-center rounded-lg border border-dashed border-border bg-muted text-sm text-muted-foreground">
          尚未設定封面
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {/*
          type="button" 是必要的 —— <button> 在表單裡預設是 submit，
          少了它按「選擇圖片」會直接把整張表單送出去。
        */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isBusy}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? "上傳中⋯" : url ? "更換圖片" : "選擇圖片"}
        </Button>

        {url ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isBusy}
            onClick={() => {
              setUrl("")
              setError(null)
            }}
            className="text-destructive"
          >
            移除封面
          </Button>
        ) : null}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void handleFile(file)
        }}
      />

      <p className="text-xs text-muted-foreground">
        JPG／PNG／WebP，最大 {formatMb(MAX_BYTES)}。移除只是把欄位清空，
        檔案仍留在 storage。
      </p>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {url ? (
        <p className="font-mono text-xs break-all text-muted-foreground">
          {url}
        </p>
      ) : null}
    </div>
  )
}
