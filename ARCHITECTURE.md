# 個人網站 — 架構文件 (ARCHITECTURE)

> 這份文件是整個專案的「單一事實來源」。用 Claude Code 開發時，請先讓它讀這份，再動任何程式碼。

---

## 1. 目標與定位

- **用途**：接案作品集展示 + 文章／部落格。核心任務是「把陌生訪客轉換成一則詢價」。
- **市場**：台灣，**只做中文**，不做 i18n / 英文版。
- **開發方式**：用 Claude Code，一次只推進一個小 chunk（見第 9 節路線圖）。

---

## 2. 技術棧

| 層 | 選型 |
|---|---|
| 前端 | Next.js（App Router）、TypeScript **strict** |
| 樣式 | Tailwind v4（**CSS-only 設定，不要 `tailwind.config.ts`**）、ShadCN |
| UI 產出 | Claude Design 出基礎元件 → 放進 `components/ui` |
| 後端 / DB / Auth / Storage | Supabase |
| 部署 | Vercel（前端）+ Supabase（雲端） |

---

## 3. 關鍵架構決策（定案）

1. **資料存取走 Supabase-native**：全程用 `@supabase/ssr` 的 client，安全靠 **RLS** 當防線，型別用 `supabase gen types` 產出。**不使用 Prisma**（本專案刻意偏離平常的 Prisma/Neon 習慣）。
2. **不做 i18n**：schema 不預留 locale。
3. **作品以「案例」呈現**：`projects` 帶 role / outcome / client_type，不只是截圖牆。
4. **文章內容存 DB**（Markdown 純文字），發文改文不用重新部署。
5. **v1 先不做後台 `/admin`**：內容先手動在 Supabase Studio 建立；後台 CRUD 延到 v1.5。

---

## 4. 資料模型

```
profiles                 -- 對應 auth.users，公開顯示資訊
  id            uuid  PK  → auth.users.id
  display_name  text
  avatar_url    text
  role          text  default 'visitor'   -- 'admin' | 'visitor'
  created_at    timestamptz

projects                 -- 作品（案例框架）
  id            uuid  PK
  slug          text  unique
  title         text
  summary       text                       -- 卡片短描述
  content       text                       -- 詳細內容 (markdown)
  role          text                       -- 你在此案負責什麼
  outcome       text                       -- 成果，盡量有數字
  client_type   text                       -- 客戶類型
  cover_url     text
  tech_stack    text[]
  live_url      text
  repo_url      text
  featured      boolean default false      -- 首頁精選
  sort_order    int    default 0
  published     boolean default false
  created_at / updated_at

posts                    -- 文章
  id            uuid  PK
  slug          text  unique
  title         text
  excerpt       text
  content       text                       -- markdown
  cover_url     text
  published     boolean default false
  published_at  timestamptz
  view_count    int    default 0
  created_at / updated_at

comments                 -- 留言（掛在文章上）
  id            uuid  PK
  post_id       uuid  FK → posts
  user_id       uuid  FK → auth.users
  parent_id     uuid  FK → comments (nullable)  -- 巢狀回覆，v1 先不做
  content       text
  created_at / updated_at

inquiries                -- 詢價表單送出的資料
  id            uuid  PK
  name          text
  email         text
  message       text
  source        text                       -- 從哪個頁面來的
  created_at    timestamptz

testimonials             -- 客戶好評 / 推薦
  id            uuid  PK
  name          text
  role          text
  company       text
  quote         text
  avatar_url    text
  sort_order    int    default 0
  published     boolean default false

subscribers              -- 電子報訂閱（v1 先建表，功能後做）
  id            uuid  PK
  email         text unique
  created_at    timestamptz

site_settings            -- 單列設定表
  id            int   PK default 1
  accepting_work boolean default true      -- 接案狀態 badge
```

延後：`tags` / `post_tags`、留言審核狀態。

---

## 5. Auth 設計

- Supabase Auth 開 **Google provider**，前端 `signInWithOAuth({ provider: 'google' })`。
- 用 **`@supabase/ssr`**（不是已淘汰的 auth-helpers）。三種 client：browser / server component / middleware。
- `app/auth/callback/route.ts` 交換 code、寫 session cookie。
- 根目錄 `proxy.ts` 每次請求刷新 session（Next.js 16 起 middleware 檔案慣例改名為 proxy，跑在 Node.js runtime）。
- 新用戶首次登入 → Postgres trigger 自動在 `profiles` 建一列。
- **admin 怎麼設**：手動去 Supabase Studio 把自己那列 `profiles.role` 改成 `'admin'`；所有寫入權限的 RLS 看這個欄位。

---

## 6. RLS 政策概要

- `posts` / `projects` / `testimonials`：任何人可讀 `published = true`；寫入限 admin。
- `comments`：任何人可讀；登入者可 insert（且 `user_id` 必須等於自己）；只能改／刪自己的，admin 全權。
- `profiles`：公開讀顯示欄位；只能改自己那列。
- `inquiries` / `subscribers`：任何人可 insert；只有 admin 可讀。
- `site_settings`：任何人可讀；只有 admin 可寫。

---

## 7. 目錄結構

```
personal-site/
├── app/
│   ├── (site)/                    # 公開頁
│   │   ├── page.tsx               # 首頁：hero + 精選作品 + 最新文章 + 接案 CTA
│   │   ├── about/page.tsx         # 關於我（接案導向）
│   │   ├── work/
│   │   │   ├── page.tsx           # 作品列表
│   │   │   └── [slug]/page.tsx    # 單一作品（案例）
│   │   └── blog/
│   │       ├── page.tsx           # 文章列表
│   │       └── [slug]/page.tsx    # 單篇 + 留言區
│   ├── (admin)/admin/…            # 後台（v1.5 才做）
│   ├── auth/callback/route.ts     # OAuth callback
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                        # Claude Design / ShadCN 基礎元件
│   ├── layout/                    # Header, Footer, Nav
│   └── blog/  work/  comments/    # 各功能區塊
├── lib/
│   ├── supabase/{client,server,middleware}.ts
│   ├── queries/                   # 資料存取函式集中放這
│   └── utils.ts
├── types/database.types.ts        # supabase gen types 產出
├── supabase/
│   ├── migrations/                # SQL migration
│   └── config.toml
├── proxy.ts                       # session 刷新（Next.js 16 的 middleware）
├── .env.local
└── …設定檔
```

---

## 8. 路由地圖

| 路徑 | 內容 |
|---|---|
| `/` | 首頁：hero、精選作品、最新文章、接案 CTA、接案狀態 badge |
| `/about` | 關於我，接案導向、好評 |
| `/work` | 作品列表 |
| `/work/[slug]` | 單一作品案例 |
| `/blog` | 文章列表 |
| `/blog/[slug]` | 單篇文章 + 留言區（登入才能留言） |
| `/auth/callback` | Google OAuth callback |

---

## 9. V1 開發路線圖（一次一個 chunk）

- **Chunk 0 — 專案地基**：scaffold Next.js + ShadCN、安裝 Supabase、建 Supabase 專案、`.env.local`、三個 supabase client + `proxy.ts`。（無可見頁面）
- **Chunk 1 — 資料層**：建表 SQL + RLS + trigger、`supabase gen types` 產型別、手動塞幾筆假資料。
- **Chunk 2 — 版面外殼**：layout、Header/Footer/Nav、深色模式、globals。
- **Chunk 3 — 作品**：`/work` 列表 + `/work/[slug]` 案例頁，讀 Supabase。
- **Chunk 4 — 文章**：`/blog` 列表 + `/blog/[slug]` 內頁（Markdown 渲染）。
- **Chunk 5 — 登入**：Google OAuth、登入／登出 UI、profile 自動建列 trigger、header 顯示登入狀態。
- **Chunk 6 — 留言**：文章底下留言列表 + 新增，登入才可留言，RLS 把關。
- **Chunk 7 — 首頁組裝**：hero + 精選作品 + 最新文章 + CTA + 接案 badge。
- **Chunk 8 — 接案轉換件**：`/about`、詢價表單（→ `inquiries` + 寄信通知）+ LINE 連結、好評區。
- **Chunk 9 — SEO / 收尾**：每頁 metadata、動態 OG image、`sitemap.xml`、`robots.ts`、細節打磨。

---

## 10. 分期

- **v1（本次）**：Chunk 0–9。內容手動進 Studio。
- **v1.5**：`/admin` 後台 CRUD、圖片上傳 Storage、瀏覽數、留言即時更新（Realtime）。
- **v2+**：tags/分類與篩選、搜尋、留言巢狀回覆與審核、RSS、電子報寄送、Analytics、FAQ、Services 頁。
