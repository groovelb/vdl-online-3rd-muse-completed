# MUSE 작업 로그 분석 (재현용)

실습 교육자료로 동일한 바이브 코딩을 재현할 때, 중간에 설계가 다르게 흘러가지 않도록 **스펙 / UX 룰 / 데이터 모델**을 기준으로 24개 로그(001~024)를 교차 정리한 문서.

- **누가 읽나**: 동일 실습을 다시 진행하는 교육생/강사
- **언제 읽나**: 각 Phase 진입 전 + AI가 제안하는 방향이 애매할 때
- **자매 문서**:
  - [PHASE-CARDS.md](./PHASE-CARDS.md) — Phase별 진입조건·결정·산출물·검증 카드
  - [REPRODUCE-FAQ.md](./REPRODUCE-FAQ.md) — 분기 방지 Q&A

---

## 0. 분석 프레임 (4-Layer)

로그를 순서대로 서술하면 "어디서 틀어지는지"가 드러나지 않아, 아래 4개 축으로 **교차** 정리한다.

| Layer | 질문 | 본문 섹션 |
|---|---|---|
| ① Timeline Spine | 어떤 Phase가 어떤 순서로 | §1 |
| ② Spec/Rule Ledger | 각 시점에 어떤 문서가 "헌법" 역할 | §2 |
| ③ Data Schema Diff | 데이터 구조가 어떻게 진화 | §3 |
| ④ Branching Hotspots | 재현 시 다르게 흘러가기 쉬운 지점 | §4 |

교육자료로 배포할 때는 **④ → ②/③ → ①** 순으로 읽게 한다 (분기 위험 선인지 → 근거).

---

## 1. Timeline Spine

```
기획(001-003) → 토큰(004) → 컴포넌트(005-007) → 데이터중앙화(008-010)
  → AI 프록시·T1(011) → 프리셋 재설계(012-013) → T2/T3 완성(014)
    → 상태관리(015) → 라우팅·Export(016-017)
      → Supabase 계획·구현(018-020)
        → 필터·QA(021-022)
          → T1/T3 역할재정의(023) → 안정화(024)
```

**3개 큰 변곡점**:
- **013**: `keyVisual → visualDirection` 교체 + `Reference.tags` flat→중첩
- **020**: localStorage → Supabase 전면 전환 + AuthProvider 싱글톤
- **023**: T1=관찰추출 / T3=text-only 조합 으로 역할 재정의, 비용 ~2.5배 절감

### Phase별 한 줄 요약

| # | Phase | 한 줄 |
|---|---|---|
| 001 | 기획 | MVP 스코프 확정 (필수6·선택2, 제외: 코드생성/협업/모바일) |
| 002 | UX | 4 시나리오 + IA + 컴포넌트 7그룹 + on/off·emphasis 2축 |
| 003 | 비주얼 | Primary `#14132B`, 배경 `#FCFCFF`, Card radius 24px, elevation=0 |
| 004 | 토큰 | `styles/themes/default.js` 단일 파일, MUI grey 전면교체, info=`#4F46E5` |
| 005 | 컴포넌트 | 신규 12종 + ImageCard 확장 (의존성 역순 불가) |
| 006 | 템플릿 | ArchivePage + ProjectDetailPage (SplitScreen 60:40) |
| 007 | IA 완성 | ProjectListPage + SettingsPage 추가 |
| 008 | 데이터 | `src/data/muse/` 중앙화, schemas.js 단일 진실 원천 |
| 009 | 이미지 | 28장 Vite 정적 import, 카탈로그 스토리 4종 |
| 010 | 정리 | reference1 삭제(27건), MoodboardCard 어댑터 수정 |
| 011 | AI | aiTasks.js 중앙화, Vite 프록시(서버측 키), T1 Playground |
| 012 | 계획 | 프리셋 통합·재설계 계획 (visualDirection MD 도입) |
| 013 | 구조변경 | keyVisual 제거, tags 중첩화, T1 schema 레이어 enum 강제 |
| 014 | AI | T2/T3 Playground, flow 완성 |
| 015 | 상태 | Context+useReducer, 슬라이스훅, ArchivePage T1 실연결 |
| 016 | 라우팅 | React Router 5경로, Wizard T2/T3 실호출, ZIP 범용JSON |
| 017 | seed | 기본=empty, Storybook=fixtures |
| 018 | 백엔드 계획 | Supabase 연동 계획, jsonb·RLS owner-only·reference_items 확정 |
| 019 | 백엔드 구축 | DB 6테이블 + 인증 트리거 + RLS |
| 020 | 백엔드 통합 | Storage 경로, AuthProvider 싱글톤, T3 512px |
| 021 | 필터 | hex 스와치 + 3단 계층 + 빈도 집계 |
| 022 | QA | elevation=0, hover 최소, placeholder 전환, GNB, 앰비언트 |
| 023 | 재정의 | T1=관찰추출 / T3=text-only 조합, Haiku 통일 |
| 024 | 안정화 | async/await race fix, concurrency 3, 재시도 auto3+manual |

---

## 2. Spec / Rule Ledger (설계 기준 문서)

실습 내내 "이후 모든 결정의 헌법"으로 쓰인 문서 12건.

| # | 파일 | 규정한 것 |
|---|---|---|
| 001 | `docs/muse/01-project-summary.md` | 필수6·선택2 기능 + 제외범위(코드생성/협업/모바일) |
| 002 | `docs/muse/02-ux-flow.md` | 4 시나리오 + IA + 컴포넌트 7그룹 + on/off+emphasis(0-2) 2축 |
| 003 | `docs/muse/03-visual-direction.md` | Primary `#14132B`, 배경 `#FCFCFF`, Card radius 24px 통일, elevation=0 |
| 004 | `src/styles/themes/default.js` | 단일 토큰 파일, 전역 `shape.borderRadius: 0`+컴포넌트 오버라이드, info=Accent |
| 005 | Phase 1-5 컴포넌트 의존성 순 | TokenListItem = slot primitive, InfiniteMasonry sentinel은 Masonry 바깥 |
| 008 | `src/data/muse/schemas.js` | **단일 진실 원천** (문서는 참조만) |
| 011 | `src/data/muse/aiTasks.js` | T1/T2/T3 프롬프트·tool스키마·품질축·골든예시 통합 |
| 013 | `src/data/muse/tag/index.js` | 프리셋 어휘 소비 단일창구 (getLayerTags/getLayerEnum/renderVocabularyPrompt) |
| 018 | `docs/muse/backend-integration-plan.md` | jsonb 채택, RLS owner-only, `reference_items` (예약어 회피) |
| 020 | `src/lib/museDb.js` | snake↔camel 매퍼, UI 플래그(`_pending`) DB 저장 제외 |
| 021 | `src/utils/colorSimilarity.js` | HSL 유사도 (hue≤30°, sat≤0.35, light≤0.28) + neutral 저채도 예외 |
| 023 | T1/T3 역할 재정의 | T1=per-image 관찰+추출, T3=text-only 조합, **이미지 재분석 금지** |

### 문서 간 계약 관계

```
001 (스코프)
  ↓ 제약
002 (UX)
  ↓ 화면/컴포넌트
003 (비주얼) ──▶ 004 (토큰 코드)
  ↓                  ↓
005~007 (컴포넌트/페이지)
  ↓
008 (schemas.js) ◀── 모든 이후 코드가 참조
  ↓
011 (aiTasks.js) + 013 (tag/index.js) ◀── AI 호출 단일창구
  ↓
018 (DB 계획) ──▶ 019 (마이그레이션) ──▶ 020 (museDb.js 매퍼)
  ↓
023 (T1/T3 재정의) ← aiTasks.js, museDb.js, Reference.extracted 동시 수정
```

---

## 3. Data Schema Diff (실습 재현 시 가장 중요)

여기가 갈리면 이후 전부 틀어진다.

### 3-1. `Reference.tags` 구조
```
[008] string[]                                           // flat
  ↓
[013] {
   color: string[0..3],         // enum: Muted/Deep/...
   typography: string[0..3],    // enum: SansSerif/Serif/...
   layout: string[0..3],        // enum: Grid12/Grid6/...
   gradient: string[0..2],      // enum: Sunset/Night/...
   visualDirection: {
     genre: string[0..2],       // Editorial/Lifestyle/...
     style: string[0..2],       // Minimal/Ornate/...
     subject: string[0..2]      // Nature/Urban/...
   }
 }
  ↓
[020] + UI 플래그: _pending, _tagError (로컬전용, DB 저장 제외)
  ↓
[023] + extracted: { palette, typography, layout, gradient }  // T1이 추출해 저장
```

### 3-2. `AnalysisLayers` 구조
```
[008] { color, typography, layout, gradient, keyVisual }         // 5 layer
  ↓
[013] { color, typography, layout, gradient, visualDirection }   // 마지막만 성격 교체
```
레이어 개수(5)는 보존, 마지막 레이어만 이미지보드→Markdown+태그로 교체.

### 3-3. 저장소 변천
```
[008] 코드 내 배열
[009] + Vite 정적 import (이미지 28장)
[015] + localStorage persist (STORAGE_KEY v3)
[017] seed 분기, STORAGE_KEY v4
[019] Supabase 6테이블 + RLS
[020] + Storage signed URL (`{user_id}/{reference_id}.{ext}`), STORAGE_KEY v5
[023] + reference_items.extracted jsonb
```

### 3-4. AI 호출 구조
```
[011] T1 per-image, 이미지 1024px
[014] T2/T3 완성, T3=이미지 포함 2-tool
[020] T3 이미지 512px (≈17% 절감)
[023] T3 text-only + Haiku 통일 (≈2.5× 절감)
      T1이 분류+추출 모두 담당
```

### 3-5. Supabase 테이블 (019 확정)
```
reference_items(id, user_id, title, tags jsonb, dominantColors, storage_path, extracted jsonb, created_at)
projects(id, user_id, name, intent, type, created_at)
project_references(project_id, reference_id)  -- FK cascade
analysis_results(id, user_id, project_id, layers jsonb, created_at)
profiles(user_id, email, display_name, created_at)
user_settings(user_id, ai_model, is_auto_tag_enabled, storage_mode, theme_mode)
```

### 3-6. 범용 Export JSON (016 확정)
```json
{
  "meta": { "projectId", "name", "createdAt", "model" },
  "color":      { "tokens": [{"name","hex","description","sourceReferenceIds"}] },
  "typography": { "tokens": [...] },
  "layout":     { "tokens": [...] },
  "gradient":   { "tokens": [...] },
  "visualDirection": { "markdown", "tags" },
  "references": [{"id","filename":"references/ref-001.jpg"}]
}
```
**원칙**: MUI 식별자 제거, hex/CSS value만 → 프레임워크 비종속.

---

## 4. Branching Hotspots (재현 위험 12개)

| # | 위험 | 확정 로그 | 틀어지면 |
|---|---|---|---|
| 1 | 태그를 flat 유지 | 013 | T1 tool schema 레이어별 enum 강제 불가 → 품질 저하 |
| 2 | keyVisual 유지 | 013 | Export JSON이 이미지 의존 → 범용성 상실 |
| 3 | T3가 이미지 재분석 | 023 | 비용 2.5배 + 일관성 저하 |
| 4 | 필터를 태그명 text 유지 | 021 | "색상 필터 안 된다" UX 불만 재발 |
| 5 | localStorage 병행 유지 | 017→020 | race, stale cache |
| 6 | `references` 테이블명 | 018 | PostgreSQL 예약어 충돌 |
| 7 | Export에 MUI 식별자 포함 | 016 | 프레임워크 비종속성 상실 |
| 8 | 다중업로드 Promise.all | 024 | rate limit, 간헐 생략 |
| 9 | T1 실패 시 자동 삭제 | 024 | 사용자 선택권 박탈 |
| 10 | AuthProvider 중복 생성 | 020 | session race |
| 11 | 토큰 파일 분산 | 004 | 토큰 drift |
| 12 | 이미지 리사이즈 누락 | 020, 023 | T3 호출 비용 폭증 |

### 핵심 분기 재현 경로

**A. 태그 구조 결정 (가장 큰 분기)**
- 012에서 프리셋 어휘 정의 → 013에서 flat→중첩 + T1 schema 레이어별 enum 강제
- 이후 돌이킬 수 없음 — 프로젝트 생성이 text-only인지 이미지 포함인지 여기서 결정됨

**B. T3 비용 절감 경로**
- 020: 초기 최적화 (512px, T1 primary signal, 17% 절감)
- 023: 완전 재설계 (text-only, extracted pool, 2.5× 절감)
- 순서 뒤섞지 말 것

**C. DB 설계**
- 018 jsonb vs 정규화 → 019 RLS owner-only
- 프로덕션 전환 후 변경 비용 매우 큼

**D. 상태관리 의존성**
- 015 (Context+useReducer/localStorage) → 020 (Supabase 수술, seed 분기로 양립) → 023 (extracted 필드)
- 역순 불가

---

## 5. 재현 체크리스트

### 기획 (001-003)
- [ ] project-summary: 기능 8개 + 제외 범위 명시
- [ ] ux-flow: 4 시나리오 + IA + 컴포넌트 7그룹
- [ ] visual-direction: 5개 판단 포인트 응답 후 승인 게이트

### 토큰·컴포넌트 (004-010)
- [ ] default.js: 기존 grey 제거, 커스텀 틴트, info=바이올렛
- [ ] 컴포넌트 Phase 1→5 의존순
- [ ] schemas.js 중앙화 + 결정적 더미 생성
- [ ] 실이미지 Vite 정적 import

### AI (011-014)
- [ ] aiTasks.js 단일 진실 원천
- [ ] Vite 프록시: `.env.local` + loadEnv Node측만, **`VITE_` 접두어 절대 금지**
- [ ] 재설계 계획(012) → 실행(013) → flow(014) 순
- [ ] keyVisual→visualDirection, tags 중첩화

### 상태·라우팅 (015-017)
- [ ] Context+useReducer + 슬라이스훅 + STORAGE_KEY 버전
- [ ] stateless 템플릿 + `*Route.jsx` 컨테이너 분리
- [ ] 범용 JSON (hex/CSS value만)
- [ ] seed 기본=empty

### 백엔드 (018-020)
- [ ] jsonb 선택 근거, RLS owner-only, `reference_items` 테이블명
- [ ] 3 마이그레이션 분리 (스키마/트리거/RLS)
- [ ] Storage `{user_id}/{reference_id}.{ext}`
- [ ] AuthProvider 싱글톤, T3 512px, 다중업로드

### UI·최적화 (021-024)
- [ ] hex 스와치 + 빈도 집계 + 3단 계층 + HSL 유사도
- [ ] QA 10항목 전수 (elevation=0, hover 최소, placeholder, GNB, 앰비언트)
- [ ] T1=관찰추출 / T3=text-only / Haiku 통일
- [ ] async/await race fix + concurrency 3 + 재시도 auto3+manual
