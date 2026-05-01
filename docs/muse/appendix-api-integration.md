# appendix. API Integration Guide (MUSE)

> 프론트 ↔ Supabase 클라이언트 연동 + 검증 부록. 디자이너 미열람 전제.

## 파일 구조

| 파일 | 역할 |
|------|------|
| `src/lib/supabase.js` | client singleton + session listener |
| `src/utils/supabaseError.js` | Supabase 에러 코드 → 한국어 메시지 정규화 |
| `src/types/database.js` | JSDoc typedef (TS 미사용) |
| `src/hooks/auth/useAuth.js` | 현재 세션 / 사용자 |
| `src/hooks/auth/useSignUp.js` | 회원가입 |
| `src/hooks/auth/useSignIn.js` | 로그인 |
| `src/hooks/auth/useSignOut.js` | 로그아웃 |
| `src/hooks/data/useReferences.js` | Reference CRUD |
| `src/hooks/data/useProject.js` | Project + ProjectReferences 큐레이션 |
| `src/hooks/data/useAnalysis.js` | AnalysisResult 조회·실행 |
| `src/hooks/data/useUserSettings.js` | UserSettings R/W |

## 사용 예시

### 회원가입

```jsx
const { signUp, loading, error } = useSignUp();
await signUp({ email, password });
// → 이메일 인증 메일 발송됨
```

### 로그인

```jsx
const { signIn, loading, error } = useSignIn();
await signIn({ email, password });
```

### 데이터 조회 (Storybook 호환 mock 주입)

```jsx
const { data: references, loading } = useReferences();
// Storybook: useReferences({ client: mockClient })
```

### 분석 실행 (T3, Edge Function 경유)

```jsx
const { runAnalysis, loading, error } = useAnalysis(projectId);
await runAnalysis();
// 내부에서 supabase.functions.invoke('anthropic-messages', ...) 호출
```

## 에러 처리

모든 Supabase 에러는 `supabaseError.js` 를 거쳐 한국어 메시지로 변환.

| 코드 | 메시지 |
|------|--------|
| `23505` | 이미 사용 중인 닉네임/이메일입니다 |
| `42501` | 권한이 없습니다 (RLS 차단) |
| `PGRST301` | 세션이 만료되었습니다. 다시 로그인해주세요 |
| 그 외 | 알 수 없는 오류가 발생했습니다 |

## JSDoc 타입 자동 생성

```bash
supabase gen types typescript --linked > /tmp/db.ts
node .claude/skills/supabase-integration/resources/scripts/ts-to-jsdoc.mjs /tmp/db.ts > src/types/database.js
```

`package.json`:
```json
"db:types": "supabase gen types typescript --linked > /tmp/db.ts && node .claude/skills/supabase-integration/resources/scripts/ts-to-jsdoc.mjs /tmp/db.ts > src/types/database.js"
```

## 마이그레이션 적용 + 검증 (Phase 5)

```bash
# 로컬
supabase start
supabase db reset    # 모든 마이그레이션 재적용

# 원격
supabase db push
```

### 스모크 테스트 체크리스트

- [x] 회원가입 → 이메일 인증 링크 수신 → 로그인 성공
- [x] 로그인 사용자만 본인 데이터 접근 (RLS 검증)
- [x] 비로그인 상태에서 보호 API 접근 차단
- [x] 토큰 만료 시 자동 갱신
- [x] `updated_at` 트리거 동작
- [x] `handle_new_user` 트리거 → profiles + user_settings 자동 생성
- [x] Storybook 데이터 훅 mock 동작
- [x] SQL 기반 RLS 완전성 검증 ([appendix-rls-policies.md § 검증](./appendix-rls-policies.md))

## 자주 발생하는 이슈

### Q. 회원가입 후 로그인이 안 돼요

A. 이메일 인증이 필수. Inbox / 스팸함 확인.

### Q. RLS 차단 에러 (42501)

A. [appendix-rls-policies.md](./appendix-rls-policies.md) 의 해당 테이블 정책 확인. 본인 데이터 접근하는지 검증.

### Q. Storybook 에서 Supabase 호출이 실행돼요

A. 훅에 `{ client }` 파라미터로 mock 주입. `resources/storybook-mock.md` 참조.

## OAuth 확장

미지원. 추가는 `resources/auth-flows.md#oauth-확장`.
