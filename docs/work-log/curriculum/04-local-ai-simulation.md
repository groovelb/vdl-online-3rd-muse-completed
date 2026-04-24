# Stage 4. 로컬에서 AI 시뮬레이션하기

> 선행: [Stage 3](./03-data-assembly.md) · 다음: [Stage 5](./05-supabase-integration.md)

---

## ① 이번 Stage에서 만드는 것

**AI 태스크 3종(T1/T2/T3) 정의 + 로컬 백엔드 없이 end-to-end 동작**하는 앱을 완성한다. Supabase 없이도 업로드 → AI 태깅 → 프로젝트 생성 → 토큰 편집 → Export 전 flow가 돌아가는 상태.

30초 요약:
- Anthropic 프록시 middleware로 API 키 보호 (`VITE_` 접두어 금지)
- `aiTasks.js`에 T1/T2/T3 **최종 역할**로 정의 (T1=분류+추출 / T3=text-only 조합)
- T1/T2/T3 Storybook Playground
- Context + useReducer 상태관리 + localStorage persist
- ArchivePage 업로드 → T1 실연결 (**처음부터 concurrency 3 + 재시도 정책**)
- React Router 5 경로 + `*Route.jsx` 컨테이너 분리
- Wizard T2/T3 실연결
- hex swatch 필터 (T1 dominantColors 기반)
- ZIP 범용 JSON Export

> 이 Stage의 핵심 메시지: **"실 백엔드 전에 로컬에서 AI 플로우를 완결한다."** Supabase는 Stage 5에서 붙이지만, 앱으로서의 완성은 여기까지.

---

## ② 프리뷰 — 이번에 만질 것

### 신규 파일 — AI 관련
| 파일 | 역할 |
|---|---|
| `.storybook/museApiPlugin.js` | Vite 플러그인 — Anthropic 프록시 middleware |
| `src/utils/museAi.js` | AI 호출 래퍼 (프록시 경유) |
| `src/utils/museAiTasks.js` | T1/T2/T3 실행 헬퍼 + 재시도 + 이미지 리사이즈 |
| `src/data/muse/aiTasks.js` | 3 태스크 정의 (프롬프트 + tool schema + 골든 예시) |
| `.env.local` | `ANTHROPIC_API_KEY=sk-ant-...` (VITE_ 접두어 **없음**) |

### 신규 파일 — 상태·라우팅
| 파일 | 역할 |
|---|---|
| `src/store/museStore.jsx` | Context + useReducer + 슬라이스 훅 4개 |
| `src/pages/ArchiveRoute.jsx` | 스토어 주입 컨테이너 |
| `src/pages/ProjectListRoute.jsx` | 동 |
| `src/pages/ProjectDetailRoute.jsx` | 동 |
| `src/pages/ProjectCreateRoute.jsx` | 동 + Wizard 래핑 |
| `src/pages/SettingsRoute.jsx` | 동 |
| `src/utils/museExport.js` | 범용 JSON + ZIP 번들 생성 |

### Storybook
| 파일 | 역할 |
|---|---|
| `src/stories/muse/AITasks.stories.jsx` | 3 태스크 정의·tool schema 문서화 |
| `src/stories/muse/AIPlayground.stories.jsx` | T1/T2/T3 실 호출 Playground |

### 수정 파일
| 파일 | 변경 |
|---|---|
| `src/App.jsx` | React Router + MuseStoreProvider 래핑 |
| `src/components/templates/ArchivePage.jsx` | `useStoreMode` prop (fixtures ↔ store 이중 모드) + hex swatch 필터 |
| `src/components/templates/ProjectCreateWizard.jsx` | `recommendedLoader`, `analyze` prop으로 T2/T3 주입 |
| `src/components/overlay-feedback/ThemeExportDialog.jsx` | JSON / ZIP 포맷 선택 + Export 실행 |
| `vite.config.js` | 프록시 플러그인 등록 |

---

## ③ 설계 기준 (Spec)

### API 키 보안 (절대 규칙)
- `ANTHROPIC_API_KEY`는 **`VITE_` 접두어 금지**
- 이유: `VITE_` 접두어는 클라이언트 번들에 **공개**됨. API 키 유출.
- 방법: Vite의 loadEnv를 **Node 측 플러그인에서만** 사용, 프록시 middleware가 서버측에서 키 주입

### Vite 프록시 플러그인 패턴
```js
// .storybook/museApiPlugin.js  (Storybook)
// 또는 vite.config.js (Dev/Prod)
import { loadEnv, mergeConfig } from 'vite';

export function museApiPlugin() {
  return {
    name: 'muse-api-proxy',
    config(config, { mode }) {
      const env = loadEnv(mode, process.cwd(), '');
      return mergeConfig(config, {
        server: {
          proxy: {
            '/api/muse': {
              target: 'https://api.anthropic.com',
              changeOrigin: true,
              rewrite: (p) => p.replace(/^\/api\/muse/, ''),
              configure: (proxy) => {
                proxy.on('proxyReq', (proxyReq) => {
                  proxyReq.setHeader('x-api-key', env.ANTHROPIC_API_KEY);
                  proxyReq.setHeader('anthropic-version', '2023-06-01');
                });
              },
            },
          },
        },
      });
    },
  };
}
```
**주의**: `mergeConfig` + `return config` 반드시 — 안 그러면 플러그인 로드 실패.

### AI 태스크 단일 진실 원천
모든 AI 호출은 `src/data/muse/aiTasks.js`를 참조한다. 프롬프트·tool schema·골든 예시를 **인라인으로 흩뿌리지 않는다**.

### T1/T2/T3 역할 (최종)
| 태스크 | 입력 | 출력 | 역할 |
|---|---|---|---|
| **T1** | 이미지 1장 (512px) | `{ tags 중첩, dominantColors, title, extracted }` | **분류 + 추출** (per-image 관찰값) |
| **T2** | `{ intent, type, references 요약 }` | `{ recommendedIds[], reasons[] }` | 추천 |
| **T3** | `{ intent, type, references[].extracted 모음 }` | `{ color, typography, layout, gradient 토큰, visualDirection }` | **의도 기반 조합 (text-only)** |

**핵심 규칙**:
- T1이 이미 per-image 값을 관찰·추출했으므로, **T3는 이미지를 다시 보지 않는다** (text-only compose)
- T3는 `references[].extracted` 풀에서 조합 — 비용 2.5배 절감
- 모델: 전부 **Haiku 통일** (tool schema 확장 실측 OK 확인 후)

### Tool use 강제
```js
// T1, T2: 단일 tool 강제
{ tool_choice: { type: 'tool', name: 'submit_t1' } }

// T3: any + 2 tool (partial 결과 허용)
{ tool_choice: { type: 'any' } }  // + tools: [submit_tokens, submit_visual_direction]
```

### T1 tool schema는 `tag/index.js`에서 enum 주입
```js
import { getLayerEnum } from '../data/muse/tag/index.js';

const t1Schema = {
  type: 'object',
  properties: {
    tags: {
      type: 'object',
      properties: {
        color: { type: 'array', items: { type: 'string', enum: getLayerEnum('color') } },
        typography: { type: 'array', items: { type: 'string', enum: getLayerEnum('typography') } },
        layout: { type: 'array', items: { type: 'string', enum: getLayerEnum('layout') } },
        gradient: { type: 'array', items: { type: 'string', enum: getLayerEnum('gradient') } },
        visualDirection: {
          type: 'object',
          properties: {
            genre: { type: 'array', items: { type: 'string', enum: getLayerEnum('visualDirection', 'genre') } },
            style: { type: 'array', items: { type: 'string', enum: getLayerEnum('visualDirection', 'style') } },
            subject: { type: 'array', items: { type: 'string', enum: getLayerEnum('visualDirection', 'subject') } },
          },
        },
      },
    },
    dominantColors: { type: 'array', items: { type: 'string' }, description: 'hex 5개' },
    title: { type: 'string' },
    extracted: {
      type: 'object',
      properties: {
        palette: { type: 'array', items: { /* ... */ } },
        typography: { type: 'array', items: { /* ... */ } },
        layout: { type: 'array', items: { /* ... */ } },
        gradient: { type: 'array', items: { /* ... */ } },
      },
    },
  },
  required: ['tags', 'dominantColors'],
};
```

### 상태관리 원칙
- **Context + useReducer** — Zustand 등 신 의존성 배제 (Stage 5 Supabase 전환 용이)
- **슬라이스 훅 분리** (`useReferencesSlice`, `useProjectsSlice`, `useAnalysisSlice`, `useSettingsSlice`) — re-render 최소화
- **STORAGE_KEY 버전**: `muse_store_v4` (Stage 5에서 v5로 bump)
- **seed 분기**: `'empty'` (기본, Dev/Prod), `'fixtures'` (Storybook만)

### 업로드 → T1 Flow
```
1. 파일 선택
2. 즉시 Reference row 생성 (_pending: true, 썸네일만)
3. Dispatch → ArchivePage에 회색 카드 노출 (2초 이내)
4. background: T1 호출 (concurrency 3, exponential backoff 재시도 3회)
5. 성공 → Reference patch (tags, dominantColors, extracted 채움)
6. 실패 → _tagError 플래그 + 🔄 수동 재시도 버튼
```
**절대 금지**: T1 실패 시 Reference 자동 삭제. 사용자 선택권 유지.

### concurrency + 재시도 정책
```js
// runWithConcurrency(tasks, 3) — 동시 3개
// addReference 업로드: 500ms 재시도 1회
// T1 호출: exponential backoff 500ms → 1500ms, 최대 3회
// 에러 분류:
//   - 429 rate limit / 5xx / network → retry
//   - 4xx (429 제외) → 포기
```
**원칙**: concurrency 제한과 재시도는 별개 장치. Promise.all() **금지**.

### 라우팅 원칙
- **stateless 템플릿** (`components/templates/*.jsx`) — Storybook에서 props만으로 렌더
- **컨테이너 `*Route.jsx`** (`pages/*Route.jsx`) — store 주입, 템플릿에 props 전달
- 5 경로: `/archive`, `/projects`, `/projects/new`, `/projects/:id`, `/settings`

### Export JSON 범용성
- **MUI 식별자 제거** — `color.tokens[{name, hex, description, sourceReferenceIds}]` 같은 framework-neutral 구조
- ZIP 번들 = README.md + muse.json + visualDirection.md + `references/ref-*.jpg`
- 수령자는 React/Vue/Figma 어느 쪽이든 사용 가능

### hex swatch 필터 (ArchivePage)
- T1이 채운 `dominantColors`를 빈도 집계 → 상위 40개 26px swatch
- 클릭 = HSL 유사도(hue≤30°, sat≤0.35, light≤0.28) 기반 OR 필터
- neutral(저채도)는 다른 neutral만 매칭

---

## ④ 실습 순서

### Step 1. Anthropic API 키 + 프록시 플러그인

1. `.env.local`에 추가 (gitignore 확인):
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```
   **`VITE_` 접두어 붙이지 말 것.**

2. `.storybook/museApiPlugin.js` 작성 (§③ 참조). Storybook용.

3. `vite.config.js`에도 동일 패턴으로 프록시 등록 (Dev 서버용).

4. 브라우저 DevTools Network 탭에서 API 호출 시 **`x-api-key` 헤더가 보이지 않아야** 정상 (서버측 주입).

### Step 2. `aiTasks.js` — T1/T2/T3 정의

`src/data/muse/aiTasks.js`:

```js
import { getLayerEnum, renderVocabularyPrompt } from './tag/index.js';

export const AI_TASKS = {
  T1: {
    id: 'T1',
    name: '자동 태깅 + 추출',
    stage: 'upload',
    model: 'claude-haiku-4-5-20251001',
    input: { kind: 'image', maxSize: 512 },
    output: { shape: 'tags + dominantColors + extracted' },
    systemPrompt: `너는 디자인 레퍼런스 이미지 분석가다. 주어진 이미지 1장을 보고:
1) 레이어별 태그를 enum에서만 선택 (없으면 빈 배열)
2) 지배 색상 hex 5개 추출
3) 타이틀 한 줄 요약
4) 색/타이포/레이아웃/그라디언트 per-image 관찰값 추출 (extracted 필드)

어휘:
${renderVocabularyPrompt('color')}
...`,
    toolSchema: { /* §③ 의 t1Schema */ },
    qualityCriteria: [
      '태그는 enum 밖 값 0건',
      'dominantColors 배경색 제외, 주요 피사체색 우선',
      'extracted.palette는 이미지 실제 색과 일치',
    ],
    goldenExample: { /* 실제 이미지 1장 + 기대 출력 */ },
    estCost: { input_tokens: 800, output_tokens: 400 },
  },
  T2: { /* 추천 */ },
  T3: {
    id: 'T3',
    name: '토큰 합성 (text-only)',
    stage: 'project',
    model: 'claude-haiku-4-5-20251001',
    input: {
      kind: 'text-only',
      shape: '{ intent, type, references: [{ id, extracted, tags }] }',
    },
    output: { shape: '{ color[], typography[], layout[], gradient[], visualDirection }' },
    systemPrompt: `너는 디자인 토큰 합성가. 여러 레퍼런스의 관찰값을 받아, 프로젝트 의도(intent)에 맞게 조합한다.
- 이미지를 직접 보지 않는다 (이미 관찰자가 추출해준 값 사용)
- role / emphasis 를 의도 기반으로 부여
- visualDirection은 Markdown 문장 + 카테고리 태그`,
    toolSchema: { /* 2 tool: submit_tokens + submit_visual_direction */ },
    // ...
  },
};
```

### Step 3. `museAi.js` — 기본 호출 래퍼

`src/utils/museAi.js`:
```js
export async function callClaude({ model, system, messages, tools, tool_choice }) {
  const res = await fetch('/api/muse/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model, max_tokens: 4096, system, messages, tools, tool_choice }),
  });
  if (!res.ok) {
    const err = new Error(`Claude API ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}
```

### Step 4. Storybook AITasks/AIPlayground

`AITasks.stories.jsx`: 3 태스크의 프롬프트·tool schema·골든 예시 문서화 뷰.

`AIPlayground.stories.jsx`: 실제 호출 버튼 3개:
- [T1 실행] — 이미지 업로드 → 태그·추출 결과
- [T2 실행] — intent + type 입력 → 추천 ID
- [T3 실행] — 선택한 references의 extracted → 토큰 + VD

**포인트**: 이 Playground에서 **전체 flow가 먼저 동작**해야 한다. 이후 Step 7-9에서 실제 페이지에 연결.

### Step 5. 상태관리 — museStore

`src/store/museStore.jsx`:
```jsx
import { createContext, useContext, useEffect, useReducer } from 'react';
import * as fixtures from '../data/muse/index.js';

const STORAGE_KEY = 'muse_store_v4';

const initialEmpty = { references: [], projects: [], analysisResults: [], userSettings: fixtures.defaultUserSettings };
const initialFixtures = {
  references: fixtures.references,
  projects: fixtures.projects,
  analysisResults: fixtures.analysisResults,
  userSettings: fixtures.defaultUserSettings,
};

function reducer(state, action) {
  switch (action.type) {
    case 'HYDRATE': return action.payload;
    case 'ADD_REFERENCE_PENDING': return { ...state, references: [action.payload, ...state.references] };
    case 'PATCH_REFERENCE': return {
      ...state,
      references: state.references.map(r => r.id === action.payload.id ? { ...r, ...action.payload.patch } : r),
    };
    case 'REMOVE_REFERENCE': return { ...state, references: state.references.filter(r => r.id !== action.payload) };
    // projects, analysis, settings ...
    default: return state;
  }
}

export const MuseStoreContext = createContext(null);

export function MuseStoreProvider({ children, seed = 'empty' }) {
  const initial = seed === 'fixtures' ? initialFixtures : initialEmpty;
  const [state, dispatch] = useReducer(reducer, initial);

  // localStorage hydrate (seed='empty'만)
  useEffect(() => {
    if (seed !== 'empty') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: 'HYDRATE', payload: JSON.parse(raw) });
    } catch {}
  }, [seed]);

  // localStorage persist
  useEffect(() => {
    if (seed !== 'empty') return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [seed, state]);

  return <MuseStoreContext.Provider value={{ state, dispatch }}>{children}</MuseStoreContext.Provider>;
}

// 슬라이스 훅
export function useReferencesSlice() {
  const { state, dispatch } = useContext(MuseStoreContext);
  const addReference = useCallback(async (ref) => {
    dispatch({ type: 'ADD_REFERENCE_PENDING', payload: { ...ref, _pending: true } });
    // Stage 5에서 Supabase insert 추가, 현재는 localStorage만
  }, [dispatch]);
  const patchReference = useCallback((id, patch) => {
    dispatch({ type: 'PATCH_REFERENCE', payload: { id, patch } });
  }, [dispatch]);
  const removeReference = useCallback((id) => {
    dispatch({ type: 'REMOVE_REFERENCE', payload: id });
  }, [dispatch]);
  return { references: state.references, addReference, patchReference, removeReference };
}

// useProjectsSlice, useAnalysisSlice, useSettingsSlice 유사 패턴
```

**규칙**: 슬라이스 훅의 **공개 시그니처**(반환 객체)는 Stage 5에서 Supabase로 교체할 때도 **동일하게 유지**. 내부 구현만 바뀜.

### Step 6. `museAiTasks.js` — 재시도 + concurrency + 리사이즈

`src/utils/museAiTasks.js`:
```js
import { callClaude } from './museAi.js';
import { AI_TASKS } from '../data/muse/aiTasks.js';

async function resizeImageToBase64(file, maxSize = 512) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(maxSize / bitmap.width, maxSize / bitmap.height, 1);
  const w = bitmap.width * scale, h = bitmap.height * scale;
  const canvas = new OffscreenCanvas(w, h);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, w, h);
  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.85 });
  const buf = await blob.arrayBuffer();
  const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
  return { base64: b64, mediaType: 'image/jpeg' };
}

function isRetryable(err) {
  if (err.status === 429) return true;
  if (err.status >= 500 && err.status < 600) return true;
  if (!err.status) return true;  // network
  return false;
}

async function withRetry(fn, { maxAttempts = 3, baseDelay = 500 } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try { return await fn(); }
    catch (err) {
      lastErr = err;
      if (!isRetryable(err) || attempt === maxAttempts) throw err;
      const delay = baseDelay * Math.pow(3, attempt - 1); // 500 → 1500 → 4500
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

export async function runWithConcurrency(tasks, limit = 3) {
  const results = new Array(tasks.length);
  const queue = tasks.map((t, i) => ({ t, i }));
  const workers = Array.from({ length: Math.min(limit, tasks.length) }, async () => {
    while (queue.length) {
      const { t, i } = queue.shift();
      try { results[i] = { ok: true, value: await t() }; }
      catch (err) { results[i] = { ok: false, error: err }; }
    }
  });
  await Promise.all(workers);
  return results;
}

export async function runT1(file) {
  const { base64, mediaType } = await resizeImageToBase64(file);
  return withRetry(async () => {
    const res = await callClaude({
      model: AI_TASKS.T1.model,
      system: AI_TASKS.T1.systemPrompt,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
          { type: 'text', text: 'Analyze this image.' },
        ],
      }],
      tools: [AI_TASKS.T1.toolSchema],
      tool_choice: { type: 'tool', name: 'submit_t1' },
    });
    const toolUse = res.content.find(c => c.type === 'tool_use');
    if (!toolUse) throw new Error('no tool_use in T1');
    return toolUse.input;
  });
}

export async function runT2({ intent, type, referencesSummary }) { /* 유사 */ }
export async function runT3({ intent, type, references }) { /* text-only, 2-tool */ }
```

### Step 7. ArchivePage 업로드 → T1 실연결

`src/pages/ArchiveRoute.jsx`:
```jsx
import { ArchivePage } from '../components/templates/ArchivePage.jsx';
import { useReferencesSlice } from '../store/museStore.jsx';
import { runT1, runWithConcurrency } from '../utils/museAiTasks.js';

export function ArchiveRoute() {
  const { references, addReference, patchReference, removeReference } = useReferencesSlice();

  const handleUpload = async (files) => {
    // 1) 즉시 pending row 생성
    const pending = files.map(file => ({
      id: crypto.randomUUID(),
      title: file.name,
      thumbnailUrl: URL.createObjectURL(file),
      file,
      _pending: true,
    }));
    pending.forEach(p => addReference(p));

    // 2) T1 concurrency 3
    const tasks = pending.map(p => async () => {
      try {
        const t1 = await runT1(p.file);
        patchReference(p.id, { ...t1, _pending: false });
      } catch (err) {
        patchReference(p.id, { _pending: false, _tagError: err.message });
      }
    });
    await runWithConcurrency(tasks, 3);
  };

  const handleRetryT1 = async (id) => {
    const ref = references.find(r => r.id === id);
    if (!ref) return;
    patchReference(id, { _pending: true, _tagError: null });
    try {
      const t1 = await runT1(ref.file);
      patchReference(id, { ...t1, _pending: false });
    } catch (err) {
      patchReference(id, { _pending: false, _tagError: err.message });
    }
  };

  return (
    <ArchivePage
      references={references}
      onUpload={handleUpload}
      onRetryT1={handleRetryT1}
      onRemove={removeReference}
      useStoreMode
    />
  );
}
```

`ArchivePage`에 `useStoreMode` prop 추가해 Storybook(fixtures) ↔ Route(store) 이중 모드.

### Step 8. hex swatch 필터 (ArchivePage)

ArchivePage 내부:
```jsx
import { hslDistance } from '../../utils/colorSimilarity.js';

// 1) dominantColors 빈도 집계
const colorFrequency = useMemo(() => {
  const map = new Map();
  references.forEach(r => (r.dominantColors || []).forEach(hex => {
    map.set(hex, (map.get(hex) || 0) + 1);
  }));
  return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 40);
}, [references]);

// 2) 선택된 swatch가 있으면 HSL 유사도로 필터
const filtered = references.filter(r => {
  if (selectedColors.length === 0) return true;
  return r.dominantColors?.some(rc => selectedColors.some(sc => hslDistance(rc, sc) < THRESHOLD));
});
```

`src/utils/colorSimilarity.js`:
```js
export function hexToHsl(hex) { /* ... */ }
export function hslDistance(hex1, hex2) {
  const a = hexToHsl(hex1), b = hexToHsl(hex2);
  const isNeutralA = a.s < 0.15, isNeutralB = b.s < 0.15;
  if (isNeutralA !== isNeutralB) return Infinity;
  if (isNeutralA && isNeutralB) return Math.abs(a.l - b.l);
  const hueDiff = Math.min(Math.abs(a.h - b.h), 360 - Math.abs(a.h - b.h));
  return hueDiff / 30 + Math.abs(a.s - b.s) / 0.35 + Math.abs(a.l - b.l) / 0.28;
}
// 3 분모는 각 임계값. 합이 1 미만이면 유사로 판정.
```

### Step 9. React Router — App.jsx

```jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MuseStoreProvider } from './store/museStore.jsx';
import { ArchiveRoute, ProjectListRoute, ProjectCreateRoute, ProjectDetailRoute, SettingsRoute } from './pages/...';
import { MuseNav } from './pages/MuseNav.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <><MuseNav /><Outlet /></>,
    children: [
      { index: true, element: <Navigate to="/archive" replace /> },
      { path: 'archive', element: <ArchiveRoute /> },
      { path: 'projects', element: <ProjectListRoute /> },
      { path: 'projects/new', element: <ProjectCreateRoute /> },
      { path: 'projects/:id', element: <ProjectDetailRoute /> },
      { path: 'settings', element: <SettingsRoute /> },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <MuseStoreProvider seed="empty">
        <RouterProvider router={router} />
      </MuseStoreProvider>
    </ThemeProvider>
  );
}
```

### Step 10. ProjectCreateRoute + Wizard T2/T3 연결

```jsx
export function ProjectCreateRoute() {
  const { references } = useReferencesSlice();
  const { addProject } = useProjectsSlice();
  const { addAnalysisResult } = useAnalysisSlice();
  const navigate = useNavigate();

  const recommendedLoader = async (intent, type) => {
    const summary = references.map(r => ({ id: r.id, tags: r.tags, title: r.title }));
    return await runT2({ intent, type, referencesSummary: summary });
  };

  const analyze = async (referenceIds) => {
    const selected = references.filter(r => referenceIds.includes(r.id));
    const t3 = await runT3({
      intent, type,
      references: selected.map(r => ({ id: r.id, extracted: r.extracted, tags: r.tags })),
    });
    return t3;
  };

  const handleComplete = async (projectData) => {
    const project = await addProject(projectData);
    await addAnalysisResult({ projectId: project.id, layers: projectData.analysis });
    navigate(`/projects/${project.id}`);
  };

  return (
    <ProjectCreateWizard
      initialReferences={references}
      recommendedLoader={recommendedLoader}
      analyze={analyze}
      onComplete={handleComplete}
    />
  );
}
```

### Step 11. ThemeExportDialog — ZIP 범용 JSON

`src/utils/museExport.js`:
```js
import JSZip from 'jszip';

export function buildUniversalJson({ project, analysis, references }) {
  return {
    meta: {
      projectId: project.id,
      name: project.name,
      createdAt: new Date().toISOString(),
      model: 'claude-haiku-4-5-20251001',
    },
    color: { tokens: analysis.layers.color.map(t => ({
      name: t.name, hex: t.hex, description: t.label, sourceReferenceIds: t.sourceRefs || [],
    })) },
    typography: { tokens: analysis.layers.typography },
    layout: { tokens: analysis.layers.layout },
    gradient: { tokens: analysis.layers.gradient },
    visualDirection: analysis.layers.visualDirection,
    references: references.map(r => ({ id: r.id, filename: `references/${r.id}.jpg` })),
  };
}

export async function buildZipBundle({ project, analysis, references }) {
  const zip = new JSZip();
  const json = buildUniversalJson({ project, analysis, references });

  zip.file('muse.json', JSON.stringify(json, null, 2));
  zip.file('visualDirection.md', analysis.layers.visualDirection.markdown);
  zip.file('README.md', buildReadme(project));

  const refsFolder = zip.folder('references');
  for (const r of references) {
    const blob = await fetch(r.thumbnailUrl).then(res => res.blob());
    refsFolder.file(`${r.id}.jpg`, blob);
  }

  return zip.generateAsync({ type: 'blob' });
}

function buildReadme(project) {
  return `# ${project.name} — MUSE Export

이 번들은 MUSE에서 Export된 디자인 토큰 세트입니다.

## 파일 구조
- muse.json — 범용 토큰 JSON (프레임워크 비종속)
- visualDirection.md — 비주얼 디렉션 문서
- references/ — 사용된 레퍼런스 이미지

## 사용법
muse.json의 color.tokens / typography.tokens 등을 소비하여
React / Vue / Figma 어느 환경에서도 사용할 수 있습니다.
`;
}
```

`ThemeExportDialog`에서 JSON 또는 ZIP 선택 → download 트리거.

**규칙**: JSON에 **MUI 식별자 절대 포함 금지** (`muiComponent`, `variant` 등). hex + CSS value만.

### Step 12. ArchivePage에 🔄 수동 재시도 버튼

T1 실패 카드에 표시:
```jsx
{ref._tagError && (
  <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
    <Tooltip title={ref._tagError}>
      <IconButton size="small" onClick={() => onRetryT1(ref.id)}>🔄</IconButton>
    </Tooltip>
    <IconButton size="small" onClick={() => onRemove(ref.id)}>✕</IconButton>
  </Box>
)}
```

**원칙**: **자동 삭제 금지**. 사용자 선택권 보장 (재시도 / 삭제).

---

## ⑤ 체크리스트

### AI 통합
- [ ] `ANTHROPIC_API_KEY`가 `VITE_` 접두어 없음
- [ ] Vite 프록시 플러그인 (`mergeConfig` 패턴)
- [ ] DevTools Network에 API 키 헤더 노출 안 됨
- [ ] `aiTasks.js` 단일 진실 원천 (T1/T2/T3)
- [ ] T1 tool schema가 `getLayerEnum()`으로 enum 주입
- [ ] T3 = **text-only** (이미지 재분석 없음)
- [ ] 모든 태스크 Haiku 모델
- [ ] AIPlayground에서 T1/T2/T3 end-to-end 동작

### 상태·라우팅
- [ ] Context + useReducer + 4 슬라이스 훅
- [ ] STORAGE_KEY v4 (Stage 5에서 v5로 bump 예정)
- [ ] seed 기본값 `'empty'`, Storybook만 `'fixtures'`
- [ ] 5 라우트 동작
- [ ] stateless 템플릿 + `*Route.jsx` 컨테이너 분리

### 업로드 flow
- [ ] 업로드 즉시 pending 썸네일 노출 (< 2초)
- [ ] T1 concurrency 3 (Promise.all 0건)
- [ ] T1 재시도 exponential backoff (500→1500→4500)
- [ ] 429/5xx/network만 재시도, 4xx 포기
- [ ] T1 실패 시 🔄 수동 재시도 버튼 (자동 삭제 0건)

### Wizard
- [ ] ProjectCreateWizard에 T2/T3 콜백 주입
- [ ] Step 2 진입 시 T2 자동 호출
- [ ] Step 3 분석 시 T3 실행 → 토큰 + visualDirection
- [ ] 완료 후 `/projects/:id` 이동

### ArchivePage 필터
- [ ] hex swatch 26px, 빈도 상위 40개
- [ ] HSL 유사도 (hue≤30°, sat≤0.35, light≤0.28)
- [ ] neutral 저채도 예외
- [ ] 태그 AND + swatch OR + 두 필터간 AND

### Export
- [ ] 범용 JSON (MUI 식별자 0건)
- [ ] ZIP 번들 = README + muse.json + VD.md + references/
- [ ] Dev 서버에서 실제 download 동작

---

## ⑥ 원본 로그 레퍼런스

이 Stage의 출처:
- **011** (프록시 + T1 Playground) → Step 1-4
- **014** (T2/T3 Playground) → Step 4
- **015** (상태관리 + ArchivePage 연결) → Step 5, 7
- **016** (라우팅 + Wizard 실연결 + ZIP 범용 JSON) → Step 9-11
- **017 일부** (seed 분기) → Step 5
- **021 일부** (hex swatch 필터) → **Step 8로 당김**
- **023 일부** (T1 extraction + T3 text-only + Haiku 통일) → **Step 2, 6에 처음부터 반영**
- **024 일부** (concurrency 3 + 재시도 + 🔄) → **Step 6, 7, 12로 당김**

### 실제 진행 이력 부록

> 원본 프로젝트의 AI 파트는 **가장 크게 재설계된 영역**이다:
>
> - **Phase 011**: T1만 먼저 연결. 프롬프트·tool schema는 인라인.
> - **Phase 013**: 태그 구조 재설계로 T1 tool schema 전면 개편 (enum 강제).
> - **Phase 014**: T2/T3 추가. T3는 **이미지 포함 2-tool** 이었다.
> - **Phase 020**: T3 이미지를 1024→512px로 축소 (17% 절감). 아직 이미지 포함 상태.
> - **Phase 023**: **T1에 extraction 역할 추가, T3를 text-only로 전환**. Haiku로 통일. 비용 2.5배 절감. 이 시점에서 기존 Reference 데이터를 truncate.
>
> Stage 4 업로드 flow 안정화도 별도 이슈였다:
> - **Phase 015**: 초기 구현 시 Promise.all() 사용. 20건 동시 업로드 시 간헐 누락.
> - **Phase 024**: rate limit + race 버그 재현. `runWithConcurrency(3)` + `withRetry(3회)` + 수동 재시도 🔄 도입.
>
> **교훈**:
> - AI 태스크 역할은 **초기 설계가 중요**. "T1은 뭘 하고 T3는 뭘 하는가" 가 처음부터 명확해야 재설계 비용을 안 치른다.
> - **이미지 API 호출은 항상 리사이즈 + concurrency 제한 + 재시도를 기본기**로. Promise.all 금지는 조기에 인지해야 한다.
>
> 교육용으로는 이 재설계·안정화 이력을 **처음부터 최종 형태**(T1=분류+추출, T3=text-only, concurrency 3 + 재시도)로 구성했다. 학습자는 "T3가 원래는 이미지를 봤다" 는 사실을 몰라도 된다.

---

**다음 Stage**: [Stage 5. Supabase 연동하기](./05-supabase-integration.md)
