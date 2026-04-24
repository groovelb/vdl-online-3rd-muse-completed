# Stage 2. UX flow 이해 + 컴포넌트 만들기

> 선행: [Stage 1](./01-planning-and-design-system.md) · 다음: [Stage 3](./03-data-assembly.md)

---

## ① 이번 Stage에서 만드는 것

**Stage 1에서 정한 UX flow를 실제 컴포넌트와 페이지 템플릿으로 구현한다.** 데이터는 이 Stage에서는 스토리 인라인 mock으로, 실제 중앙화는 Stage 3에서 한다.

30초 요약:
- ux-flow의 컴포넌트 리스트 중 **신규 12종**을 Phase 1→5 의존성 순으로 구현
- 4개 **페이지 템플릿** 조립 (Archive, ProjectDetail, ProjectList, Settings)
- ImageCard·MoodboardCard 같은 **기존 카드의 MUSE용 확장**도 여기서 같이
- **ArchivePage 필터의 3단 계층 구조**도 컴포넌트 설계에 포함

> 이 Stage의 핵심 메시지: **"primitive부터, 공통 컴포넌트 API 확장 대신 호출측 어댑터."** 필터 계층화와 ImageCard 스와치 확장은 원래 프로젝트에서는 021에서 뒤늦게 했지만, 교육용으로는 컴포넌트 설계 시점에 같이 넣는다.

---

## ② 프리뷰 — 이번에 만질 것

### 신규 컴포넌트 (12종)
| 폴더 | 컴포넌트 | Phase | 역할 |
|---|---|---|---|
| `common/ui/` | `TokenListItem` | 1 | slot primitive (preview 슬롯 주입) |
| `media/` | `InfiniteMasonry` | 1 | IntersectionObserver + CSS columns |
| `common/ui/` | `ColorSwatchList` | 2 | 색 토큰 프리뷰 |
| `common/ui/` | `TypographyPreview` | 2 | 타이포 토큰 프리뷰 |
| `common/ui/` | `LayoutTokenPreview` | 2 | 레이아웃 토큰 프리뷰 |
| `common/ui/` | `GradientPreview` | 2 | 그라디언트 토큰 프리뷰 |
| `media/` | `KeyVisualBoard` | 3 | *(Stage 3에서 삭제 예정, 일단 skeleton만)* |
| `overlay-feedback/` | `AnalysisProgress` | 3 | AI 분석 진행 UI |
| `input/` | `ReferencePicker` | 4 | 프로젝트용 레퍼런스 선택 |
| `templates/` | `ProjectCreateWizard` | 5 | 3-step useReducer |
| `overlay-feedback/` | `ThemeExportDialog` | 5 | ZIP/JSON Export UI |
| `input/` | `TagGroupFilter` | 5 | 3단 계층 필터 |

### 확장할 기존 컴포넌트 (3종)
| 컴포넌트 | 확장 내용 |
|---|---|
| `ImageCard` | `dominantColors` prop (14px 원형 스와치 상위 5개 오버레이) |
| `MoodboardCard` | 호출측 어댑터 — `src`↔`thumbnail` 필드 매핑 |
| 필터 레이아웃 | SuperSection(label+borderLeft) / SubRow(caption+chips) 3단 |

### 신규 페이지 템플릿 (4종)
| 템플릿 | 구조 |
|---|---|
| `ArchivePage` | 업로드 → 필터 → InfiniteMasonry |
| `ProjectDetailPage` | SplitScreen 60:40 (좌: 편집 / 우: 프리뷰) |
| `ProjectListPage` | MoodboardCard Grid + type Chip 오버레이 |
| `SettingsPage` | 4 섹션 폼 (AI모델 / 자동태깅 / 스토리지 / 테마) |

### 스토리 파일
각 컴포넌트·템플릿에 `*.stories.jsx` 1개씩.

---

## ③ 설계 기준 (Spec)

### 컴포넌트 구현 순서
**Phase 1→5 의존성 순**으로 진행. 역순 불가.

```
Phase 1: TokenListItem, InfiniteMasonry         (primitive)
Phase 2: ColorSwatchList, TypographyPreview,
         LayoutTokenPreview, GradientPreview    (preview slot 채우기)
Phase 3: KeyVisualBoard, AnalysisProgress       (독립 소형)
Phase 4: ReferencePicker, TagGroupFilter        (합성)
Phase 5: ProjectCreateWizard, ThemeExportDialog (복합 template)
```

이유: primitive 없이 복합 template 먼저 만들면 나중에 중복 코드를 리팩토링해야 함.

### 컴포넌트 재사용 원칙
1. **기존 컴포넌트로 대체 가능한지 먼저 확인** — 최대한 재활용
2. **공통 컴포넌트 API 확장 금지** — 호출측 어댑터로 해결 (예: MoodboardCard의 `src`/`thumbnail` 차이)
3. **slot primitive 패턴** — TokenListItem은 `preview` 슬롯만 받고 내부는 소비자가 주입

### 상태 최소 + 콜백 경계 원칙
- 페이지 템플릿은 **stateless** (props in / callbacks out)
- 내부 상태가 필요한 복합 컴포넌트는 **useReducer** 사용 (ProjectCreateWizard)
- AI 호출 같은 외부 I/O는 **콜백 prop으로 경계**에 둔다 → Storybook mock과 프로덕션에서 모두 동작

### UI 세부 규칙 (Stage 1 토큰 규칙 재확인)
- hover = 색/opacity만
- elevation=0
- placeholder 전수 (floating label 금지)
- Card radius 24 통일

### 필터 계층 구조
```
[SuperSection: "색상"]  borderLeft + label
  [SubRow: "주요 색"]    caption + swatch chips
  [SubRow: "서브 색"]    caption + swatch chips
[SuperSection: "디자인 레이어"]
  [SubRow: "Typography"] chips
  [SubRow: "Layout"]     chips
  [SubRow: "Gradient"]   chips
[SuperSection: "Visual Direction"]
  [SubRow: "Genre"]      chips
  [SubRow: "Style"]      chips
  [SubRow: "Subject"]    chips
```
**조합 규칙**: swatch OR + 태그 AND + 두 필터 간 AND.

---

## ④ 실습 순서

### Step 1. Phase 1 — TokenListItem, InfiniteMasonry

`src/common/ui/TokenListItem.jsx`:
```jsx
/**
 * Props:
 * @param {string} name - 토큰 이름 [Required]
 * @param {ReactNode} preview - 프리뷰 슬롯 (색 원/텍스트/이미지 등) [Required]
 * @param {boolean} isActive - 활성 여부 [Optional, 기본값: true]
 * @param {number} emphasis - 강조도 0-2 [Optional, 기본값: 0]
 * @param {function} onToggle - 토글 콜백 [Optional]
 */
function TokenListItem({ name, preview, isActive = true, emphasis = 0, onToggle }) {
  // Card(radius 24) + 좌 preview / 우 name + emphasis 뱃지
}
```

`src/components/media/InfiniteMasonry.jsx`:
- CSS columns 기반
- IntersectionObserver **sentinel은 Masonry 바깥** (columns 레이아웃 영향 회피)

```jsx
<Box>
  <Box sx={{ columnCount: { xs: 2, sm: 3, md: 4 }, columnGap: 2 }}>
    {items.map(...)}
  </Box>
  <div ref={sentinelRef} />  {/* ← Masonry 바깥 */}
</Box>
```

### Step 2. Phase 2 — 4종 Preview 컴포넌트

각각 TokenListItem의 `preview` 슬롯에 들어갈 프리뷰:
- `ColorSwatchList` — `[{name, hex}]` → 색 원 리스트
- `TypographyPreview` — `{fontFamily, fontSize, fontWeight, lineHeight}` → 샘플 텍스트
- `LayoutTokenPreview` — `{columns, gap}` → grid skeleton
- `GradientPreview` — `{angle, colors[]}` → linear-gradient 미리보기

**규칙**: 이 4종은 **서로 의존 없음**. 각자 스토리로 독립 검증.

### Step 3. Phase 3 — KeyVisualBoard, AnalysisProgress

> KeyVisualBoard는 **Stage 3에서 visualDirection으로 교체**되지만, 이 Stage에서는 skeleton만 만들어두고 스토리에 "deprecated 예정" 표시. 실제 프로젝트에서는 만들었다가 지웠다 — 교육용으로도 "이런 선택지가 있었다" 맥락을 유지하기 위해 남김.

`AnalysisProgress` — Dialog 안에서 T1/T2/T3 진행 단계 표시 (Stage 4에서 실제 사용).

### Step 4. Phase 4 — ReferencePicker, TagGroupFilter

`ReferencePicker`:
- 모달 형태
- `ImageCard` 재활용 + `onSelect(id)` 콜백

`TagGroupFilter` — Stage 2의 주인공:
```jsx
<TagGroupFilter
  groups={[
    { title: '색상', type: 'swatch', items: [{hex, count}] },
    { title: '디자인 레이어', type: 'tags', subgroups: [
      { caption: 'Typography', items: ['SansSerif', 'Serif'] },
      { caption: 'Layout', items: ['Grid12', 'Grid6'] },
    ]},
    { title: 'Visual Direction', type: 'tags', subgroups: [...] },
  ]}
  selected={...}
  onChange={...}
/>
```

**내부 구조**:
- `SuperSection` (label + borderLeft + padding 통일)
- `SubRow` (caption + chips 또는 swatches)
- Accordion 열고 닫기 가능

### Step 5. Phase 5 — ProjectCreateWizard, ThemeExportDialog

`ProjectCreateWizard`:
- 3 step: 의도 입력 → 레퍼런스 선택 → 토큰 분석
- **useReducer 기반** 상태 관리
- **AI 호출은 콜백으로 주입** (`recommendedLoader`, `analyze`) — Stage 4에서 T2/T3 연결

```jsx
function ProjectCreateWizard({
  initialReferences,
  recommendedLoader,    // (intent, type) => Promise<referenceIds>
  analyze,              // (referenceIds) => Promise<AnalysisResult>
  onComplete,
}) { ... }
```

`ThemeExportDialog`:
- MUI 테마 객체 export + JSON / ZIP 선택
- 실제 Export 로직은 Stage 4 (Step 7).

### Step 6. ImageCard 확장 — `dominantColors` swatch

`src/components/card/ImageCard.jsx`에 prop 추가:
```jsx
/**
 * Props:
 * @param {Array<string>} dominantColors - hex 색 배열 [Optional, 기본값: []]
 */
function ImageCard({ src, alt, dominantColors = [], ...rest }) {
  return (
    <Card>
      <img src={src} alt={alt} />
      {dominantColors.length > 0 && (
        <Box sx={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', gap: 0.5 }}>
          {dominantColors.slice(0, 5).map((hex) => (
            <Box key={hex} sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: hex, boxShadow: '0 0 0 1px rgba(255,255,255,0.8)' }} />
          ))}
        </Box>
      )}
    </Card>
  );
}
```

**주의**: `dominantColors` default는 `[]` — prop 없어도 기존 동작 유지.

### Step 7. MoodboardCard 호출측 어댑터 (썸네일 매핑)

`ProjectListPage`에서 MoodboardCard에 썸네일 전달 시 **필드 매핑을 호출측에서**:
```jsx
{projects.map((p) => (
  <MoodboardCard
    key={p.id}
    title={p.name}
    thumbnail={p.thumbnailUrl}  // ← 여기서 매핑, MoodboardCard API 확장 X
    type={p.type}
  />
))}
```

**금지**: MoodboardCard 내부에 `src || thumbnail || thumbnailUrl` 같은 다중 prop 처리 추가하지 말 것. 다른 소비자 영향.

### Step 8. 페이지 템플릿 4종 조립

`src/components/templates/`:

> **규칙 (CRITICAL)**: 페이지 템플릿은 **AppShell / GNB 를 포함하지 않는다**. 각 템플릿은 `<PageContainer>` 로 시작해서 본문만 렌더한다. GNB 는 Stage 4 에서 `AppShellLayout` 이 라우트 레벨에서 공통 주입한다.

**ArchivePage**:
```
PageContainer
├─ Hero (제목 + 새 프로젝트 버튼)
├─ FileDropzone (업로드 영역)
├─ FilterPanel (3단 계층)
└─ InfiniteMasonry
    └─ ArchiveCard
        └─ ImageCard (dominantColors 스와치 + 재시도/삭제 버튼)
```
- 필터 활성 시 `hasMore` 무시 (서버 재요청과 충돌 방지)

**ProjectDetailPage**:
```
PageContainer
├─ Project header (뒤로 + 제목 + Export 버튼)
├─ CategoryTab (color/typography/layout/gradient/visualDirection)
└─ SplitScreen 60:40
    ├─ 좌 60%: TokenListItem[] + 레이어별 preview (ColorSwatchList 등)
    └─ 우 40%: 실시간 테마 프리뷰
```
- `buildThemeObject()` 유틸로 활성 토큰만 MUI theme 환원
- `ThemeExportDialog` 는 PageContainer 내부에 portal 로 렌더

**ProjectListPage**:
```
PageContainer
├─ Hero (제목 + 새 프로젝트 버튼)
└─ Grid
    └─ MoodboardCard[] (type Chip 오버레이)
```

**SettingsPage**:
```
PageContainer
├─ Hero (Settings 제목)
└─ Sections:
   - AI 모델 설정
   - 자동 태깅 on/off
   - 스토리지 (local/cloud)
   - 테마 (light/dark)
```
- **Save 버튼은 `onSave` prop이 있을 때만** (자동저장 앱이면 안 보임)
- 반복되는 Section UI는 **파일 내부 유틸**로 — 외부 export 금지

### Step 9. 스토리 작성

각 컴포넌트·템플릿당 1개 스토리. **이 시점에서는 스토리 인라인 mock 데이터 허용** (중앙화는 Stage 3).

---

## ⑤ 체크리스트

- [ ] Phase 1: TokenListItem, InfiniteMasonry 구현 + 스토리
- [ ] Phase 2: ColorSwatchList / TypographyPreview / LayoutTokenPreview / GradientPreview
- [ ] Phase 3: AnalysisProgress (KeyVisualBoard는 skeleton만)
- [ ] Phase 4: ReferencePicker, TagGroupFilter (3단 계층)
- [ ] Phase 5: ProjectCreateWizard (useReducer), ThemeExportDialog
- [ ] ImageCard에 `dominantColors` prop 추가 (default `[]`)
- [ ] MoodboardCard는 **확장하지 말고** ProjectListPage에서 썸네일 매핑
- [ ] ArchivePage 템플릿 (업로드+필터+무한그리드) — **AppShell 래핑 금지, PageContainer 로 시작**
- [ ] ProjectDetailPage 템플릿 (SplitScreen 60:40) — **AppShell 래핑 금지**
- [ ] ProjectListPage 템플릿 (MoodboardCard grid) — **AppShell 래핑 금지**
- [ ] SettingsPage 템플릿 (4 섹션) — **AppShell 래핑 금지**
- [ ] 템플릿 스토리(`*.stories.jsx`) 는 Storybook 전용 `withAppShell` decorator 로 헤더 래핑 (앱은 라우트에서 공통 주입, 스토리는 독립 렌더이므로 별도 필요)
- [ ] 모든 컴포넌트가 Storybook에서 독립 렌더됨
- [ ] hover 시 위치 이동 없음, elevation=0 유지
- [ ] 필터 3단 계층 (SuperSection/SubRow) 시각적 구분 명확

---

## ⑥ 이 Stage의 배경 이력

> 실제 MUSE 프로젝트에서 ImageCard의 `dominantColors` 오버레이는 **디자인 QA 직전**에야 추가됐다. 그 전까지는 ImageCard가 색 정보를 표시하지 않아서 Archive에서 "색으로 레퍼런스를 찾기 어렵다"는 피드백이 누적됐다. 필터의 3단 계층 구조(SuperSection/SubRow)도 같은 시점에 잡혔다.
>
> MoodboardCard의 썸네일 매핑 문제는 중간에 버그로 발견됐다. 당시 "MoodboardCard에 src prop을 추가할까" 논의가 있었지만, 다른 소비자 영향을 고려해 **호출측 어댑터(ProjectListPage)로 해결**했다.
>
> **교훈**: 컴포넌트는 **처음 만들 때 데이터 구조와 UX 요구를 다 반영**해야 한다. 나중에 확장하면 기존 스토리/소비자 감사 비용이 든다.
>
> 교육용으로는 이 둘을 컴포넌트 구현 시점(Stage 2)에 처음부터 포함했다.

---

**다음 Stage**: [Stage 3. 더미 데이터로 조립하기](./03-data-assembly.md)
