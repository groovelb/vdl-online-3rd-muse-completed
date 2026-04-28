-- MUSE — theme_mode enum 에 'system' 복구 + 기본값 'system' 으로 변경
--
-- 기존: 'light' | 'dark'  (default 'light')
-- 변경: 'light' | 'dark' | 'system'  (default 'system')
--
-- 사유: OS prefers-color-scheme 추종이 표준 UX. 20260423130628 에서 일시 축소했던 것을 되돌림.

alter type public.theme_mode add value if not exists 'system';

alter table public.user_settings
  alter column theme_mode set default 'system'::public.theme_mode;
