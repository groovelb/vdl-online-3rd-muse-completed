---
session: 018
date: 2026-04-23
title: MUSE — 02-ux-flow 데이터 모델 동기화 + Supabase 백엔드 연동 계획·튜토리얼 작성
---

# 018. MUSE — 02-ux-flow 데이터 모델 동기화 + Supabase 백엔드 연동 계획·튜토리얼 작성

## 🎯 의도 (User Goal)

> 백엔드(Supabase) 연동 전, `docs/muse/02-ux-flow.md` 의 데이터 모델이 실제 구현(`src/data/muse/schemas.js` 등)과 일치하는지 더블체크하고 동기화. 이어서 `/supabase-integration` 스킬 기반으로 **MUSE 특화 연동 계획서 + 단계별 튜토리얼**을 작성해 Phase 1 진입 준비를 끝낸다.

## 🔑 주요 의사결정

- **02-ux-flow 데이터 모델 섹션에 `src/data/muse/schemas.js` 단일 진실 원천 포인터 추가**: 기존 문서는 schema 파일을 참조하지 않아 실제와 drift 발생. aiTasks.js 섹션이 이미 동일 패턴(단일 진실 원천 명시)이라 복제
- **`Reference.tags` 를 flat `tags[]` → `ReferenceLayeredTags` (중첩) 로 정정**: 실제 구현은 `{color, typography, layout, gradient, visualDirection.{genre,style,subject}}` 구조. preset 어휘 기반 중첩이 단일 진실
- **제네릭 `Token` 행 폐기 → `AnalysisLayers` 서브섹션으로 분리**: 레이어별 토큰 shape 이 이종(ColorToken/TypographyToken/LayoutToken/GradientToken + VisualDirectionLayer). 단일 스키마로 묶으면 DB 설계가 왜곡됨
- **`tags jsonb` + `layers jsonb` 채택**: 편집이 항상 "통째로" 단위이고 레이어별 shape 이 이종이라 정규화 비용 과다. GIN 인덱스로 검색 충분. 결정 근거를 계획서 2장에 명시
- **RLS 전략 = owner-only (단일 사용자 계정 서비스)**: 팀/공유 없음, 계정 단위 사적 워크스페이스. `is_project_owner()` helper 로 analysis_results / project_references 간접 소유 체크
- **기존 localStorage 마이그레이션 폐기**: MUSE 는 아직 프로덕션 유저 0명. 복잡한 migrate 함수 대신 clean cutover
- **테이블명 `references` → `reference_items` 개명 예정**: PostgreSQL 예약어 `REFERENCES` 와 충돌. 프론트 훅 이름(`useReferencesSlice`)은 유지, DB 레이어에서만 `reference_items` 로 매핑. (Phase 1 시작 시 사용자 승인 후 확정)
- **Edge Function `anthropic-proxy` 필수 지정**: 현 Dev 프록시(`.storybook/museApiPlugin.js`)는 Vite dev 전용 → 프로덕션 배포 시 AI 호출 경로 소실. Phase 6 에서 서버화 + `ANTHROPIC_API_KEY` 를 Supabase secrets 로 이전
- **RLS 안전장치 체크리스트 정비 (재수정)**: 초기에 "Dashboard Enable RLS on new tables ON" 을 권장했으나 사용자가 UI 에서 토글을 찾지 못함. 스킬 원문 재확인 결과 실존하지만 Supabase UI 개편 영향 가능 → "마이그레이션으로만 스키마 관리하므로 이 토글은 무관, Advisors → Security + 마이그레이션 `enable row level security` 명시가 진짜 방어선" 으로 문구 정정

## 💬 Claude의 핵심 반응

- **데이터 모델 실체 확인은 schemas.js > docs**: 불일치 발견 시 문서 쪽을 고침 — 실제 구현이 단일 진실 원천이고, 문서는 그 관람 창구
- **정규화 vs jsonb 논의를 "편집 단위 X 검색 요건" 2축으로 판단**: MUSE 는 편집 = 통째, 검색 = 단순 containment → jsonb 채택 명확. 교과서 정규화 원칙을 맹신하지 않고 도메인 특성을 우선
- **RLS 는 Supabase 의 유일한 서버사이드 보안 레이어 (anon key 공개 전제)**: Phase 3 자동 검증 쿼리 + Advisors 경고 0건 + 마이그레이션 명시 3중 방어
- **Phase 1 전 체크 2가지를 사용자 결정 사항으로 명시**: (a) `references` 테이블명 개명 여부 (b) 로컬 Docker 검증 vs 원격 바로 push — skill 원칙대로 승인 게이트 엄수

## 📂 변경된 파일

| 파일 | 종류 | 요약 |
|------|------|------|
| `docs/muse/02-ux-flow.md` | 수정 | 데이터 모델 섹션 전면 개편. schemas.js 포인터 추가, `ReferenceLayeredTags` 중첩 구조 명시, `AnalysisLayers` 레이어별 토큰 상세표로 분리, UserSettings 에 isAutoTagEnabled 추가 |
| `docs/muse/backend-integration-plan.md` | 추가 | Phase 1~6 전체 로드맵 + MUSE 데이터모델 → Postgres 매핑 (6 테이블) + RLS 매트릭스 + Edge Function 설계 + 환경변수 최종 상태 |
| `docs/muse/backend-integration-tutorial.md` | 추가 | Step 0 (Supabase 프로젝트 생성/link) ~ Step 6 (Edge Function 배포) 실행 매뉴얼 + 트러블슈팅 섹션 |
| `.env.local` | 수정 | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 추가. ANTHROPIC_API_KEY 는 Phase 6 전환 메모 추가 후 유지 |
| `.env.example` | 수정 | Supabase 변수 템플릿 추가 (실제 값은 .env.local) |

## ✅ 최종 결과

- **Phase 0 프리체크 완료** — `.env.local` 에 Supabase 키 등록, CLI v2.84.2 설치 확인, `.gitignore` 안전, 계획/튜토리얼 문서 2종 비치
- **데이터 모델 동기화 완료** — 02-ux-flow 문서와 실제 schemas.js 간 7개 불일치 지점 정정
- **Phase 1 진입 대기** — 사용자 결정 2개(테이블명 개명, 로컬/원격 적용 방식)만 받으면 즉시 스키마 마이그레이션 작성 가능

## 🔁 재현 가이드

1. **먼저 실제와 문서 불일치 감사**: `docs/muse/02-ux-flow.md` 의 데이터 모델 섹션을 `src/data/muse/schemas.js` 와 라인별 비교. 불일치 발견 시 표로 정리 (엔티티명 / 문서 표기 / 실제 타입 / 조치)
2. **단일 진실 원천 포인터 추가**: 문서 상단에 `> 단일 진실 원천: src/data/muse/schemas.js` 명시. aiTasks.js 섹션 패턴 복제
3. **`/supabase-integration` 호출**: "계획을 짜고 튜토리얼도 만들어" 로 invoke → Phase 0 자동 프리체크 실행
4. **결정 포인트 3개 확정** (사용자와 합의): jsonb vs 정규화 / localStorage 마이그레이션 폐기 / 단일 사용자 계정 서비스 (owner-only RLS)
5. **계획서 작성** (`backend-integration-plan.md`): 현재 상태 → 목표 → 테이블 매핑 → RLS 매트릭스 → Edge Function 설계 → 환경변수 최종 상태 → Phase 게이트
6. **튜토리얼 작성** (`backend-integration-tutorial.md`): Step 0 (Supabase 계정/link/env) ~ Step 6 (Edge Function 배포 + 키 revoke). 각 스텝에 명령어 + 검증 체크리스트 + 승인 게이트
7. **`.env.local` 업데이트**: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` 추가. anon key 는 브라우저 노출 전제이므로 `VITE_` 프리픽스 허용
8. **Phase 1 전 최종 2 결정**: (a) 테이블명 `references` (PG 예약어) 개명 여부 (b) `supabase db reset` 로컬 검증 vs 원격 `db push` 직행

> 💡 핵심 포인트:
> - **데이터 모델 문서는 실제 스키마 파일을 "참조"만 해야 함**: 독립적으로 작성하면 항상 drift. `schemas.js` 같은 단일 진실 원천 + 문서는 관람 창구 패턴이 안전
> - **jsonb 결정의 2축**: 편집 단위(통째 vs 부분) X 검색 요건(단순 containment vs 집계 통계). 편집=통째 + 검색=단순이면 jsonb 가 거의 항상 승리
> - **anon key 공개 전제 + RLS 가 유일한 방어**: Supabase 아키텍처의 핵심. 프론트에 키가 박힌다는 사실과 RLS 의 역할을 혼동하면 보안 설계가 어긋남
> - **PostgreSQL 예약어 조심**: `references`, `user`, `order`, `group` 등은 테이블명으로 쓰면 quote 지옥. 초기에 이름만 바꾸면 평생 편함
> - **Edge Function 은 "dev 전용 프록시" 의 프로덕션 카운터파트**: 로컬 Vite middleware 로 기능 검증 → Edge Function 으로 이전 패턴이 비용·안정성 밸런스
