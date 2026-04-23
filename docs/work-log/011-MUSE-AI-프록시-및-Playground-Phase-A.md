---
session: 011
date: 2026-04-22
title: MUSE — AI 태스크 프롬프트 등록 + Anthropic 프록시 middleware + T1 Auto-Tag Playground
---

# 011. MUSE — AI 태스크 프롬프트 등록 + Anthropic 프록시 middleware + T1 Auto-Tag Playground

## 🎯 의도 (User Goal)

> (1) MUSE가 Claude API에 위임하는 3개 태스크(T1/T2/T3)의 시스템 프롬프트·tool 스키마·품질 축·골든 예시를 데이터로 중앙 정의. (2) 브라우저에 API 키를 노출하지 않는 Anthropic 프록시 middleware를 Storybook Vite dev 서버에 얹고 헬스 체크 + T1 자동 태깅 Playground로 실제 호출 테스트 시작. (3) `02-ux-flow.md`에 AI 태스크 섹션 추가해 문서와 코드를 동기화.

## 🔑 주요 의사결정

- **시스템 프롬프트는 코드 안에 "데이터"로 고정**: `src/data/muse/aiTasks.js`에 `TASK_AUTO_TAG / TASK_RECOMMEND / TASK_ANALYZE_TOKENS` 3종 오브젝트 + `TAG_VOCABULARY` + `AI_WORKFLOW_DIAGRAM` export. Storybook 문서 스토리와 실제 API 호출이 **단일 진실 원천**을 공유. 프롬프트 수정은 이 파일 한 곳에서만.
- **API 키는 반드시 서버 측에만, 브라우저 인라인 금지**: `VITE_*` 접두어를 절대 사용하지 않고 순수 `ANTHROPIC_API_KEY`로만 관리. Vite의 `loadEnv(mode, cwd, '')`로 Node 플러그인 안에서만 읽고, 브라우저 번들에는 포함 안 됨. `.env.local` 생성 + `.gitignore`에 `.env*` 명시 추가 (`!.env.example` 예외로 템플릿은 커밋 가능).
- **Storybook Vite `viteFinal` + `mergeConfig`로 플러그인 등록**: 직접 `viteConfig.plugins = [...]` 재할당하는 방식 대신 `mergeConfig(config, { plugins: [museApiPlugin()] })` 권장 패턴으로 변경. 이유: Storybook 10은 내부에서 viteFinal 반환값을 merge 단계에 주는데, 단순 push/spread는 일부 경로에서 플러그인이 반영되지 않을 위험이 있음.
- **Tool use 강제 구조**: 3개 태스크 모두 프롬프트만으로 JSON 유도하지 않고 `tool_choice: { type: 'tool', name }` 으로 구조화 출력 강제. 파싱 실패·누락 방지. 클라이언트 헬퍼 `extractToolInput(response, toolName)`이 응답 content blocks에서 첫 tool_use 블록의 input 객체만 뽑아 반환.
- **Playground 헬스 체크를 별도 스토리로 분리**: "플러그인이 로드됐는가 + 키가 Node 측에 있는가"를 API 실호출 전에 검증할 수 있어야 디버그가 쉬움. 응답엔 `keyPrefix` 12자만 포함해 키 값 자체는 노출되지 않음.
- **이미지 전달은 base64 dataURL 방식으로 통일**: Vite import된 이미지 URL을 `imageUrlToBase64DataUrl`로 fetch→Blob→FileReader→dataURL 변환 후 `toImageBlock(dataUrl)`이 `{ type: 'image', source: { type: 'base64', media_type, data } }` 구조 생성. URL 방식은 Anthropic 서버가 외부 이미지 URL을 fetch해야 해서 로컬 개발 이미지에는 부적합.
- **`02-ux-flow.md`에 AI 태스크를 별도 섹션으로**: 기존 mermaid flowchart의 AutoTag/Recommend/Analyze 노드에 `T1/T2/T3 · 모델명` 라벨 추가. 데이터 모델 다음, 컴포넌트 리스트 앞에 신규 `## AI 태스크` 섹션 삽입 (태스크 인벤토리 / 시나리오 매핑 / 운영 원칙 / 품질 축 / 참조). 핵심 설계 포인트에도 "AI 태스크는 경계면으로만 노출" 원칙 추가.

## 💬 Claude의 핵심 반응

- **API 키 노출 경고 선행**: 사용자가 채팅에 키를 붙여넣은 직후, `.env.local` 저장보다 먼저 "이 키는 대화 로그에 남았으니 revoke + 새 키 권장" 경고. 작업은 요청대로 진행하되 보안 리스크 명시.
- **"Not Found" 디버그에 대한 두 번의 반복**:
  1. 1차 수정: `server.middlewares.use('/api/anthropic', handler)` prefix 매칭 방식 → exact path(`req.originalUrl` 기반) 매칭으로 변경.
  2. 2차 수정: 그래도 안 되자 원인을 "middleware 미도달"로 판단, `mergeConfig` 패턴으로 등록 방식 교체 + plugin 내 `configureServer`에서 `return () => server.middlewares.use(...)` 반환 함수 패턴 사용 + 플러그인 로드/요청 로깅 추가. 분기 포인트(플러그인 로드 여부 vs 라우팅 가로채기)를 사용자가 터미널 로그로 판별할 수 있게 진단 가이드 제시.
- **브라우저 노출 금지 원칙**: `src/utils/museAi.js`는 오직 `/api/anthropic/*` 로컬 엔드포인트만 fetch. 실제 Anthropic URL이나 키 문자열은 이 파일 어디에도 없음. 컴파일 결과에 키가 포함되지 않도록 import도 안 함.
- **Storybook 재시작 필요성 강조**: `viteFinal` 변경은 HMR 대상이 아니라 프로세스 재시작 필수. 진단 가이드에서 `Ctrl+C`로 완전 종료 후 재실행을 명시.

## 📂 변경된 파일

### 신규 (5)

| 파일 | 요약 |
|------|------|
| `src/data/muse/aiTasks.js` | 3 태스크 정의 + `TAG_VOCABULARY` + `AI_WORKFLOW_DIAGRAM`. 각 태스크는 metadata/input/output/systemPrompt/userMessageTemplate/toolSchema/qualityCriteria/goldenExample/workflow/estCost 포함 |
| `src/stories/muse/AITasks.stories.jsx` | `MUSE/AI Tasks` 하위 5 스토리 (Overview / T1 / T2 / T3 / Workflow) |
| `.storybook/museApiPlugin.js` | Vite plugin. `/api/anthropic/health` + `/api/anthropic/messages` 프록시. loadEnv로 키 로드, tool use 릴레이, 상세 로깅 |
| `src/utils/museAi.js` | 클라이언트 헬퍼: `checkAnthropicHealth`, `callAnthropic`, `extractToolInput`, `extractText`, `toImageBlock`, `imageUrlToBase64DataUrl` |
| `src/stories/muse/AIPlayground.stories.jsx` | `MUSE/AI Playground/Health Check` + `T1 · Auto Tag` 라이브 테스트 스토리 |
| `.env.local` | `ANTHROPIC_API_KEY=…` (gitignore 대상) |
| `.env.example` | 템플릿 (커밋 가능한 placeholder) |

### 수정 (5)

| 파일 | 요약 |
|------|------|
| `.storybook/main.js` | `viteFinal`에서 `mergeConfig(config, { plugins: [museApiPlugin()] })` 패턴 적용 |
| `.storybook/preview.jsx` | storySort에 `AI Tasks`, `AI Playground` 추가 |
| `src/data/muse/index.js` | `TAG_VOCABULARY`, `TASK_*`, `AI_TASKS`, `AI_TASKS_BY_ID`, `AI_WORKFLOW_DIAGRAM` export 추가 |
| `.gitignore` | `.env`, `.env.*` 명시 추가, `!.env.example` 예외 |
| `docs/muse/02-ux-flow.md` | flowchart 노드에 T1/T2/T3 라벨 + 신규 `## AI 태스크` 섹션 + 핵심 설계 포인트에 "경계면으로만 노출" 원칙 추가 |

## 🧩 컴포넌트 작업

코드 컴포넌트 변경 없음. 데이터 레이어 + Storybook 전용 인프라(플러그인/헬퍼/스토리)만 추가.

## ✅ 최종 결과

- 3개 AI 태스크의 시스템 프롬프트·스키마·워크플로우가 `src/data/muse/aiTasks.js`와 `02-ux-flow.md` 양쪽에 반영됨.
- Storybook Vite dev 서버에 `/api/anthropic/health`, `/api/anthropic/messages` 프록시가 얹힘 (키는 Node 측 전용).
- `MUSE/AI Tasks/*` — 프롬프트 검토 5 스토리, `MUSE/AI Playground/*` — 라이브 호출 2 스토리 추가.
- 진행 중 이슈: Health Check가 "Not Found"를 반환 → `mergeConfig` + 반환 함수 패턴 + 로깅으로 재진단 중. 사용자가 터미널 로그(`[museApiPlugin] loaded`, `[museApiPlugin] GET ...`)를 확인해 플러그인 로드 문제인지 라우팅 가로채기 문제인지 판별해야 다음 액션이 갈림.

## 🔁 재현 가이드 (교육생용)

1. **AI 태스크 데이터 먼저 고정**: `src/data/muse/aiTasks.js`에 3 태스크 정의. 각 태스크는 최소 `{ id, name, stage, model, input/output, systemPrompt, userMessageTemplate, toolSchema, qualityCriteria, goldenExample, workflow, estCost }`. 어휘 제한이 있는 태스크(T1)는 `TAG_VOCABULARY` 같은 상수로 중앙화.
2. **데이터를 Storybook 문서 스토리로 노출**: `src/stories/muse/AITasks.stories.jsx`에서 각 태스크의 system prompt / tool schema / golden example을 코드 블록으로 렌더. 교육생/리뷰어가 프롬프트 변경 전후 차이를 눈으로 비교 가능.
3. **브라우저 노출 방지 인프라**:
   - `.env.local`에 키 저장, `VITE_*` 접두어 사용 금지
   - `.gitignore`에 `.env*` 명시 + `!.env.example` 예외
   - Storybook 용 Vite 플러그인(`museApiPlugin.js`)에서 `loadEnv(mode, cwd, '')`로 키 로드
   - `configureServer`에서 `return () => server.middlewares.use(handler)` 반환 함수 패턴
   - `.storybook/main.js`에서 `mergeConfig(config, { plugins: [museApiPlugin()] })` 로 등록
4. **클라이언트 헬퍼는 오직 로컬 프록시만 호출**: `src/utils/museAi.js`에서 `/api/anthropic/*` 경로만 사용. 이 파일에 Anthropic URL·API 키 문자열·SDK import를 넣지 말 것.
5. **Health Check 스토리부터**: 실호출 스토리 만들기 전에 `MUSE/AI Playground/Health Check`로 "플러그인 로드됨 + 키 로드됨"을 먼저 확인. 이게 안 되면 T1/T2/T3 전부 실패함.
6. **T1 Playground 패턴**: 이미지 하나 선택 → `imageUrlToBase64DataUrl` → `toImageBlock` → `callAnthropic({ model, system, tools, tool_choice, messages })` → `extractToolInput(response, toolName)` → UI에 title/tags/컬러 pill + raw JSON 병기. Golden example도 옆에 띄워 사람이 비교.
7. **`02-ux-flow.md` 동기화**: 새 AI 태스크가 등장하면 (A) flowchart 노드에 `T{N} · 모델명` 라벨 (B) `## AI 태스크` 섹션의 인벤토리 표·시나리오 매핑·참조 블록 업데이트.

> 💡 핵심 포인트:
> - **AI 관련 코드는 "데이터 / 인프라 / 경계 / UI" 4층으로 분리**. 데이터(aiTasks.js), 인프라(프록시 플러그인), 경계 헬퍼(museAi.js), UI(Playground 스토리). 한 층만 바꿔도 다른 층이 깨지지 않도록.
> - **API 키는 VITE_ 접두어 절대 금지**. 접두어 붙이는 순간 클라이언트 번들에 하드코딩되어 배포된 JS에서 누구나 읽을 수 있음. 서버(플러그인) 쪽에서만 `loadEnv` / `process.env`로 접근.
> - **Storybook Vite 플러그인 등록은 `mergeConfig`로**: 직접 array mutation은 Storybook 내부의 config merge 경로에서 안전 보장 안 됨. 공식 문서 권장 패턴 사용.
> - **`configureServer`에서 반환 함수 패턴**: `return () => server.middlewares.use(handler)` 는 Vite 내장 middleware 이후에 handler가 등록되게 보장. 즉시 등록(`configureServer` 동기 호출 내부 등록)은 순서가 Vite 내부 정책에 의존.
> - **디버그 로그는 플러그인 로드 시점 + 요청 도달 시점 모두**: 두 지점 로그가 있으면 "플러그인이 실행됐나 vs 요청이 여기까지 오나" 두 질문에 분리 답변 가능.
