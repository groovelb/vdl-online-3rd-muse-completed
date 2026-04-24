# Stage 3. 더미 데이터로 조립하기

> 선행: [Stage 2](./02-ux-flow-and-components.md) · 다음: [Stage 4](./04-local-ai-simulation.md)

---

## ① 이번 Stage에서 만드는 것

**데이터 모델을 확정**하고, **실 이미지 27건 + 프로젝트 4건**을 연결한다. Stage 2에서 스토리에 인라인으로 흩어져 있던 mock 데이터를 **한 폴더로 중앙화**한다.

30초 요약:
- `src/data/muse/` 폴더 + `schemas.js` (단일 진실 원천) 신설
- **최종 태그 스키마**(중첩 + enum)로 처음부터 시작
- `Reference.extracted` 필드까지 미리 선언 (Stage 4에서 T1이 채울 자리)
- 실 이미지 28→27장 Vite 정적 import
- Storybook 카탈로그 4종 + seed 분기(empty/fixtures)

> 이 Stage의 핵심 메시지: **"데이터 스키마는 처음에 확정한다. 돌이킬 수 없다."** 원본 프로젝트에서는 태그가 `flat → 중첩`으로 한 번 갈아엎어졌다. 교육용으로는 그 시행착오를 숨기고 **최종 형태**로 시작한다.

---

## ② 프리뷰 — 이번에 만질 것

### 신규 파일 (`src/data/muse/`)
| 파일 | 역할 |
|---|---|
| `schemas.js` | JSDoc typedef로 전체 데이터 모델 정의 (**단일 진실 원천**) |
| `references.js` | 실 이미지 27건 데이터 + Vite 정적 import |
| `projects.js` | 프로젝트 4건 (referenceIds 기반 파생) |
| `analysisResults.js` | AI 분석 결과 4건 (결정적 생성) |
| `userSettings.js` | 사용자 설정 기본값 |
| `tag/index.js` | 프리셋 어휘 소비 단일 창구 |
| `index.js` | barrel export |
| `README.md` | 데이터 폴더 사용 규칙 |

### 자산
| 위치 | 내용 |
|---|---|
| `src/assets/muse-references/` | 이미지 27장 (.jpg/.jpeg 혼재) |

### Storybook 카탈로그 (4종)
| 스토리 | 내용 |
|---|---|
| `References.stories.jsx` | Reference 스키마 + 27건 리스트 |
| `Projects.stories.jsx` | Project 스키마 + 4건 리스트 |
| `AnalysisResults.stories.jsx` | AnalysisResult 스키마 + 레이어별 뷰 |
| `UserSettings.stories.jsx` | UserSettings 스키마 + 기본값 |

### Storybook preview 설정
| 위치 | 변경 |
|---|---|
| `.storybook/preview.jsx` | Decorator로 `MuseStoreProvider seed="fixtures"` 주입 (Stage 4에서 store 완성 후 연결) |

---

## ③ 설계 기준 (Spec)

### 단일 진실 원천
- **`src/data/muse/schemas.js`가 전부**. 기획 문서(`02-ux-flow.md`)는 이 파일을 참조만.
- 이후 Stage의 AI tool schema, Supabase DB 스키마, Export JSON 전부 이 파일을 기반.

### Reference.tags는 처음부터 중첩 + enum
```typescript
tags: {
  color: string[0..3],            // enum: 'Muted' | 'Deep' | 'Bright' | 'Pastel' | 'Neutral' | ...
  typography: string[0..3],       // enum: 'SansSerif' | 'Serif' | 'Mono' | 'Display' | ...
  layout: string[0..3],           // enum: 'Grid12' | 'Grid6' | 'Asymmetric' | 'Centered' | ...
  gradient: string[0..2],         // enum: 'Sunset' | 'Night' | 'Ocean' | 'None' | ...
  visualDirection: {
    genre: string[0..2],          // enum: 'Editorial' | 'Lifestyle' | 'Commercial' | ...
    style: string[0..2],          // enum: 'Minimal' | 'Ornate' | 'Bold' | 'Soft' | ...
    subject: string[0..2],        // enum: 'Nature' | 'Urban' | 'Human' | 'Product' | ...
  }
}
```

**중요**: flat `string[]` 형태는 금지. 왜냐하면 Stage 4에서 T1 tool schema가 **레이어별 enum 강제**를 해야 AI가 어휘 밖 태그를 생성하지 않기 때문.

### Reference.extracted (T1이 Stage 4에서 채울 자리)
```typescript
extracted: {
  palette: [{ name, hex, label, group }],
  typography: [{ name, fontFamily, fontSize, fontWeight, lineHeight }],
  layout: [{ name, columns, gap }],
  gradient: [{ name, angle, colors[] }],
}
```
Stage 3에서는 **fixture에 결정적 mock 값**으로 채운다. 이후 Stage 4에서 실제 T1이 같은 스키마로 채운다.

### 프리셋 어휘는 `tag/index.js` 단일 창구
```js
// src/data/muse/tag/index.js
export const TAG_PRESETS = {
  color: [
    { key: 'Muted', description: '...' },
    { key: 'Deep', description: '...' },
    // ...
  ],
  typography: [...],
  layout: [...],
  gradient: [...],
  visualDirection: {
    genre: [...], style: [...], subject: [...],
  },
};

export const getLayerEnum = (layer) => TAG_PRESETS[layer].map(t => t.key);
export const getLayerTags = (layer) => TAG_PRESETS[layer];
export const renderVocabularyPrompt = (layer) => /* AI 프롬프트용 문자열 */;
```

Stage 4에서 T1 tool schema가 이 헬퍼를 사용해 enum을 주입한다.

### 이미지 연결 방식: Vite 정적 import만
```js
import ref001 from '../../assets/muse-references/ref-001.jpg';
import ref002 from '../../assets/muse-references/ref-002.jpeg';
// ... 27개
```
- URL 문자열 / 동적 import / public 폴더 **모두 금지**
- 이유: 빌드 시 누락된 이미지는 즉시 에러. 런타임 추적 비용 0.

### 결정적 생성 패턴
더미 데이터 생성 시 랜덤 대신 `i * prime % range` 패턴:
```js
const pickFromArray = (arr, seed) => arr[seed % arr.length];
const generateTags = (i, layer) => {
  const enum_ = getLayerEnum(layer);
  return [pickFromArray(enum_, i * 7), pickFromArray(enum_, i * 13)];
};
```
**이유**: Storybook 재방문 시 동일 데이터. 스토리 스크린샷 diff 안정.

### Project 썸네일은 Reference에서 파생
```js
const projects = [
  { id: 'p1', name: '브랜드 리뉴얼', referenceIds: ['r1','r5','r9'], ... },
  // ...
].map(p => ({
  ...p,
  thumbnailUrl: references.find(r => r.id === p.referenceIds[0])?.thumbnailUrl,
}));
```
**이유**: Reference 이미지 교체 시 Project 썸네일 자동 전파.

### AnalysisResult 레이어 구조는 5개 (최종)
```typescript
layers: {
  color: [...],
  typography: [...],
  layout: [...],
  gradient: [...],
  visualDirection: { markdown, tags },   // 마지막은 Markdown + 카테고리 태그
}
```
**주의**: `keyVisual` 레이어는 **없다**. 원본 프로젝트에서는 초안에 있었지만 재설계로 제거됨. 교육용으로는 처음부터 `visualDirection`만.

### Storybook seed 분기
- **기본값 `'empty'`** — 실 사용 환경처럼 빈 상태
- **Storybook만 `'fixtures'`** — 27건 mock 데이터 로드
- Store 자체는 Stage 4에서 만들지만, **fixture 데이터 세팅은 이 Stage에서 완료**

---

## ④ 실습 순서

### Step 1. 이미지 자산 배치

`src/assets/muse-references/` 폴더에 실 이미지 27장 배치. 파일명 예시:
```
ref-001.jpg
ref-002.jpeg   # 확장자 혼재 허용, 개별 처리
ref-003.jpg
...
ref-027.jpg
```
**주의**: 원본 프로젝트에서는 초기 28장 중 `ref-001`을 부적절해서 삭제 → 27장 최종. 교육용으로는 처음부터 **부적절한 이미지 필터링 후 27장**으로 시작.

### Step 2. `schemas.js` 작성

```js
// src/data/muse/schemas.js
/**
 * @typedef {Object} Reference
 * @property {string} id
 * @property {string} title
 * @property {Object} tags
 * @property {string[]} tags.color
 * @property {string[]} tags.typography
 * @property {string[]} tags.layout
 * @property {string[]} tags.gradient
 * @property {Object} tags.visualDirection
 * @property {string[]} tags.visualDirection.genre
 * @property {string[]} tags.visualDirection.style
 * @property {string[]} tags.visualDirection.subject
 * @property {string[]} dominantColors  - hex 배열
 * @property {string} thumbnailUrl      - Vite import URL
 * @property {number} width
 * @property {number} height
 * @property {Object} [extracted]       - T1이 추출한 값 (Stage 4)
 * @property {Array} [extracted.palette]
 * @property {Array} [extracted.typography]
 * @property {Array} [extracted.layout]
 * @property {Array} [extracted.gradient]
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {string} intent
 * @property {string} type
 * @property {string[]} referenceIds
 * @property {string} thumbnailUrl   - 파생
 * @property {string} createdAt
 */

/**
 * @typedef {Object} AnalysisResult
 * @property {string} projectId
 * @property {Object} layers
 * @property {Array<{name,hex,label,group}>} layers.color
 * @property {Array<{name,fontFamily,fontSize,fontWeight,lineHeight}>} layers.typography
 * @property {Array<{name,columns,gap}>} layers.layout
 * @property {Array<{name,angle,colors}>} layers.gradient
 * @property {{markdown:string, tags:Object}} layers.visualDirection
 */

/**
 * @typedef {Object} UserSettings
 * @property {string} userId
 * @property {string} aiModel
 * @property {boolean} isAutoTagEnabled
 * @property {'local'|'cloud'} storageMode
 * @property {'light'|'dark'} themeMode
 */

export const SCHEMAS = { /* for runtime introspection if needed */ };
```

### Step 3. `tag/index.js` 프리셋 정의

프리셋 어휘 파일을 먼저 만들어야 `references.js` 생성 시 enum 사용 가능:
```js
// src/data/muse/tag/index.js
export const TAG_PRESETS = {
  color: [
    { key: 'Muted', description: '탁하고 어두운 톤' },
    { key: 'Deep', description: '짙고 풍부한 톤' },
    { key: 'Bright', description: '선명하고 밝은 톤' },
    { key: 'Pastel', description: '부드럽고 연한 톤' },
    { key: 'Neutral', description: '무채색·저채도' },
  ],
  typography: [
    { key: 'SansSerif', description: '산세리프' },
    { key: 'Serif', description: '세리프' },
    { key: 'Mono', description: '고정폭' },
    { key: 'Display', description: '디스플레이/장식' },
  ],
  layout: [
    { key: 'Grid12', description: '12컬럼 그리드' },
    { key: 'Grid6', description: '6컬럼 그리드' },
    { key: 'Asymmetric', description: '비대칭 레이아웃' },
    { key: 'Centered', description: '중앙정렬' },
  ],
  gradient: [
    { key: 'Sunset', description: '따뜻한 저녁 그라디언트' },
    { key: 'Night', description: '차가운 밤 그라디언트' },
    { key: 'Ocean', description: '바다 계열' },
    { key: 'None', description: '그라디언트 없음' },
  ],
  visualDirection: {
    genre: [
      { key: 'Editorial', description: '에디토리얼' },
      { key: 'Lifestyle', description: '라이프스타일' },
      { key: 'Commercial', description: '커머셜' },
    ],
    style: [
      { key: 'Minimal', description: '미니멀' },
      { key: 'Ornate', description: '장식적' },
      { key: 'Bold', description: '대담한' },
      { key: 'Soft', description: '부드러운' },
    ],
    subject: [
      { key: 'Nature', description: '자연' },
      { key: 'Urban', description: '도시' },
      { key: 'Human', description: '사람' },
      { key: 'Product', description: '제품' },
    ],
  },
};

export function getLayerEnum(layer, subLayer) {
  if (layer === 'visualDirection' && subLayer) {
    return TAG_PRESETS.visualDirection[subLayer].map(t => t.key);
  }
  return TAG_PRESETS[layer].map(t => t.key);
}

export function getLayerTags(layer, subLayer) {
  if (layer === 'visualDirection' && subLayer) {
    return TAG_PRESETS.visualDirection[subLayer];
  }
  return TAG_PRESETS[layer];
}

export function renderVocabularyPrompt(layer, subLayer) {
  const tags = getLayerTags(layer, subLayer);
  return tags.map(t => `- ${t.key}: ${t.description}`).join('\n');
}

export function flattenTags(tags) {
  // 중첩 tags → flat string[] (호환 어댑터, 필요한 곳에서만 사용)
  const flat = [
    ...(tags.color || []),
    ...(tags.typography || []),
    ...(tags.layout || []),
    ...(tags.gradient || []),
    ...(tags.visualDirection?.genre || []),
    ...(tags.visualDirection?.style || []),
    ...(tags.visualDirection?.subject || []),
  ];
  return flat;
}
```

### Step 4. `references.js` — 27건 결정적 생성

```js
// src/data/muse/references.js
import { getLayerEnum } from './tag/index.js';
import ref001 from '../../assets/muse-references/ref-001.jpg';
import ref002 from '../../assets/muse-references/ref-002.jpeg';
// ... ref-027

const THUMBS = [ref001, ref002, /* ... */, ref027];

const pick = (arr, seed) => arr[seed % arr.length];

export const references = THUMBS.map((thumb, i) => {
  const idx = i + 1;
  const id = `r${String(idx).padStart(3, '0')}`;
  return {
    id,
    title: `Reference ${idx}`,
    tags: {
      color: [
        pick(getLayerEnum('color'), idx * 7),
        pick(getLayerEnum('color'), idx * 11),
      ],
      typography: [pick(getLayerEnum('typography'), idx * 13)],
      layout: [pick(getLayerEnum('layout'), idx * 17)],
      gradient: [pick(getLayerEnum('gradient'), idx * 19)],
      visualDirection: {
        genre: [pick(getLayerEnum('visualDirection', 'genre'), idx * 23)],
        style: [pick(getLayerEnum('visualDirection', 'style'), idx * 29)],
        subject: [pick(getLayerEnum('visualDirection', 'subject'), idx * 31)],
      },
    },
    dominantColors: generateDominantColors(idx),  // 결정적 hex 배열
    thumbnailUrl: thumb,
    width: 1200,
    height: 1600,
    extracted: generateMockExtracted(idx),   // Stage 4에서 실 T1이 덮어씀
  };
});

function generateDominantColors(seed) {
  // seed 기반 결정적 hex 5개 생성
}
function generateMockExtracted(seed) {
  return {
    palette: [ /* 5개 */ ],
    typography: [ /* 2개 */ ],
    layout: [ /* 1개 */ ],
    gradient: [ /* 1개 */ ],
  };
}
```

### Step 5. `projects.js` — 4건 + 썸네일 파생

```js
import { references } from './references.js';

const rawProjects = [
  { id: 'p1', name: '브랜드 리뉴얼', intent: '미니멀 럭셔리', type: 'Brand', referenceIds: ['r001','r005','r009'] },
  { id: 'p2', name: '에디토리얼 매거진', intent: '고급 에디토리얼', type: 'Editorial', referenceIds: ['r003','r012','r018'] },
  { id: 'p3', name: '커피샵 리뉴얼', intent: '따뜻한 카페', type: 'Space', referenceIds: ['r007','r014','r021'] },
  { id: 'p4', name: 'IT 랜딩', intent: 'SaaS 모던', type: 'Web', referenceIds: ['r002','r010','r016','r024'] },
];

export const projects = rawProjects.map(p => ({
  ...p,
  thumbnailUrl: references.find(r => r.id === p.referenceIds[0])?.thumbnailUrl,
  createdAt: '2026-04-22T00:00:00Z',
}));
```

### Step 6. `analysisResults.js` — 결정적 레이어 생성

4개 프로젝트별 AnalysisResult. **색/타이포/레이아웃/그라데이션 + visualDirection(markdown)** 5개 레이어.

```js
export const analysisResults = projects.map(p => ({
  projectId: p.id,
  layers: {
    color: [ /* 5개 토큰 */ ],
    typography: [ /* 3개 토큰 */ ],
    layout: [ /* 2개 토큰 */ ],
    gradient: [ /* 1개 토큰 */ ],
    visualDirection: {
      markdown: `# Visual Direction for ${p.name}\n\n...`,
      tags: {
        genre: ['Editorial'],
        style: ['Minimal'],
        subject: ['Nature'],
      },
    },
  },
}));
```

### Step 7. `userSettings.js` + `index.js` barrel

```js
// src/data/muse/userSettings.js
export const defaultUserSettings = {
  userId: 'local-dev',
  aiModel: 'claude-haiku-4-5-20251001',
  isAutoTagEnabled: true,
  storageMode: 'local',
  themeMode: 'light',
};
```

```js
// src/data/muse/index.js
export * from './schemas.js';
export * from './references.js';
export * from './projects.js';
export * from './analysisResults.js';
export * from './userSettings.js';
export * from './tag/index.js';
```

### Step 8. `README.md` — 데이터 폴더 규칙

```markdown
# src/data/muse

MUSE 데이터의 단일 진실 원천.

## 규칙
1. 스키마는 `schemas.js`에만 정의. 문서/AI/DB는 이 파일을 참조.
2. 더미 데이터는 결정적 패턴(`i * prime % range`)으로 생성.
3. 이미지는 `src/assets/muse-references/`에 배치하고 Vite 정적 import.
4. 스토리 파일에서 인라인 mock 금지. 여기서 import.
5. UI 전용 플래그(`_pending`, `_tagError` 등)는 DB 저장 X, 런타임만.
```

### Step 9. Storybook 카탈로그 4종

`src/stories/muse/References.stories.jsx` 등:
- 각 스토리 = 스키마 표 + 실 데이터 카드 그리드
- 학습자용 뷰어 역할

### Step 10. Storybook preview fixture 주입 준비

`.storybook/preview.jsx`:
```jsx
// Stage 4에서 MuseStoreProvider 완성되면 연결
// 현재는 placeholder decorator만
```
실제 연결은 Stage 4 Step 4에서.

---

## ⑤ 체크리스트

- [ ] `src/data/muse/` 폴더 + 8개 파일 작성
- [ ] `schemas.js`에 JSDoc typedef로 5개 엔티티 정의
- [ ] `tag/index.js` 프리셋 어휘 + 헬퍼 (`getLayerEnum`, `renderVocabularyPrompt`, `flattenTags`)
- [ ] `references.js` 27건 **Vite 정적 import** (URL 문자열 0건)
- [ ] 태그는 **처음부터 중첩 + enum** (flat string[] 0건)
- [ ] `Reference.extracted` 필드 선언 (mock 값으로 채움)
- [ ] AnalysisResult에 **keyVisual 레이어 없음** — visualDirection만
- [ ] Project 썸네일이 Reference에서 파생됨
- [ ] 결정적 생성 패턴 적용 (Storybook 재방문 시 동일)
- [ ] 모든 스토리 파일이 `src/data/muse/`에서 import, 인라인 mock 0건
- [ ] Storybook 카탈로그 4종 렌더됨
- [ ] `src/data/muse/README.md` 규칙 문서

---

## ⑥ 원본 로그 레퍼런스

이 Stage의 출처:
- **008** (더미 데이터 중앙화) → Step 2, 4-7
- **009** (실 이미지 + 카탈로그) → Step 1, 9
- **010** (reference1 삭제) → **Step 1에 흡수** (처음부터 27건)
- **012** (프리셋 어휘 정의) → **Step 3으로 당김**
- **013** (태그 중첩화 + visualDirection 도입) → **Step 2, 3, 4에 흡수** (처음부터 최종 스키마)
- **023 일부** (`Reference.extracted` 필드) → **Step 2, 4로 당김** (처음부터 선언)
- **017 일부** (seed 분기 계획) → Step 10

### 실제 진행 이력 부록

> 원본 프로젝트의 데이터 모델은 **세 번의 큰 변화**를 겪었다:
>
> 1. **Phase 008**: `Reference.tags`가 `string[]` (flat). 27건을 여기에 맞춰 생성.
> 2. **Phase 012-013**: 사용자 제공 프리셋 JSON을 통합하며 **flat → 중첩 + enum**으로 전환. `flattenTags()` 어댑터를 만들어 기존 flat 가정 코드를 호환. `keyVisual` 이미지 보드 레이어가 `visualDirection` Markdown+태그로 교체.
> 3. **Phase 023**: `Reference.extracted` 필드 신설. T1이 per-image extraction까지 하도록 역할 확장.
>
> 각 전환마다 기존 데이터·스토리·AI tool schema·DB 마이그레이션까지 동반 수정이 필요했다.
>
> **교훈**: 데이터 스키마는 **초기에 최종 형태**로 합의해야 한다. 부가 요구(프리셋, extracted)는 나중에 나오더라도, 구조 자체를 바꾸면 파급이 전 범위다.
>
> 교육용으로는 이 세 번의 변화를 숨기고 **최종 스키마**로 바로 시작한다. 학습자는 "태그는 원래 flat이었다"는 사실을 몰라도 된다. 다만 강사는 이 부록을 참고해 **"왜 처음부터 중첩이어야 하는가"** 를 enum 강제의 맥락으로 설명할 수 있다.

---

**다음 Stage**: [Stage 4. 로컬에서 AI 시뮬레이션하기](./04-local-ai-simulation.md)
