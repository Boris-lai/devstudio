# 設計系統 — DESIGN

> 從 Claude Design 產出的設計稿蒸餾而成，是視覺的事實來源。做任何頁面前先讀這份。
> 風格方向：乾淨、簡約、留白充足、中性偏暖基底 + 單一節制的板岩藍點綴。純中文站。

---

## 1. 色彩 token（接管 ShadCN token 值）

設計稿的語意 token 直接**接管**成 App 既有的 ShadCN token，整站與所有 ShadCN 元件共用一套，深色模式靠既有的 `.dark` class 自動生效。填進 globals.css 的 `:root`（亮）與 `.dark`（深）。

| 設計 token | 對應 ShadCN token | 亮色 | 深色 |
|---|---|---|---|
| `--bg` | `--background` | `#fbfbfa` | `#111110` |
| `--surface` | `--card`、`--popover` | `#ffffff` | `#1a1a19` |
| `--surface-2` | `--muted`、`--secondary`、ShadCN `--accent`(hover 底) | `#f4f4f2` | `#232322` |
| `--fg` | `--foreground`、`--card-foreground`、`--popover-foreground` | `#1a1a19` | `#f3f3f0` |
| `--fg-2` | `--muted-foreground` | `#6f6f69` | `#a3a39c` |
| `--border` | `--border`、`--input` | `#e6e6e1` | `#2f2f2c` |
| `--accent`（點綴） | `--primary`、`--ring` | `oklch(0.52 0.085 236)` | `oklch(0.74 0.09 236)` |
| `--on-accent` | `--primary-foreground` | `#ffffff` | `#111110` |
| `--accent-soft` | **新增** `--accent-soft` | `oklch(0.965 0.016 236)` | `oklch(0.30 0.035 236)` |

> ⚠️ **容易搞混的一點**：設計稿說的「accent（板岩藍點綴）」對應的是 ShadCN 的 **`--primary`**，不是 ShadCN 自己的 `--accent`。ShadCN 的 `--accent`／`--accent-foreground`（hover 用的淡底）請讓它跟著 `--surface-2`／`--foreground` 走，**不要**把板岩藍填進去。
>
> `--accent-soft` 是新 token，記得在 `@theme inline` 裡加 `--color-accent-soft: var(--accent-soft);`，`bg-accent-soft` 這類 utility 才會生效。

---

## 2. 字體

- **Noto Sans TC**（400/500/600/700）：主字體，全站內文與標題（已由 `next/font` 載入）。
- **Noto Sans Mono**（400/500）：**新增**，用 `next/font/google` 掛成 `--font-mono` 並在 `@theme inline` 暴露。用途：日期、mono 小標（`ROLE`／`CLIENT`／`OUTCOME` 等）、inline code、程式碼區塊。

中文排版：不用極細字重；內文行高放寬（1.85–1.9）；標題靠字級與字重拉層次。

---

## 3. 字級階層（實際頁面尺寸）

| 用途 | 尺寸 / 字重 | 行高 |
|---|---|---|
| 內頁主標 H1 | 32–36 / 700 | 1.4 |
| 區段標題 H2 | 22–24 / 600 | 1.5 |
| 小節標題 H3 | 18–19 / 600 | 1.5 |
| 內文 Body | 16.5–17 / 400 | 1.85–1.9 |
| 卡片標題 | 17 / 600 | 1.55 |
| Meta／日期／標記 | 12–13，Noto Sans Mono，`muted-foreground`，常大寫 + 微字距 | — |

---

## 4. 卡片（作品卡 / 文章卡，共用視覺語言）

- 容器：`bg-card`、`1px border`、圓角 14、`overflow-hidden`，整張是連結；hover：`translateY(-3px)` + 邊框轉 `--primary`，`transition .18s`。
- 封面：作品卡 172px 高 / 文章卡 160px 高，用 `next/image`，下緣一條 border。
- 無封面 fallback：**作品卡** = `surface-2` 底 + 置中的標題首字母（`--primary` 色、opacity ~.55）；**文章卡** = `surface-2` 淡底即可（乾淨留白）。
- 內容區 padding ~18–20、gap 10–12：標題 17/600 → summary/excerpt（**可為空**，`muted-foreground` 14/1.75、`line-clamp-2`）→ 作品的 tech pills（**可為空**）貼底 / 文章的日期（mono 12 muted）貼底。
- tech pill：outline 膠囊，`border`、圓角 999、`text-xs`、padding ~6/11、`muted-foreground`；可用 ShadCN `Badge variant="outline"` 調成這個樣子。
- 網格：`grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))`、gap 22；桌機多欄、手機自動單欄。

## 空狀態（EmptyState）

虛線邊框、圓角 14、置中：一個小方塊圖示 + 標題「還沒有任何內容」(16/600) + 一行 `muted-foreground` 說明。

---

## 5. 作品內頁（案例頁）

- 封面 300px 高（真圖 / 無圖 = `surface-2` 塊）。
- 內容欄 `max-width: 820px` 置中，padding ~48/56。
- 標題 32/700。
- meta 列（`role`、`client_type`，**任一有值才顯示該欄**）：mono 大寫小標（`ROLE`／`CLIENT`）+ 值 15。
- **OUTCOME 突出框**（**有 `outcome` 才顯示**）：`bg-accent-soft` + `border`（`color-mix(in oklch, var(--primary) 22%, transparent)`）、圓角 12、padding 22/26；mono 小標「成果 · OUTCOME」用 `--primary` 色；內容 19/600、行高 1.6。這是案例的賣點，要顯眼。
- tech pills（有才顯示）。
- 按鈕（**有 url 才顯示對應那顆**）：`live_url` = 實心 `--primary` 按鈕（`text-primary-foreground`、圓角 10、padding 12/22）；`repo_url` = outline 按鈕；文字後綴 `↗`。可用 ShadCN `Button`。
- 一條 divider 後接 `<Markdown>` 渲染的 `content`，閱讀欄 `max-width ~680`。
- **全空邊界**：role/client/outcome/連結全無 → 整區直接省略，不留空框、不放「N/A」，版面自然收合，只渲染內文。

---

## 6. 文章內頁（閱讀排版）

- 頂部：日期（mono、muted）＋（可選）閱讀時間；閱讀時間用「字數 / 500，四捨五入取分鐘」估，不想做就只放日期。
- 標題 36/700。
- 封面 320px 高（有才顯示）。
- 閱讀欄 `max-width ~680`，用 `prose dark:prose-invert` 並調校到：
  - 內文 17 / 行高 1.9；`h2` 24/600；`h3` 19/600。
  - inline code：`bg-muted`、mono、圓角、padding ~2/7 的小 chip。
  - 程式碼區塊：**維持 Chunk 4 的 highlight.js github-dark**（亮暗都深底，與設計稿一致）；容器圓角 12、padding、`overflow-x:auto`。
  - blockquote：左邊框 3px（`border` 色）、`muted-foreground`。
  - table：表頭 `surface-2` 底、`border` 分隔、圓角外框。
  - 把 prose 的顏色綁到 token（內文/標題 → `--foreground`、連結 → `--primary`、引用 → `--muted-foreground`、線 → `--border`），確保亮暗都用這套色，而不是 typography 預設色。

---

## 7. 從設計稿丟棄的東西（那些只是稿子的鷹架）

最上面的 masthead、`TOKENS` 圖例、字級 legend、對角線 hatch 的封面佔位、`cover_image` 與 `no cover · fallback` 這些**除錯標籤字**、以及假名「林知遠」——都不是網站的一部分，落地時一律丟掉。只取三個畫面：卡片、作品內頁、文章內頁。

---

## 8. 落地原則

資料接線、component 拆分、RLS、深色模式切換鈕都已在 Chunk 2–4 完成，這份設計改的是**外觀**。落地 = 在既有的 `ProjectCard` / `PostCard` / 列表頁 / 內頁 / `Markdown` 上換皮，優先用 Tailwind utility + ShadCN 元件綁 token，不要用寫死的 inline style，不要動資料流。
