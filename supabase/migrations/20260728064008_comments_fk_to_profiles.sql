-- ---------------------------------------------------------------------------
-- comments.user_id 的外鍵從 auth.users 改為 public.profiles
--
-- 為什麼：PostgREST 只能沿著「直接外鍵」做 embedded join。原本
-- comments.user_id → auth.users、profiles.id → auth.users，兩張表是兄弟關係，
-- 中間沒有直接外鍵，所以 select("*, profiles(...)") 會回 PGRST200
-- （Could not find a relationship between 'comments' and 'profiles'）。
-- 改指向 profiles 之後就能直接關聯查詢，不必再手動合併兩次查詢的結果。
--
-- 資料相容：profiles.id 本身就是 auth.users(id) 的外鍵且值相同，
-- 而 profiles 由 handle_new_user() trigger 在使用者建立時自動補上，
-- 因此既有的 user_id 值在 profiles 都找得到對應列。
--
-- 刪除連鎖仍然成立：auth.users 刪除 → profiles 連鎖刪除 → comments 連鎖刪除。
--
-- RLS 不需要調整：政策用的是 auth.uid() = user_id，
-- 而 profiles.id 等於 auth.users.id，比較的值完全沒變。
-- ---------------------------------------------------------------------------

alter table public.comments
  drop constraint comments_user_id_fkey;

alter table public.comments
  add constraint comments_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;
