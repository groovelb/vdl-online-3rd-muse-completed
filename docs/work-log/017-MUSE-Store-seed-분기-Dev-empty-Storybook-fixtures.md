---
session: 017
date: 2026-04-22
title: MUSE — Store seed 분기 (Dev는 empty, Storybook은 fixtures)
---

# 017. MUSE — Store seed 분기 (Dev는 empty, Storybook은 fixtures)

## 🎯 User Goal

> Dev(`pnpm dev`)에서 실제 유저 관점으로 end-to-end 플로우를 테스트하려면 references가 27장 더미로 채워져 있으면 안 됨. Dev 버전에서는 레퍼런스를 초기화(빈 상태)하고 Storybook에서는 기존 더미 fixtures를 유지해 쇼케이스 품질 보존.

## 🔑 주요 의사결정

- **`MuseStoreProvider`에 `seed` prop 추가 — 기본값은 `'empty'`**: 대부분의 소비자(App.jsx)에 해당하는 쪽을 기본값으로. 예외 환경(Storybook)에서만 명시적으로 `seed="fixtures"` 지정하도록 비대칭 설계. 실제 프로덕션 동작을 기본으로 하고 특수 케이스를 opt-in.
- **`buildInitialState(seed)` 분기로 단일 함수 유지**: 두 상태 빌더를 별도 함수로 나누는 대신 seed 인자로 분기. 코드 중복 0, 로직 한 곳. seed 값은 `'empty' | 'fixtures'` 2가지.
- **`STORAGE_KEY` `v3 → v4` bump**: 기존 localStorage 캐시에는 27장 더미가 이미 저장된 유저가 있을 수 있음. 키를 bump해 구버전 캐시 자동 무효화. 유저는 최초 진입 시 깨끗한 빈 상태에서 시작.
- **`App.jsx`는 변경하지 않음**: Provider 기본값이 empty이므로 App에서는 `<MuseStoreProvider>`만 쓰면 됨. 변경 범위 최소화 + "dev = empty는 자연스러운 기본" 의미 전달.
- **`RESET_STORE` 액션도 seed 파라미터 수락**: `dispatch({ type: 'RESET_STORE', payload: 'fixtures' })` 형태. Storybook에서 "Store 초기화" 버튼이 empty가 아닌 fixtures로 복귀하고 싶을 때 유연성 제공. 호출처에서는 대체로 생략(empty default).

## 💬 Claude의 핵심 반응

- **변경 범위를 세 파일로 압축**: `museStore.jsx` (seed prop + builder 분기 + reset 확장), `preview.jsx` (fixtures 명시), 끝. App.jsx는 건드리지 않음으로써 "프로덕션 동작은 기본"이라는 설계 의도 자체가 코드로 드러나게.
- **localStorage 캐시 무효화 전략으로 STORAGE_KEY bump 채택**: 마이그레이션 함수를 쓰지 않음. seed 의미가 크게 바뀌었으므로 구 캐시를 살리기보다 버리는 것이 안전.
- **seed 타입을 enum 문자열로**: boolean (e.g. `seeded={true}`)보다 의미 명시적이고 추후 `'minimal'`, `'testing'` 같은 seed 추가 여지 확보. JSDoc에 가능 값 명시.

## 📂 변경된 파일

| 파일 | 종류 | 요약 |
|------|------|------|
| `src/store/museStore.jsx` | 수정 | `buildInitialState(seed)` 분기 추가 (`'empty'` default / `'fixtures'`), `MuseStoreProvider`에 `seed` prop 전달. `STORAGE_KEY` `v3 → v4` bump. `RESET_STORE` action에 payload seed 수용 |
| `.storybook/preview.jsx` | 수정 | `<MuseStoreProvider seed="fixtures">` 로 명시 |

## ✅ 최종 결과

- **Dev 진입 시**: references/projects/analyses 모두 빈 상태. ArchivePage "아직 수집된 레퍼런스가 없습니다" 안내 + FileDropzone 노출 → 업로드 → T1 자동 태깅 → 저장 순서로 실제 유저 온보딩 플로우 그대로 체험.
- **Storybook 진입 시**: 모든 스토리 기존대로 27 레퍼런스 + 4 프로젝트 + 4 분석 표시. 회귀 없음.
- **기존 Dev 캐시 보유 유저**: STORAGE_KEY bump로 자동 리셋. 첫 로드는 빈 상태.

## 🔁 재현 가이드

1. **Provider 기본값은 실제 프로덕션 동작으로**: `seed='empty'`를 default로. 쇼케이스 환경만 opt-in (`seed='fixtures'`).
2. **상태 빌더는 단일 함수 + 인자 분기**: `buildInitialState(seed)` 내부 `if (seed === 'fixtures') { ... }` 분기로 두 경로 유지. 함수 이중화 금지.
3. **스키마 의미가 크게 바뀌면 STORAGE_KEY bump**: persist 데이터 버전 마커를 키 suffix(`_v4`)에 포함하면 migrate 로직 없이도 안전 리셋.
4. **App.jsx는 건드리지 않기**: 의도가 "dev=empty 가 자연"이라면 default를 그 방향으로 설정하고 App에는 prop 생략. 설계 의도가 코드 표면에 드러남.
5. **Storybook decorator만 `seed="fixtures"` 추가**: preview.jsx 데코레이터에 한 줄. 모든 스토리가 자동으로 fixtures 모드 적용.
6. **RESET action도 seed 받도록**: 향후 "처음 더미로 돌아가고 싶다" 요구가 Storybook에서 발생할 것. payload로 seed 전달 가능하게 미리 확장.

> 💡 핵심 포인트:
> - **기본값은 프로덕션**: 프레임워크/테스트용 기본값이 실제 앱 동작에 섞이면 "왜 여기에 더미 데이터가?" 혼란 발생. 기본값은 항상 실제 유저 환경 기준.
> - **persist key suffix = 무료 마이그레이션**: 스키마·의미 변경마다 `_vN` 만 올리면 구버전 캐시가 자동으로 버려짐. migrate 함수 작성 비용 0.
> - **seed는 enum 문자열**: boolean flag (`seeded` / `withFixtures`) 로 시작하면 2 상태 이상 필요해질 때 breaking change. 처음부터 enum 문자열이 확장성 확보.
