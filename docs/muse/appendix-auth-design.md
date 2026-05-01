# appendix. Auth Design (MUSE)

> Email + Password 인증 + `profiles` 자동화 부록. 디자이너 미열람 전제.

## 인증 방식

- **Provider**: Email + Password (표준)
- **이메일 인증**: 필수 (Supabase Auth Confirm email ON)
- **비밀번호 정책**: 8자 이상 (Dashboard 권한)
- **세션**: Supabase 기본 (access token 1h, refresh token 자동 갱신)

## profiles 테이블

`auth.users` 는 Supabase 가 관리하므로 프로필 정보는 별도 `profiles` 에 저장. 컬럼 상세는 [appendix-db-schema.md § 1. profiles](./appendix-db-schema.md).

## 자동화 트리거

### `handle_new_user`

`auth.users` insert 시 `profiles` + `user_settings` 에 default row 자동 생성.

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, nickname)
  values (new.id, split_part(new.email, '@', 1));

  insert into public.user_settings (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

**보안 주의**: `security definer` + `set search_path = public` 둘 다 필수. 빠뜨리면 권한 탈취 경로.

## Supabase Dashboard 설정 체크리스트

- [ ] Auth → Providers → **Email** Enabled
- [ ] Auth → Settings → **Confirm email** ON
- [ ] Auth → URL Configuration:
  - Site URL: `http://localhost:5173`
  - Redirect URLs: `http://localhost:5173/*`, 프로덕션 URL
- [ ] Auth → Email Templates → 한국어 커스터마이즈 (선택)

## 클라이언트 플로우

1. **회원가입** → 이메일 인증 링크 발송 → 인증 완료 → 로그인 가능
2. **로그인** → access token localStorage 저장 (Supabase 기본) → 이후 자동 첨부
3. **로그아웃** → 세션 삭제 → 앱 상태 초기화

## 관련 컴포넌트 (`component-work` 위임)

- `LoginForm` (input)
- `SignUpForm` (input)
- `AuthGuard` (layout, 라우트 가드)

## OAuth 확장 (선택)

현재 미지원. 추가는 `resources/auth-flows.md#oauth-확장` 참조.
