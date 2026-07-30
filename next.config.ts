import type { NextConfig } from "next"

// 作品封面圖預計放 Supabase Storage，next/image 需要明確允許該 host。
// 從 NEXT_PUBLIC_SUPABASE_URL 推導，避免把專案網址寫死第二份。
// 若封面圖用的是別的網域（例如假資料先用 Unsplash），要另外加進來。
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  images: {
    remotePatterns: supabaseUrl
      ? [
          {
            protocol: "https",
            hostname: new URL(supabaseUrl).hostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
}

export default nextConfig
