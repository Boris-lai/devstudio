-- ---------------------------------------------------------------------------
-- 開發用假資料
--
-- 用途：貼到 Supabase Studio 的 SQL Editor 執行。
--       Studio 以 postgres 角色執行，會繞過 RLS，所以能直接寫入。
--       （用 anon key 從 app 端寫是進不來的，projects/posts 的寫入政策限 admin。）
--
-- 這份檔案可以重複執行：每個 insert 都帶 on conflict (slug) do nothing，
-- 重跑不會報錯也不會產生重複資料。
--
-- 想重來一次的話，先手動清掉：
--   delete from public.posts    where slug in ('supabase-rls-note', 'nextjs-16-proxy-rename');
--   delete from public.projects where slug in ('yuxiang-bakery-order', 'wenshan-clinic-booking', 'hexing-hardware-catalog');
-- ---------------------------------------------------------------------------


-- ===========================================================================
-- projects — 3 筆，全部 published = true
-- ===========================================================================

-- 第 1 筆：完整資料（featured，各欄位都有值）
insert into public.projects (
  slug, title, summary, content, role, outcome, client_type,
  cover_url, tech_stack, live_url, repo_url, featured, sort_order, published
) values (
  'yuxiang-bakery-order',
  '裕祥烘焙坊 — 線上預訂系統',
  '把每天靠 LINE 手動接單的流程搬上網，訂單自動彙整到後台，減少漏單與抄單時間。',
  $md$
## 客戶遇到的問題

裕祥烘焙坊原本所有預訂都走 LINE 官方帳號。店長每天早上要把前一晚的訊息一則一則抄到紙本表格，再交給廚房備料。這個流程有三個痛點：

- 訊息一多就會漏看，尤其節慶檔期
- 客人改單、取消都夾在對話串裡，容易對不起來
- 沒有任何可以回頭查的訂單紀錄

## 我怎麼做

先花了兩個半天在店裡看他們實際怎麼接單，把流程畫成流程圖跟店長確認過，才開始寫程式。這一步省下後面很多來回。

系統本身刻意做得很薄：客人不需要註冊，填完表單直接送出；店家後台就是一個依「取貨日期」分組的訂單列表，可以標記「已備料」「已取貨」。

### 為什麼沒做會員系統

一開始客戶希望做會員累積點數，但看過客單資料後發現回購客大多是走路五分鐘內的鄰居，本來就會直接來店裡。做會員系統的維護成本遠高於效益，所以第一期先拿掉，把預算放在訂單流程本身。

## 上線後

店長現在早上只要打開後台看今天要出的單，備料完直接勾掉。
$md$,
  '獨立接案。負責需求訪談、流程梳理、系統設計、前後端開發，以及上線後三個月的維運。',
  '上線三個月，線上訂單佔比從 0 成長到 42%；每日人工抄單時間由約 90 分鐘降到 10 分鐘；漏單從每週平均 5 筆降到 0 筆。',
  '在地烘焙店（10 人以下小型商家）',
  null,
  array['Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS', 'Vercel'],
  'https://yuxiang-bakery.example.com',
  'https://github.com/example/yuxiang-bakery',
  true,
  1,
  true
)
on conflict (slug) do nothing;


-- 第 2 筆：最小資料
-- summary / content / role / outcome / client_type / live_url / repo_url 皆為 null，
-- tech_stack 為空陣列 —— 用來驗證卡片 fallback 與內頁空欄位是否自然收合。
insert into public.projects (
  slug, title, summary, content, role, outcome, client_type,
  cover_url, tech_stack, live_url, repo_url, featured, sort_order, published
) values (
  'wenshan-clinic-booking',
  '文山診所 — 線上預約頁',
  null,
  null,
  null,
  null,
  null,
  null,
  '{}',
  null,
  null,
  false,
  2,
  true
)
on conflict (slug) do nothing;


-- 第 3 筆：中間狀態 —— 有 summary 與 tech_stack，但沒有 outcome，也沒有任何連結
insert into public.projects (
  slug, title, summary, content, role, outcome, client_type,
  cover_url, tech_stack, live_url, repo_url, featured, sort_order, published
) values (
  'hexing-hardware-catalog',
  '合興五金 — 產品型錄網站',
  '把散在紙本與 Excel 的兩千多項五金品項整理成可搜尋的線上型錄，業務跑客戶時直接用手機查。',
  $md$
## 背景

合興五金的業務出去跑客戶時，報價要靠翻紙本型錄，型號一改就整本作廢。老闆想要一個「手機打開就能查」的東西，不用很漂亮，但要快、要準。

## 做了什麼

- 把 Excel 的兩千多筆品項清洗後匯入資料庫，統一規格欄位的寫法
- 型錄頁支援型號、品名、規格關鍵字搜尋
- 每個品項有固定網址，業務可以直接把連結傳給客戶

目前還在陸續補產品照片，等圖補齊後會再做一次分類導覽。
$md$,
  '獨立接案。負責資料清洗、網站開發與後續的品項匯入教學。',
  null,
  '五金建材批發商',
  null,
  array['Next.js', 'TypeScript', 'Supabase'],
  null,
  null,
  false,
  3,
  true
)
on conflict (slug) do nothing;


-- ===========================================================================
-- posts — 2 筆，published = true 且有 published_at
-- ===========================================================================

-- 第 1 筆：豐富的 markdown，用來驗證 prose 排版與語法高亮
insert into public.posts (
  slug, title, excerpt, content, cover_url, published, published_at
) values (
  'supabase-rls-note',
  'Supabase RLS 實戰筆記：不要把權限寫在前端',
  '接了幾個用 Supabase 的案子之後，整理一份 RLS 的實作心得，以及幾個我自己踩過的坑。',
  $md$
用 Supabase 做了幾個案子之後，我的結論是：**RLS 不是加分項，是這套架構的地基**。如果你把權限判斷寫在前端，等於整個資料庫對外裸奔 —— anon key 本來就是公開的，任何人打開 DevTools 都拿得到。

## RLS 到底在擋什麼

Supabase 的 anon key 會出現在瀏覽器的 JavaScript 裡，這是設計如此、不是疏失。真正擋住壞人的是資料庫層的 Row Level Security。

換句話說，`.eq('published', true)` 這種寫在前端的過濾條件，只是「決定要拿什麼」，完全不具備安全性。決定「能不能拿」的是 RLS 政策。

> 前端的查詢條件是使用者體驗，資料庫的 RLS 政策才是安全邊界。這兩件事永遠不要混為一談。

### 一個最小可用的政策

以文章表為例，公開讀取只開放已發布的資料，寫入限管理員：

```sql
alter table public.posts enable row level security;

create policy "published posts are viewable by everyone"
  on public.posts for select
  using (published = true or public.is_admin());
```

注意 `enable row level security` 這行 —— 忘記開的話，後面寫再多政策都不會生效。

## 我踩過的三個坑

- **忘記開 RLS**：建完表就急著寫政策，結果 `enable row level security` 沒下。Supabase Studio 的 table 列表會標出來，記得回頭看一眼。
- **在 policy 裡直接查 `profiles` 表造成無限遞迴**：`profiles` 自己的政策又回頭查 `profiles`，就卡住了。解法是把判斷包成 `security definer` 函式。
- **以為前端加了條件就安全**：詳見上一段。

### 把關交給資料庫之後，前端可以很單純

```ts
// 前端這樣寫沒問題，因為真正的把關在資料庫
const { data, error } = await supabase
  .from("posts")
  .select("id, title, slug")
  .eq("published", true)
  .order("published_at", { ascending: false })

if (error) {
  throw new Error(`讀取文章失敗：${error.message}`)
}
```

前端的 `.eq("published", true)` 拿掉也不會外洩未發布的文章，因為 RLS 那層已經擋住了。加上它只是為了語意清楚，以及讓管理員登入時看到的公開頁跟訪客一致。

## 幾個角色的差別

實作時最容易搞混的是這幾個 key 的權限範圍：

| 角色 | 使用位置 | 是否受 RLS 限制 |
| --- | --- | --- |
| `anon` | 瀏覽器、未登入 | 是 |
| `authenticated` | 瀏覽器、已登入 | 是 |
| `service_role` | 只能放在伺服器 | 否，完全繞過 |

`service_role` 這個 key 一旦外流等於資料庫拱手讓人，絕對不要放進任何 `NEXT_PUBLIC_` 開頭的環境變數。

## 小結

把 RLS 當成第一道也是最後一道防線來設計，前端就可以寫得很單純。這個心智模型建立起來之後，Supabase 用起來會順很多。
$md$,
  null,
  true,
  '2026-07-20 10:00:00+08'
)
on conflict (slug) do nothing;


-- 第 2 筆：較短，excerpt 為空字串（驗證卡片沒有摘要時的樣子）
insert into public.posts (
  slug, title, excerpt, content, cover_url, published, published_at
) values (
  'nextjs-16-proxy-rename',
  'Next.js 16 把 middleware 改名成 proxy 了',
  '',
  $md$
升級到 Next.js 16 的時候發現的：`middleware.ts` 這個檔案慣例被改名成 `proxy.ts`，功能完全一樣。

官方的說法是「middleware」這個詞容易讓人聯想到 Express 的中介層，導致被過度使用；改叫 proxy 比較貼近它實際的定位 —— 一層擋在應用程式前面的網路邊界。

另外一個變化是預設 runtime：Proxy 現在預設跑在 Node.js runtime，而且 `runtime` 這個設定選項在 proxy 檔案裡不能用，硬寫會直接報錯。

官方有提供 codemod，不用自己手改：

```bash
npx @next/codemod@canary middleware-to-proxy .
```

它會把檔名跟函式名一起改掉。舊的 `middleware.ts` 目前還能動，但已經標記為 deprecated，早點換掉比較省事。
$md$,
  null,
  true,
  '2026-06-15 09:30:00+08'
)
on conflict (slug) do nothing;
