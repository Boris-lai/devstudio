-- =====================================================================
-- 0001_init.sql — 個人網站 初始 schema + RLS + triggers
-- 對應 ARCHITECTURE.md 第 4~6 節。Supabase-native，安全靠 RLS。
-- =====================================================================

-- Supabase 已內建 gen_random_uuid()；保險起見。
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 共用函式
-- ---------------------------------------------------------------------

-- updated_at 自動更新
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
-- profiles
-- =====================================================================
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  role         text not null default 'visitor' check (role in ('visitor','admin')),
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 公開可讀（留言要顯示暱稱／頭像）
create policy "profiles are viewable by everyone"
  on public.profiles for select using (true);

-- v1 刻意不開放使用者更新自己的 profile。
-- 理由：若能改自己那列，就能把 role 改成 'admin' 自行提權。
-- v1 profile 由下方 trigger 從 Google 帶入、對使用者唯讀，
-- 沒有更新政策 = 沒有提權破口。等 v1.5 要做「編輯個人資料」時，
-- 再用 column-level grant 保護 role 欄位後才開 update 政策。

-- 新用戶首次登入 → 自動建 profile（帶入 Google 的名字與頭像）
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name',
             new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 是否為 admin（定義在 profiles 之後，因為函式體會參照該表）。
-- SECURITY DEFINER 讓它讀 profiles 時繞過 RLS，避免 profiles 自身政策遞迴。
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql security definer set search_path = public stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- =====================================================================
-- projects（作品，案例框架）
-- =====================================================================
create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  title       text not null,
  summary     text,
  content     text,
  role        text,
  outcome     text,
  client_type text,
  cover_url   text,
  tech_stack  text[] not null default '{}',
  live_url    text,
  repo_url    text,
  featured    boolean not null default false,
  sort_order  int not null default 0,
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index projects_published_idx on public.projects (published, sort_order);
create trigger projects_set_updated_at before update on public.projects
  for each row execute function public.set_updated_at();

alter table public.projects enable row level security;

create policy "published projects are viewable by everyone"
  on public.projects for select
  using (published = true or public.is_admin());

create policy "admins manage projects"
  on public.projects for all
  using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- posts（文章）
-- =====================================================================
create table public.posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        text not null,
  excerpt      text,
  content      text,
  cover_url    text,
  published    boolean not null default false,
  published_at timestamptz,
  view_count   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index posts_published_idx on public.posts (published, published_at desc);
create trigger posts_set_updated_at before update on public.posts
  for each row execute function public.set_updated_at();

alter table public.posts enable row level security;

create policy "published posts are viewable by everyone"
  on public.posts for select
  using (published = true or public.is_admin());

create policy "admins manage posts"
  on public.posts for all
  using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- comments（留言，掛在文章上）
-- =====================================================================
create table public.comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  parent_id  uuid references public.comments(id) on delete cascade,
  content    text not null check (char_length(content) between 1 and 5000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index comments_post_id_idx on public.comments (post_id, created_at);
create trigger comments_set_updated_at before update on public.comments
  for each row execute function public.set_updated_at();

alter table public.comments enable row level security;

-- 任何人可讀
create policy "comments are viewable by everyone"
  on public.comments for select using (true);

-- 登入者可新增，且 user_id 必須是自己
create policy "authenticated users insert own comments"
  on public.comments for insert to authenticated
  with check (auth.uid() = user_id);

-- 只能改自己的
create policy "users update own comments"
  on public.comments for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 自己可刪，admin 可刪任何
create policy "users delete own comments, admins any"
  on public.comments for delete to authenticated
  using (auth.uid() = user_id or public.is_admin());

-- =====================================================================
-- inquiries（詢價表單）
-- =====================================================================
create table public.inquiries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  message    text not null,
  source     text,
  created_at timestamptz not null default now()
);

alter table public.inquiries enable row level security;

-- 任何人（含未登入）可送出
create policy "anyone can submit an inquiry"
  on public.inquiries for insert to anon, authenticated
  with check (true);

-- 只有 admin 可讀
create policy "admins read inquiries"
  on public.inquiries for select using (public.is_admin());

-- =====================================================================
-- testimonials（客戶好評）
-- =====================================================================
create table public.testimonials (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  role       text,
  company    text,
  quote      text not null,
  avatar_url text,
  sort_order int not null default 0,
  published  boolean not null default false
);

alter table public.testimonials enable row level security;

create policy "published testimonials are viewable by everyone"
  on public.testimonials for select
  using (published = true or public.is_admin());

create policy "admins manage testimonials"
  on public.testimonials for all
  using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- subscribers（電子報，v1 先建表）
-- =====================================================================
create table public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;

create policy "anyone can subscribe"
  on public.subscribers for insert to anon, authenticated
  with check (true);

create policy "admins read subscribers"
  on public.subscribers for select using (public.is_admin());

-- =====================================================================
-- site_settings（單列設定：接案狀態 badge）
-- =====================================================================
create table public.site_settings (
  id             int primary key default 1 check (id = 1),
  accepting_work boolean not null default true,
  updated_at     timestamptz not null default now()
);

insert into public.site_settings (id) values (1) on conflict do nothing;

create trigger site_settings_set_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

create policy "settings are viewable by everyone"
  on public.site_settings for select using (true);

create policy "admins update settings"
  on public.site_settings for update
  using (public.is_admin()) with check (public.is_admin());