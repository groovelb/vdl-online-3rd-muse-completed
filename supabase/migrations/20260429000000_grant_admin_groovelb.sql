-- Grant admin role to groovelb@gmail.com via app_metadata.
-- app_metadata 는 client SDK 로 변경 불가 → JWT 에 포함되어 RLS 에서 안전하게 검증 가능.
-- user_metadata 가 아닌 raw_app_meta_data 에 기록하는 것이 핵심.

update auth.users
   set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
                         || jsonb_build_object('role', 'admin')
 where email = 'groovelb@gmail.com';
