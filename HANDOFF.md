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
| 其他 | next-themes 0.4.6、lucide-react |

## 3. 已完成：Chunk 0–7

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
| 換皮 | `DESIGN.md` 的 token／字體／卡片／內頁／首頁全數落地 |

**路由**：`/`、`/about`(placeholder)、`/work`、`/work/[slug]`、`/blog`、`/blog/[slug]`、`/auth/callback`。
除 `/_not-found` 外**全部是 dynamic (ƒ)**。

## 4. 檔案樹（原始碼）

```
app/
  (site)/{page,layout}.tsx  about/  work/{page,[slug]}  blog/{page,[slug]}
  auth/callback/route.ts    layout.tsx  globals.css
components/
  ui/{button,badge,card,avatar}.tsx      layout/{Header,Footer,Nav,ThemeToggle}.tsx
  work/{ProjectCard,TechPills}.tsx       blog/PostCard.tsx
  comments/{CommentsSection,CommentList,CommentForm,DeleteCommentButton}.tsx
  auth/{AuthStatus,SignInButton,SignOutButton}.tsx
  markdown/Markdown.tsx  theme-provider.tsx  EmptyState.tsx
lib/
  supabase/{client,server,middleware,env}.ts
  queries/{projects,posts,comments,site-settings}.ts
  auth/{actions,safe-next,site-url}.ts   comments/actions.ts
  format.ts  utils.ts
supabase/migrations/{init,comments_fk_to_profiles}.sql  supabase/seed.sql
types/database.types.ts   proxy.ts
```

## 5. 非顯而易見的約束（**規劃時務必遵守，這些都是踩過坑換來的**）

**Next.js 16**
- `middleware.ts` 慣例已改名 **`proxy.ts`**（跑 Node.js runtime，`runtime` 設定選項不可用）。
- `params` 是 **Promise**；`cookies()` 是 **async**。
- 私有資料夾（`_` 開頭）不產生路由。

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

### Chunk 8 — 接案轉換件（下一步）
- `/about` 目前只是 placeholder，要做成接案導向的頁面。
- **詢價表單** → 寫入 `inquiries` 表（RLS：任何人可 insert、只有 admin 可讀）+ 寄信通知（寄信方案未定）。
- **LINE 連結**、**email**：首頁 CTA band 目前是 `href="#"` 佔位，`/about` 完成後要接真實目的地。
- **好評區**：`testimonials` 表已建好（RLS：公開讀 `published=true`），尚無查詢與 UI。

### Chunk 9 — SEO / 收尾
每頁 metadata、動態 OG image、`sitemap.xml`、`robots.ts`、細節打磨。

### v1.5 之後
`/admin` 後台 CRUD、圖片上傳 Storage、瀏覽數、留言 Realtime。

## 7. 目前卡住／待處理

1. **Google OAuth 尚未在 Supabase Dashboard 設定**（要啟用 Google provider + 加 redirect URLs）。因此**登入與留言的端到端流程從未跑過真實案例** —— 程式碼已完成，但只驗證到未登入狀態。
2. 資料庫已有 seed 假資料（3 作品 / 2 文章 / `accepting_work=true`），但**沒有任何封面圖**（`cover_url` 全為 null）。`next/image` 的 `remotePatterns` 只允許 Supabase Storage 網域。
3. 「暫不接案」badge 狀態沒有實際渲染過（DB 目前是 `true`，anon 受 RLS 限制改不了）。
4. Git：目前在 `feat/site-chunks-0-4` 分支（10 個 commit），`main` 還停在 initial commit。**Chunk 7 與 nativeButton 修正尚未提交**。
5. 文章內頁每請求呼叫兩次 `getUser()`（layout 一次、留言區一次），可優化但不急。

## 8. 規劃時請遵守

- TypeScript strict；**不要新增 `tailwind.config.ts`**。
- 樣式只用既有 token 與 ShadCN 元件，不寫死 inline style。
- **不要改動 RLS 或資料表**，除非該步驟本身就是 schema 變更（要的話請明確寫出 migration）。
- 一次一個 chunk，每步結尾要能跑 `typecheck / lint / build`。
- 純中文，不做 i18n。
