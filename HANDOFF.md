# 專案交接摘要（給規劃用）

> 這份是「目前進度 + 踩過的坑」的濃縮版，用途是讓你在**不看程式碼**的前提下規劃下一步。
> 另外兩份事實來源請一併附上：`ARCHITECTURE.md`（架構／資料模型／RLS／路線圖）、`DESIGN.md`（設計系統）。
> 規劃出的方案會貼回實作端執行，所以**請產出可直接照做的步驟**，不要只給方向。

---

## 1. 專案

台灣、**純中文**的個人接案網站：作品集 + 部落格，核心目標是「把訪客轉換成一則詢價」。單人開發，一次推進一個 chunk。

## 2. 技術棧（版本很重要，別套舊記憶）

| 項目 | 版本／選型 |
|---|---|
| Next.js | **16.2.12**（App Router、Turbopack） |
| React | 19.2.4 |
| TypeScript | 5，**strict** |
| Tailwind | **v4，CSS-only 設定，沒有也不要建 `tailwind.config.ts`** |
| UI | ShadCN（style=`base-nova`）＋ **`@base-ui/react`**（不是 Radix） |
| 後端 | Supabase（`@supabase/ssr` 0.12.3、supabase-js 2.110.8） |
| Markdown | react-markdown 10 + remark-gfm + rehype-highlight + @tailwindcss/typography |
| 寄信 | **resend 6.18**（詢價通知） |
| OG image | `next/og` 的 `ImageResponse`（satori） |
| 格式化 | **prettier 3.9**（`semi: false`），`npm run format` / `format:check` |
| 其他 | next-themes 0.4.6、lucide-react |

套件管理器是 **npm**（有 `package-lock.json`）。**不要用 pnpm** —— 會生出第二個 lockfile 與不同結構的 `node_modules`。

## 3. 已完成：Chunk 0–9（ARCHITECTURE 路線圖全數完成）

| Chunk | 內容 |
|---|---|
| 0 地基 | 三個 Supabase client、根目錄 `proxy.ts` 每請求刷新 session |
| 1 資料層 | 建表 + RLS + trigger，`types/database.types.ts` |
| 2 版面外殼 | `(site)` route group、Header/Footer/Nav、深色模式、Noto Sans TC |
| 3 作品 | `/work` 列表 + `/work/[slug]` 案例頁 |
| 4 文章 | `/blog` 列表 + `/blog/[slug]`、共用 `<Markdown>` |
| 5 登入 | Google OAuth、callback、header 登入狀態 |
| 6 留言 | 文章底部留言（列表／新增／刪除，RLS 把關） |
| 7 首頁 | `/` hero + 精選作品 + 最新文章 + CTA band + 接案 badge |
| 8a 接案轉換 | `/about` 完整關於頁、詢價表單（寫入 `inquiries`、honeypot 擋 bot）、好評區（`testimonials`，沒資料就整區不顯示） |
| 8b 詢價通知 | Resend 寄信到站主信箱，`replyTo` 帶客戶信箱（Gmail 直接回覆即回給客戶） |
| 9a SEO | 各頁 metadata、`sitemap.ts`、`robots.ts`、JSON-LD（首頁 WebSite + Person、文章 BlogPosting） |
| 9b OG image | 三張動態 1200×630 OG 圖，中文字型用 Google Fonts 動態子集 |
| 換皮 | `DESIGN.md` 的 token／字體／卡片／內頁／首頁全數落地 |

**路由**：`/`、`/about`、`/work`、`/work/[slug]`、`/blog`、`/blog/[slug]`、`/auth/callback`，
加上 `/sitemap.xml`、`/robots.txt` 與三條 `opengraph-image`。
除 `/_not-found`、`/robots.txt`、`/opengraph-image` 外**全部是 dynamic (ƒ)**。

## 4. 檔案樹（原始碼）

```
app/
  layout.tsx  globals.css
  opengraph-image.tsx        # 站台預設 OG 圖
  sitemap.ts  robots.ts
  auth/callback/route.ts
  (site)/
    layout.tsx  page.tsx     # 外殼（含 getUser）+ 首頁
    about/page.tsx
    work/page.tsx   work/[slug]/{page,opengraph-image}.tsx
    blog/page.tsx   blog/[slug]/{page,opengraph-image}.tsx
components/
  ui/{button,badge,card,avatar}.tsx      layout/{Header,Footer,Nav,ThemeToggle}.tsx
  work/{ProjectCard,TechPills}.tsx       blog/PostCard.tsx
  comments/{CommentsSection,CommentList,CommentForm,DeleteCommentButton}.tsx
  auth/{AuthStatus,SignInButton,SignOutButton}.tsx
  contact/InquiryForm.tsx                about/Testimonials.tsx
  blog/ReadingProgress.tsx   # 文章頁頂的閱讀進度條（client）
  markdown/Markdown.tsx  theme-provider.tsx  EmptyState.tsx
lib/
  supabase/{client,server,middleware,env}.ts
  queries/{projects,posts,comments,site-settings,testimonials}.ts
  auth/{actions,safe-next,site-url}.ts
  comments/actions.ts        inquiries/actions.ts   # 含 Resend 寄信
  og/{font,template}.tsx     # OG 圖字型子集與共用排版
  site.ts                    # SITE_URL / SITE_NAME / DEFAULT_OG_IMAGE
  format.ts  utils.ts
supabase/migrations/{init,comments_fk_to_profiles}.sql  supabase/seed.sql
types/database.types.ts   proxy.ts
.prettierrc.json  .prettierignore  .vscode/settings.json
```

## 5. 非顯而易見的約束（**規劃時務必遵守，這些都是踩過坑換來的**）

**Next.js 16**
- `middleware.ts` 慣例已改名 **`proxy.ts`**（跑 Node.js runtime，`runtime` 設定選項不可用）。
- `params` 是 **Promise**；`cookies()` 是 **async**。
- 私有資料夾（`_` 開頭）不產生路由。

**metadata / OG image（很容易靜默壞掉）**
- **metadata 合併是「子層的 `openGraph` 物件整包取代父層」**，不是逐欄合併。只要頁面自訂了 `openGraph`，從上層繼承來的 `images`（包含 `opengraph-image.tsx` 檔案慣例自動加上的那張）就會**整個消失**，而且不會有任何警告 —— 要分享出去才發現沒有預覽圖。凡是自訂 `openGraph` 的頁面，都必須明確寫上 `images: [DEFAULT_OG_IMAGE]`（定義在 `lib/site.ts`）。內頁 `work/[slug]`、`blog/[slug]` 例外：它們有同層的 `opengraph-image.tsx`，會自動接上各自的動態圖。
- 同理，內頁的 `generateMetadata` **不要**再指定 `openGraph.images`，否則會蓋掉同層動態產生的 OG 圖。
- `ImageResponse`（satori）**畫不出中文**，必須自己載入字型。作法見 `lib/og/font.ts`：用 Google Fonts 的 `text=` 參數切子集。**關鍵是不要送現代瀏覽器的 User-Agent** —— 送 Chrome UA 會拿到 **woff2，而 satori 不支援**；送舊版 UA 才會拿到 truetype。改動這塊之後一定要真的把圖抓下來用眼睛看過，確認中文不是空白方塊。
- satori 只吃 flexbox，**不支援 CSS 變數與 `oklch()`**，OG 圖的顏色要寫死 hex。

**已知的設計偏離（規劃視覺時要知道）**
- `DESIGN.md` 開頭定的是「中性偏暖基底 + **單一節制的板岩藍點綴**」，但技術標籤（`TechPills`）後來改成**依技術給不同色**（Tailwind 內建色階 blue/cyan/emerald/… + `dark:` 變體），刻意偏離該定調以換取辨識度。這是有意識的取捨，不是漏改。未對應到的技術仍退回 `accent-soft`/`primary`。
- 文章頁另外用 `--accent-soft` + `--primary` 活化了 blockquote、inline code、h2 刻度；程式碼區塊有語言標籤、頁頂有閱讀進度條。這些 prose 覆寫**文章與作品內頁共用**。

**格式化**
- Prettier 設定 `semi: false`，全專案無分號。`.vscode/settings.json` 逐語言把 formatter 釘成 Prettier（VS Code 是逐語言決定 formatter 的，只設頂層蓋不過內建預設）。
- `*.md` 在 `.prettierignore` 裡：Prettier 的 markdown 表格對齊按**字元數**填充、不考慮中文是雙寬字元，格式化後表格在編輯器裡反而會歪。**不要把文件交給 Prettier。**

**Tailwind v4 / 樣式**
- plugin 用 `@plugin "..."` 寫在 `globals.css`，**不建 config 檔**。
- 深色模式靠 `@custom-variant dark (&:is(.dark *))` + `.dark` class。
- 覆寫 typography 的樣式**必須寫成「未分層」CSS**：plugin 輸出在 `@layer` 內，未分層樣式在 cascade 中一律勝過分層樣式（與 specificity 無關）。
- 色彩全走 token（`--primary` 是板岩藍點綴；ShadCN 的 `--accent` 是 hover 淡底，**兩者不同**）。

**ShadCN / base-ui**
- `Button`/`Badge` 用 `render` prop 換元素。**若 render 成 `<a>`/`<Link>`，必須加 `nativeButton={false}`**，否則 console 報錯、a11y 語意壞掉。
- `components/ui/card.tsx` 目前**沒有被使用**（它用 `ring` 而非 border，與設計衝突），卡片是用 utility 直接刻的。

**Supabase**
- `@supabase/ssr` 0.12.3 的 `setAll(cookies, headers)` **有第二個參數**，必須把 headers 寫進 response，否則 CDN 可能快取到他人的 session cookie。
- 一律用 **`getUser()`** 而非 `getSession()`（後者只讀 cookie、可偽造）。
- **RLS 是唯一安全邊界**；查詢仍明確加 `published = true`，讓 admin 看到的公開頁與訪客一致。
- 因為 `(site)/layout.tsx` 每請求 `getUser()`，該群組**無法靜態預產**；不要規劃 `generateStaticParams`（也與「發文改文不用重新部署」的架構決策衝突）。
- PostgREST 的關聯查詢**只能沿著直接外鍵**。`comments.user_id` 已在 migration 2 改指 `public.profiles(id)` 才能 join。

**環境**
- 本機 `supabase` CLI 是 2.67.1，**解析不了本專案的 config.toml**，一律用 `npx supabase@latest`。
- **Docker 未安裝**，所以 `supabase db dump`／local stack 不能用；`db push` 可用。
- 字體：`Noto Sans TC` 宣告的 subsets 沒有 chinese-traditional，但用 `subsets:["latin"]` 仍會透過 unicode-range 供應中文（已驗證 113 個 @font-face）。
- 程式碼區塊用 highlight.js `github-dark`，亮暗模式**都是深底**（單一主題，刻意的）。
- 日期時區**寫死 `Asia/Taipei`**。

---

## 6. 尚未完成

### 唯一的功能尾巴
- **LINE 連結**：首頁 CTA band 的「加 LINE 聯絡」仍是 `href="#"`，等拿到連結就填。這是全站唯一剩下的佔位。

### v1.5 之後（ARCHITECTURE 第 10 節）
`/admin` 後台 CRUD、圖片上傳 Storage、瀏覽數、留言 Realtime。

## 7. 部署前待辦（**沒設會靜默壞掉**）

Vercel 的環境變數要設這三組，本機 `.env.local` 已經有了：

| 變數 | 不設的後果 |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | fallback 到 `http://localhost:3000` —— **canonical、sitemap、OG 圖網址全部指向 localhost**，SEO 直接壞掉 |
| `RESEND_API_KEY` | 詢價照樣寫進資料庫，但**收不到通知信**，且只有一行 server warn |
| `INQUIRY_NOTIFY_TO` | 同上（兩者任一沒設就整個略過寄信） |

另外還有 **Supabase Dashboard** 那側：要啟用 **Google provider** 並把 `${SITE_URL}/auth/callback` 加進 Redirect URLs，登入才會通。

## 8. 目前狀態／已知限制

1. **Google OAuth 尚未在 Supabase Dashboard 設定**，所以**登入與留言的端到端流程從未跑過真實案例** —— 程式碼完成且靜態檢查通過，但只驗證到未登入狀態。
2. **詢價的成功送出路徑沒有端到端跑過**：`inquiries` 表沒有 delete 政策，測試資料塞進去就刪不掉，所以只測了驗證失敗與 honeypot 這些不寫入的路徑。**Resend 寄信本身已實測成功**（`last_event: delivered`）。
3. 資料庫有 seed 假資料（3 作品 / 2 文章 / `accepting_work=true` / 0 好評 / 0 留言），但**沒有任何封面圖**（`cover_url` 全為 null）。`next/image` 的 `remotePatterns` 只允許 Supabase Storage 網域。
4. 「暫不接案」badge 狀態沒有實際渲染過（DB 目前是 `true`，anon 受 RLS 限制改不了）。
5. 文章內頁每請求呼叫兩次 `getUser()`（layout 一次、留言區一次），可優化但不急。
6. `components/ui/card.tsx` 沒有被使用（見第 5 節）。
7. Git：全部在 **`main`**（27 個 commit），已推送到 GitHub（`Boris-lai/devstudio`，**public**），工作目錄乾淨。`feat/site-chunks-0-4` 分支停在較早的位置，已合併進 main。

## 9. 規劃時請遵守

- TypeScript strict；**不要新增 `tailwind.config.ts`**。
- 樣式只用既有 token 與 ShadCN 元件，不寫死 inline style。
- **不要改動 RLS 或資料表**，除非該步驟本身就是 schema 變更（要的話請明確寫出 migration）。
- 一次一個 chunk，每步結尾要能跑 `typecheck / lint / build`（另有 `npm run format:check`）。
- 純中文，不做 i18n。
