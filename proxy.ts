import type { NextRequest } from "next/server"

import { updateSession } from "@/lib/supabase/middleware"

// Next.js 16 起，middleware 檔案慣例改名為 proxy（功能不變）。
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * 除了下列路徑，其他請求都跑一次 session 刷新：
     * - _next/static、_next/image：建置產物與圖片最佳化
     * - favicon.ico 與常見靜態圖檔
     * 這些不需要 session，排除掉可以少掉大量無謂的 auth 請求。
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
}
