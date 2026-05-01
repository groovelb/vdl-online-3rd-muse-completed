# SQL 예약어 + 흔한 충돌 단어

> ux-flow § 데이터 모델 활용의 "예상 테이블명" 컬럼 작성 시 이 목록과 비교. 충돌 발견 즉시 사용자에게 대안 제안.

## PostgreSQL 예약어 (테이블명 사용 금지)

```
all, analyse, analyze, and, any, array, as, asc, asymmetric, both, case, cast,
check, collate, column, constraint, create, current_catalog, current_date,
current_role, current_time, current_timestamp, current_user, default, deferrable,
desc, distinct, do, else, end, except, false, fetch, for, foreign, from, grant,
group, having, in, initially, intersect, into, lateral, leading, limit, localtime,
localtimestamp, not, null, offset, on, only, or, order, placing, primary, references,
returning, select, session_user, some, symmetric, table, then, to, trailing, true,
union, unique, user, using, variadic, when, where, window, with
```

## 흔한 충돌 단어 + 권장 대안

테이블명으로 자주 시도되지만 충돌하는 단어 → MUSE 패턴 권장.

| 충돌 단어 | 권장 대안 | 이유 |
|---|---|---|
| `references` | `reference_items` | PG 예약어 (FK 키워드) |
| `user` | `users` 또는 `profiles` | PG 예약어. Supabase `auth.users` 와 분리 위해 `profiles` 권장 |
| `order` | `orders` | PG 예약어 (ORDER BY) |
| `group` | `groups` | PG 예약어 (GROUP BY) |
| `select` | `selections` | PG 예약어 |
| `case` | `cases` | PG 예약어 (CASE WHEN) |
| `default` | `defaults` 또는 `preferences` | PG 예약어 |
| `column` | `columns_meta` | PG 예약어 |
| `table` | (테이블명에 안 쓰는 게 정답) | PG 예약어 |
| `session` | `sessions` | PG 예약어 후보 |
| `transaction` | `transactions` | PG 예약어 |

## 충돌 검증 룰

테이블명이 다음 조건 중 하나에 해당하면 차단:
1. 위 PG 예약어 목록 (대소문자 무관) 에 정확히 일치
2. 흔한 충돌 단어 표의 "충돌 단어" 컬럼에 일치

검증 시 메시지 예:
```
⚠️ 테이블명 충돌
- 사전의 `references` 가 PostgreSQL 예약어와 충돌합니다 (FK 키워드).
- 권장 대안: `reference_items`
- ux-flow § 데이터 모델 활용의 "예상 테이블명" 을 `reference_items` 로 갱신해주세요.
```

## Supabase 예약 스키마

다음 이름은 Supabase 가 강제하므로 사용자 정의 테이블명으로 사용 금지:

| 이름 | 용도 |
|---|---|
| `auth.users` | Supabase Auth (인증 사용자). 프로필 정보는 `profiles` 별도 테이블 권장 |
| `auth.*` | Supabase Auth 내부 |
| `storage.*` | Supabase Storage 내부 |
| `realtime.*` | Realtime 구독 메타 |

→ ux-flow 사전의 "예상 테이블명" 이 `auth.users` 면 OK (Supabase 내장 표기로 사용). 그 외 `auth.*` / `storage.*` / `realtime.*` 은 차단.
