-- MUSE — Auth profiles auto-provision (Phase 2)
--
-- auth.users INSERT 시 profiles + user_settings row 를 자동으로 생성.
-- 닉네임은 이메일 local-part 로 초기화 (충돌 시 short uuid suffix).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_nickname text;
  final_nickname text;
  attempt int := 0;
begin
  base_nickname := split_part(new.email, '@', 1);
  final_nickname := base_nickname;

  while attempt < 5 and exists (select 1 from public.profiles where nickname = final_nickname) loop
    final_nickname := base_nickname || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 4);
    attempt := attempt + 1;
  end loop;

  insert into public.profiles (id, nickname)
  values (new.id, final_nickname);

  insert into public.user_settings (user_id)
  values (new.id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
