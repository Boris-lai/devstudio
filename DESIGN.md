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

## 4. 卡片

兩種卡**共用互動語言、但視覺結構刻意不同**：

| | 作品卡（櫥窗感） | 文章卡（編輯感） |
|---|---|---|
| 主角 | **圖先於字** | **字先於圖** |
| 封面 | 172px 頂圖，下緣一條 border | 降級為次要：132px 矮圖，**放在文字之後** |
| 無封面 | `surface-2` 底 + 置中標題首字母（`--primary`、opacity ~.55） | **整塊不渲染**，不放佔位方塊 |
| 順序 | 封面 → 標題 → summary → 成果 chip → tech pills → 行動點 | 日期 eyebrow → 標題 → 摘要 →（封面，若有）→ 行動點 |
| 標題 | 17 / 600 | **20 / 600**，行高 1.45 |
| 摘要 | `line-clamp-2` | **`line-clamp-3`**（強化文字為主） |
| 日期 | — | **`--primary` mono 小標，置於標題之上當 eyebrow** |
| 行動點 | 「看完整案例 →」靠右 | 「閱讀全文 →」靠左（順閱讀方向） |
| padding | 20 | 24（更寬鬆的閱讀留白） |

- 共用容器：`bg-card`、`1px border`、圓角 14，整張是連結；hover：`translateY(-3px)` + 邊框轉 `--primary`，`transition .18s`。
- 行動點一律用 `<span>` 而非連結 —— 整張卡已經是 `<a>`，巢狀 `<a>` 是無效 HTML。
- 空欄位（summary/excerpt、outcome、tech、封面、日期）各自收合，不留空框。
- 網格：`grid-template-columns: repeat(auto-fill, minmax(300px, 1fr))`、gap 22；首頁固定三欄（見第 7 節）。

### tech pill：刻意的「分類多色」例外

`--primary` 是全站唯一的點綴色，**技術標籤是唯一的例外**：它依技術給不同色相（Tailwind 內建色階 blue / cyan / emerald / indigo / violet / amber / rose / neutral，各自帶 `dark:` 變體），用來換取一排標籤的辨識度。

- 這是**有意識的取捨**，不是漏改。看到它與「單一節制的板岩藍」不一致時，不要「修正」回去。
- 統一調到低飽和：淺底 `-100/-200` + 深字 `-700/-800`；深色模式翻成 `-950/-800` 底 + `-300` 字。
- 刻意**不用各家原廠品牌色**：Next.js 與 Vercel 都是黑色會撞，原廠飽和色放在暖中性底上也容易顯得花。
- 沒對應到的技術**退回 `--accent-soft` 底 + `--primary` 文字**，維持房子調性。
- 尺寸：膠囊、圓角 999、`text-[11px]`、padding 8/2；作品卡與作品內頁共用同一個元件。

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

## 7. 首頁

外殼（header/nav/footer）一律由 `(site)/layout.tsx` 提供，**首頁不要自己重做**，否則會出現雙 header/footer。作品卡與文章卡**重用既有的 `ProjectCard` / `PostCard`**，不照設計稿的簡化卡重畫。首頁只採用設計稿的 hero、區塊標題框架、CTA band 與 badge。

### Hero

- mono eyebrow（`--primary` 色）：「全端開發 · 前端與產品接案」。
- h1：桌機約 **58**、行高 **1.28**、字重 **700**、`text-wrap: pretty`；窄螢幕用 `clamp()` 縮放，不要硬切斷點。
- 自介段：`muted-foreground`、17 / 1.85、`max-width ~620`。
- 雙 CTA：主要 = 實心 `--primary`；次要 = outline「看作品 →」（→ `/work`）。
- 接案 badge 收在 CTA 下方。

### 接案狀態 badge

由 `getSiteSettings().accepting_work` 驅動，**兩種狀態都要做**：

| 狀態 | 圓點 | 文字 |
|---|---|---|
| 開放 | `--primary` 圓點 + glow ring（`box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 20%, transparent)`） | 目前開放接案 |
| 未開放 | `muted-foreground` 圓點，無 glow | 暫不接案 |

外框：`bg-card` + `1px border` + 圓角 999 + mono 12。**查無設定（`null`）時整個 badge 不顯示** —— 與其猜一個狀態，不如不掛，免得對外顯示錯誤的接案訊息。

### 精選作品 / 最新文章區塊

- header 列：左邊 mono eyebrow（`--primary` 色，「近期案例」／「筆記與心得」）+ h2 **32/700**；右邊 mono 連結「查看全部作品 →」／「看更多文章 →」。窄螢幕自動換行。
- 網格：桌機 `repeat(3, 1fr)`、窄螢幕收合單欄，gap 22。**與 `/work`、`/blog` 列表頁的 `auto-fill` 網格不同** —— 首頁固定三欄是刻意的，讓版面節奏穩定。
- 空狀態沿用第 4 節的 `EmptyState`。

### 結尾 CTA band

`--muted`（surface-2）底 + **上緣 border**、內容置中：mono eyebrow +「有專案想聊聊？」32/700 + 一段文案（`max-width ~620`）+ 兩顆按鈕（「取得報價」實心 `--primary`、「加 LINE 聯絡」outline）+ 一行 mono 的 email 連結。

聯絡目的地屬 **Chunk 8**：目前「取得報價」連 `/about`，LINE 與 email 先用 `#` 佔位。

---

## 8. 從設計稿丟棄的東西（那些只是稿子的鷹架）

最上面的 masthead、`TOKENS` 圖例、字級 legend、對角線 hatch 的封面佔位、`cover_image` 與 `no cover · fallback` 這些**除錯標籤字**、以及假名「林知遠」——都不是網站的一部分，落地時一律丟掉。只取三個畫面：卡片、作品內頁、文章內頁。

首頁設計稿同理，這些也一律丟棄：`1a` / `1b` 之類的**編號標籤**、底部的「接案狀態徽章 · 交接參考」區、hatch 縮圖佔位、假名「陳彥廷」與假 email，以及設計稿**自帶的 header/nav 與 footer**（外殼由 `(site)/layout.tsx` 提供）。

---

## 9. 落地原則

資料接線、component 拆分、RLS、深色模式切換鈕都已在 Chunk 2–4 完成，這份設計改的是**外觀**。落地 = 在既有的 `ProjectCard` / `PostCard` / 列表頁 / 內頁 / `Markdown` 上換皮，優先用 Tailwind utility + ShadCN 元件綁 token，不要用寫死的 inline style，不要動資料流。
