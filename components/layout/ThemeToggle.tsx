"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="切換亮色／暗色模式"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/*
        用 CSS 的 dark: variant 決定顯示哪個圖示，而不是 useState + useEffect。
        伺服器端不知道使用者主題，靠 state 判斷會 hydration mismatch；
        改用 class 驅動後兩邊輸出一致，也不會有圖示閃動。
      */}
      <Sun className="hidden dark:block" />
      <Moon className="block dark:hidden" />
    </Button>
  )
}
