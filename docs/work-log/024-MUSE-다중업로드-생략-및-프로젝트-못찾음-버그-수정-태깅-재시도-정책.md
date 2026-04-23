---
session: 024
date: 2026-04-23
title: MUSE — 다중 업로드 간헐 생략 + 프로젝트 생성 후 "없는 프로젝트" 에러 수정 + T1 태깅 재시도 정책
---

# 024. MUSE — 다중 업로드 간헐 생략 + 프로젝트 생성 후 "없는 프로젝트" 에러 수정 + T1 태깅 재시도 정책

## 🎯 의도 (User Goal)

> 3개 이슈 점검 + 수정:
> (1) 레퍼런스 여러 개 등록 시 간헐적으로 일부 누락,
> (2) 프로젝트 생성 후 "없는 프로젝트 번호" 에러 간헐 발생,
> (3) T1 태깅 실패 시 자동 재시도 + 수동 재시도 UI.

## 🔑 주요 의사결정

- **프로젝트 못 찾음 = `await` 누락 확정**: `ProjectCreateRoute.onComplete` 가 동기 콜백인데 `addProject`/`setAnalysis` 는 async (Supabase insert 왕복 포함). await 없이 즉시 `navigate` → dispatch 전에 URL 이동 → DetailRoute 가 state.projects 에서 못 찾음. 가끔 성공하는 건 Supabase 가 매우 빠를 때 우연히 dispatch 가 navigate 직후 렌더에 맞춰진 케이스. 100% 재현성 버그를 간헐적으로 체감한 것
- **업로드 생략 = Promise.allSettled 무제한 병렬 + 단일 시도 조합**: 10장 이상 동시 병렬 업로드 시 Supabase Storage 또는 Anthropic rate limit 으로 일부 drop. 실패한 uploadOne 은 dispatch 안 돼 그리드에서 생략처럼 보임. 완벽 확신은 없지만 가장 유력한 가설 — 로그 없이는 확정 불가라고 사용자에게 명시
- **업로드 생략 방어 3중**: (a) concurrency limit 3 (`runWithConcurrency` 헬퍼) — 병렬 폭주 방지, (b) addReference 1회 재시도 (500ms 후) — Storage/DB 일시 장애 복구, (c) 실패 파일명 Alert 에 노출 — 사용자 가시성
- **태깅 실패 정책 = 자동 재시도 3회 + 유지 + 수동 재시도**: 자동 삭제는 금지. 사용자가 의도해서 업로드한 자원을 AI 실패로 날리면 황당. 대신 `_tagError` 플래그 + 카드에 🔄 버튼 → 수동 재시도. 삭제는 기존 hover 🗑 로 사용자 선택
- **재시도 가능성 에러 분류**: 429/5xx/network/timeout/tool_use 응답 없음 → 재시도. 4xx (429 제외) → 즉시 포기 (재호출 무의미). `callAnthropic` 이 이미 `err.status` 세팅해놓아서 분기 간단
- **Exponential backoff 500ms → 1500ms**: 3x 증가. 첫 재시도 빠르게, 두 번째는 여유. 총 최대 2초 지연
- **"확신해?" 질문 정직히 답변**: 버그 2 는 코드 근거로 100% 확신, 버그 1 은 60% 추정이라 명시. 방어 코드는 여러 원인에 광범위 커버되지만 정확한 원인 확정은 로그 공유 필요

## 💬 Claude의 핵심 반응

- **버그 2 원인은 명백한 async/await 누락**: 코드 추적만으로 충분. `addProject` 가 `if (remote && user) { await supabase... } dispatch(...)` 구조라 Supabase 왕복 후에만 dispatch 가 발생. 즉시 navigate 하면 race 확정
- **업로드 race 분석은 추론 여러 개**: React useReducer 는 순차 처리 → dispatch 자체는 누락 안 됨. 가장 유력한 건 uploadOne 이 throw 돼서 그 reference 가 dispatch 조차 안 된 케이스
- **"몇 번 시도 후 제거" 정책은 반대**: 사용자 의도 보존 우선. 태깅 실패 ≠ 레퍼런스 폐기. UI 에서 수동 재시도 or 수동 삭제 선택권 남김
- **isRetryableError 분류 로직을 museAiTasks.js 에 배치**: 에러 분류는 AI task 레이어 책임. ArchivePage 는 단순 호출 → 결과만 처리

## 📂 변경된 파일

### 버그 수정

| 파일 | 종류 | 요약 |
|------|------|------|
| `src/pages/ProjectCreateRoute.jsx` | 수정 | `onComplete` → `async`. `await addProject(...); await setAnalysis(...);` 후 `navigate`. try/catch 로 실패 시 alert 표시. 버그 2 확정 fix |
| `src/components/templates/ArchivePage.jsx` | 수정 | `runWithConcurrency(items, limit, fn)` 헬퍼 신규, `handleUploadFiles` 가 concurrency 3 으로 전환 (기존 무제한 Promise.allSettled). `uploadOne` 에 addReference 1회 재시도. 실패 파일명 리스트 → Alert 메시지 |

### 태깅 재시도 정책

| 파일 | 종류 | 요약 |
|------|------|------|
| `src/utils/museAiTasks.js` | 수정 | `isRetryableError(err)` 헬퍼 (429/5xx/network → retry / 4xx-429제외 → 포기). `runAutoTag` 에 `maxAttempts=3` + exponential backoff (500ms→1500ms). 비재시도 에러는 즉시 throw |
| `src/components/templates/ArchivePage.jsx` | 수정 | `retryTagging(ref)` 핸들러 — signed URL → base64 → resize 512 → runAutoTag 재호출. `_tagError` 배지 안에 `<RefreshIcon>` IconButton 추가. `imageUrlToBase64DataUrl` import |

## ✅ 최종 결과

- **버그 2 해결**: 프로젝트 생성 → Detail 페이지 정상 진입. race 0
- **버그 1 방어 3중**: 동시 3개 배치 + addReference 재시도 + 실패 파일명 가시화
- **태깅 자동 재시도**: 업로드 시 T1 호출이 429/5xx/network 만나도 최대 3회 재시도로 자동 복구
- **수동 재시도 UI**: 에러 배지에 🔄 버튼. 클릭 시 태깅 재수행
- `pnpm build` 성공

## 🔁 재현 가이드

### 버그 2 fix (ProjectCreateRoute)

1. `onComplete` prop 을 `async` 로 바꾸고 `addProject(project)` 와 `setAnalysis({...})` 를 모두 `await`
2. try/catch 로 감싸 실패 시 alert + return (navigate 안 함)
3. 성공 경로에서만 `navigate(/projects/${id})`

### 버그 1 방어 (ArchivePage 다중 업로드)

1. `uploadOne` 안에 `addWithRetry` 함수 내재: 첫 시도 실패 시 500ms 대기 후 1회 재시도
2. `runWithConcurrency(items, limit, fn)` 헬퍼:
   ```js
   const worker = async () => {
     while (cursor < items.length) {
       const i = cursor; cursor += 1;
       try { results[i] = { status: 'fulfilled', value: await fn(items[i]), item: items[i] }; }
       catch (e) { results[i] = { status: 'rejected', reason: e, item: items[i] }; }
     }
   };
   await Promise.all(Array(Math.min(limit, items.length)).fill(null).map(worker));
   ```
   N 개 worker 가 공유 cursor 에서 다음 item 뽑아 순차 실행 — JS 표준 concurrency 패턴
3. `handleUploadFiles` 에서 `Promise.allSettled(...)` → `runWithConcurrency(list, 3, uploadOne)` 교체
4. 실패 파일명 상위 3개 + "외 N장" 포맷으로 Alert. 콘솔에는 `{name, reason}` 풀 로그

### 태깅 재시도 정책

1. `museAiTasks.js` 에 `isRetryableError(err)`: `err.status` 기반 — 없음/429/5xx true, 4xx(429제외) false
2. `runAutoTag` 의 호출 블록을 `for (let attempt = 1; attempt <= maxAttempts; ...)` 루프로 감싸기
3. catch 안에서 `if (!isRetryableError(e) || attempt === maxAttempts) throw e;` 이후 `await new Promise(r => setTimeout(r, 500 * Math.pow(3, attempt - 1)))`
4. ArchivePage `retryTagging(ref)`:
   - `updateReference(ref.id, { _pending: true, _tagError: null })` 로 UI 상태 리셋
   - `imageUrlToBase64DataUrl(ref.thumbnailUrl)` → `resizeDataUrl(dataUrl, 512)` → `runAutoTag`
   - 성공: 태그/추출값 + `_pending: false, _tagError: null`
   - 실패: `_pending: false, _tagError: e.message`
5. 카드 `_tagError` 배지 디자인: `display: flex` 로 "태깅 실패" 텍스트 + `<IconButton>` 내부에 `<RefreshIcon fontSize 14>`. `onClick` 에 `stopPropagation` + `retryTagging(item)`

> 💡 핵심 포인트:
> - **async 콜백을 동기 prop 으로 전달 = navigate race 버그**: 내부에서 Supabase 왕복이 있으면 await 없이 호출 시 dispatch 전에 URL 이동. React-router 의 navigate 는 즉시 동작하므로 이후 렌더에 반영 안 됨
> - **Promise.allSettled 무제한 병렬은 프로덕션 금지**: rate limit / Storage 동시성 / 메모리 압박 전부 risk. 기본 concurrency 3~5 로 제한, 대용량은 별도 batch 패턴 사용
> - **재시도 분류는 status 기반**: 4xx 는 재호출해도 같은 에러. 5xx/429/network 만 재시도. `callAnthropic` 이 status 를 err 에 붙여주는 관습이 이 분기의 전제
> - **실패 시 자동 삭제 금지**: 사용자 의도 자원은 AI 실패로 날리지 말 것. 수동 재시도 + 수동 삭제 선택권 제공이 UX 원칙
> - **Exponential backoff 3x 증가**: 500ms → 1500ms → 4500ms 지수. Anthropic rate limit 구멍이 보통 1-2초 수준이라 맞춤
> - **stopPropagation 필수**: 카드 안의 IconButton 클릭 이벤트가 카드 전체 onClick (selection/navigation) 으로 버블링되면 안 됨
