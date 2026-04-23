-- MUSE — theme_mode enum 을 light/dark 만으로 축소 + 기본값 변경
--
-- 기존: 'light' | 'dark' | 'system'
-- 변경: 'light' | 'dark'  (default 'light')

update public.user_settings set theme_mode = 'light' where theme_mode = 'system';

alter table public.user_settings alter column theme_mode drop default;

create type public.theme_mode_new as enum ('light', 'dark');
alter table public.user_settings
  alter column theme_mode type public.theme_mode_new
  using theme_mode::text::public.theme_mode_new;

drop type public.theme_mode;
alter type public.theme_mode_new rename to theme_mode;

alter table public.user_settings
  alter column theme_mode set default 'light'::public.theme_mode;
