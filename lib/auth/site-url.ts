const LOCAL_HOSTS = ["localhost", "127.0.0.1", "[::1]"]

function isLocalHost(host: string): boolean {
  const hostname = host.split(":")[0]
  return LOCAL_HOSTS.includes(hostname)
}

/**
 * 從請求 headers 推出站台對外的 origin。OAuth 的 redirectTo 與 callback
 * 導回都要用它，兩邊必須算出同一個值。
 *
 * 三種情境：
 * - 反向代理後面（Vercel）：用 x-forwarded-host / x-forwarded-proto
 * - 本機 next dev：Host 是 localhost，走 http
 * - 其他：預設 https
 *
 * 不直接用 `new URL(request.url).origin`：production build 下 Next.js 會把
 * 它組成 https，本機用 `next start` 跑 http 時會導到連不上的 https://localhost。
 */
export function resolveOrigin(headerList: Headers): string {
  const forwardedHost = headerList.get("x-forwarded-host")
  const host = forwardedHost ?? headerList.get("host")

  if (!host) return "http://localhost:3000"

  const forwardedProto = headerList.get("x-forwarded-proto")
  const proto = forwardedProto ?? (isLocalHost(host) ? "http" : "https")

  return `${proto}://${host}`
}
