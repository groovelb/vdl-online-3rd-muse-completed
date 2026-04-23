# MUSE 재현 FAQ (분기 방지 Q&A)

바이브 코딩으로 동일 실습을 다시 진행할 때 **AI가 다른 제안을 하면 어느 쪽이 정답인지** 즉시 판단할 수 있는 Q&A.

> 짝 문서: [ANALYSIS.md](./ANALYSIS.md) · [PHASE-CARDS.md](./PHASE-CARDS.md)

각 항목 형식: **상황 → AI가 제안하기 쉬운 오답 → 정답 → 근거 로그**

---

## 🎨 Phase 1-2: 기획·토큰

### Q1. Primary 색상 추천이 바이올렛/브랜드컬러로 나올 때
- **오답**: "브랜드감 있는 바이올렛으로 갑시다"
- **정답**: `#14132B` near-black 고정
- **근거**: 003 — **이미지 퍼스트**. Primary가 튀면 레퍼런스 이미지의 색 인식이 방해됨
- **판단 기준**: "이 버튼이 이미지보다 먼저 보여야 하나?" → No면 near-black

### Q2. 배경색이 완벽한 흰색(`#FFFFFF`)으로 제안될 때
- **오답**: 순백 + grey.50
- **정답**: `#FCFCFF` / `#F8F8FC` (은은한 틴트)
- **근거**: 003 — 완벽한 흰색은 이미지 색을 왜곡. 아주 약한 바이올렛 틴트로 눈의 화이트밸런스 고정

### Q3. Card·Dialog radius 를 크기별로 다르게 제안할 때
- **오답**: "클리커블은 24px, 비클리커블은 12px로 위계"
- **정답**: **Card 전체 24px 통일**
- **근거**: 003 — 클리커블/비클리커블 구분 삭제. 카드의 'container' 역할 일관성 유지

### Q4. MUI grey 스케일을 그대로 쓰자고 할 때
- **오답**: "MUI 기본 grey가 검증됨, 그대로 사용"
- **정답**: **전면 교체** (커스텀 바이올렛 틴트 10단계)
- **근거**: 004 — 배경 톤과 맞추려면 grey도 같은 hue로 가야 함. 별도 theme 파일 생성 금지, `default.js` 하나만 수정

### Q5. `shape.borderRadius` 를 16px 등으로 전역 설정하자고 할 때
- **오답**: `theme.shape.borderRadius = 24`
- **정답**: **전역 0 유지 + 컴포넌트 오버라이드로만 확장** (Button/Chip=999px, Card/Dialog=24px)
- **근거**: 004 — 전역값 변경 시 의도치 않은 컴포넌트까지 영향. 명시적 오버라이드가 안전

---

## 🧩 Phase 3-4: 컴포넌트·데이터

### Q6. ProjectListPage 만들 때 MoodboardCard를 확장하자고 할 때
- **오답**: "MoodboardCard에 type chip prop 추가"
- **정답**: **API 확장 금지, 호출측 어댑터로 오버레이만**
- **근거**: 007, 010 — 공통 컴포넌트 API 확장 전에 호출측에서 해결. 다른 소비자에게 영향 X

### Q7. 컴포넌트 Phase 역순 구현 허용할지
- **오답**: "ProjectCreateWizard부터 먼저 만들고 작은 컴포넌트는 TODO"
- **정답**: **Phase 1→5 의존성 순 엄수** (primitive → 복합 template)
- **근거**: 005 — 역순 시 primitive 없이 작성해 나중에 중복/리팩토링 폭증

### Q8. 더미 데이터를 스토리 파일에 인라인으로 둘 때
- **오답**: 각 `.stories.jsx`에 로컬 배열
- **정답**: **`src/data/muse/` 중앙화 + `schemas.js` 단일 진실 원천**
- **근거**: 008 — 이후 AI 태스크/백엔드가 같은 스키마를 참조. 인라인 더미는 스키마 drift 원인

### Q9. 이미지를 URL 문자열로 참조할 때
- **오답**: `thumbnailUrl: '/images/ref-001.jpg'`
- **정답**: **Vite 정적 import** (`import ref001 from '../assets/ref-001.jpg'`)
- **근거**: 009 — 경로 문자열은 빌드 시 누락 감지 불가. 정적 import는 파일 없으면 빌드 실패

### Q10. `src/data/muse/schemas.js` vs `02-ux-flow.md` 불일치 시
- **오답**: "문서 기준으로 코드 수정"
- **정답**: **`schemas.js`가 단일 진실 원천**, 문서를 수정
- **근거**: 018 — 문서는 참조만. 코드가 실제 동작하므로 코드를 신뢰

---

## 🤖 Phase 5: AI

### Q11. Anthropic API 키를 프론트 env로 빼자고 할 때
- **오답**: `VITE_ANTHROPIC_API_KEY`
- **정답**: **`VITE_` 접두어 절대 금지**. `.env.local` + loadEnv Node측만, Vite 프록시 middleware로 우회
- **근거**: 011 — `VITE_` 접두어는 클라이언트 번들에 노출됨. API 키 유출 보안 사고

### Q12. T1 tool schema를 flat tags 배열로 유지하자고 할 때
- **오답**: `tags: string[]` 단일 배열
- **정답**: **레이어별 중첩 객체 + enum 강제** (color/typography/layout/gradient/visualDirection)
- **근거**: 013 — flat이면 품질 낮고 필터링 불가. enum 강제로 모델이 어휘 밖 태그 생성 차단

### Q13. keyVisual 레이어를 유지하자고 할 때
- **오답**: "이미지 보드니까 남겨두자"
- **정답**: **삭제하고 `visualDirection`(Markdown+카테고리 태그)로 교체**. 레이어 개수(5) 보존
- **근거**: 013 — Export JSON 범용성 위해 프레임워크·이미지 비종속 필요

### Q14. 프리셋 재설계를 한 번에 다 하자고 할 때
- **오답**: "계획이랑 실행 합쳐서 진행"
- **정답**: **012(계획) → 013(실행) 분리**. 계획 문서 먼저 승인
- **근거**: 012 — 구조 변경은 열린 질문 목록 작성 후 승인. 바로 구현 금지

### Q15. T3 `tool_choice`를 단일 tool로 강제할 때
- **오답**: `tool_choice: { type: 'tool', name: 'submit_tokens' }`
- **정답**: **`tool_choice: { type: 'any' }` + 2 tool 자유선택** (하나만 와도 partial 렌더)
- **근거**: 014 — 강제 시 다른 tool 결과 누락. any + map 정규화가 안전

---

## 💾 Phase 6-7: 상태·라우팅

### Q16. 상태관리 라이브러리 도입 제안 시
- **오답**: "Zustand/Jotai로 가자"
- **정답**: **Context + useReducer + 슬라이스 훅** (신 의존성 배제)
- **근거**: 015 — 향후 Supabase 연동을 고려, 라이브러리 오버헤드 불필요

### Q17. localStorage 버전 없이 영속화 시
- **오답**: `localStorage.setItem('muse', ...)`
- **정답**: **`STORAGE_KEY = 'muse_store_v{N}'` 버전 suffix**
- **근거**: 015, 017, 020 — 스키마 변경 시 v3→v4→v5 bump로 구버전 자동 무효화

### Q18. 페이지 컴포넌트에 store 훅 직접 쓰기
- **오답**: ArchivePage 내부에서 `useReferencesSlice` 호출
- **정답**: **stateless 템플릿 + `*Route.jsx` 컨테이너 분리**
- **근거**: 016 — Storybook에서는 fixtures, 프로덕션에서는 store 주입. 컨테이너가 데이터 다리

### Q19. Export JSON에 MUI 식별자 포함 제안 시
- **오답**: `{ muiComponent: 'Button', variant: 'contained' }`
- **정답**: **hex/CSS value만** (`{ name, hex, description }`)
- **근거**: 016 — 범용 JSON은 프레임워크 비종속. 수령자가 React/Vue/Figma 어느 쪽이든 사용 가능

### Q20. seed 기본값을 fixtures로 두자고 할 때
- **오답**: "개발 편의상 기본 fixtures"
- **정답**: **기본 `'empty'`, Storybook만 `'fixtures'`**
- **근거**: 017 — 기본값은 프로덕션 동작. 개발자도 실제 온보딩 flow를 체험해야 함

---

## 🗄️ Phase 8: Supabase

### Q21. 테이블명을 `references`로 하자고 할 때
- **오답**: `create table references (...)`
- **정답**: **`reference_items`** — `references`는 PostgreSQL 예약어
- **근거**: 018 — 초기에 안 잡으면 배포 후 비용 매우 큼

### Q22. tags 정규화 제안 시
- **오답**: "태그를 별도 테이블로 정규화"
- **정답**: **jsonb 채택** (편집=통째 write, 검색=containment)
- **근거**: 018 — MUSE는 편집 흐름이 jsonb에 적합. 정규화는 조인 비용 큼

### Q23. RLS를 공개로 두자고 할 때
- **오답**: "공용 앱이니 public read"
- **정답**: **owner-only RLS** (user_id = auth.uid())
- **근거**: 018 — 단일 사용자 계정 전제. 추후 공유 기능은 별도 정책 추가

### Q24. 마이그레이션을 한 파일에 다 쓸 때
- **오답**: `001_all.sql` (스키마+트리거+RLS 한번에)
- **정답**: **3 마이그레이션 분리** (스키마 / 인증 트리거 / RLS 정책)
- **근거**: 019 — 교육 재현 용이, 롤백/디버그 단순화

### Q25. AuthProvider가 여러 곳에서 `useSession()` 호출 시
- **오답**: 각 라우트에서 `supabase.auth.getSession()` 직접 호출
- **정답**: **AuthProvider 싱글톤** — Context로 단일 세션 공유
- **근거**: 020 — 여러 곳 호출 시 race condition, token refresh 중복

### Q26. `_pending` UI 플래그를 DB에 저장하자고 할 때
- **오답**: `reference_items.is_pending` 컬럼 추가
- **정답**: **로컬 UI 플래그만, 매퍼에서 pick 제외**
- **근거**: 020 — 업로드 중 상태는 세션별 개념. DB에 남으면 다른 디바이스에서 혼란

---

## 🎯 Phase 9-10: QA·최적화

### Q27. 필터를 태그명(Muted/Deep) 드롭다운으로 둘 때
- **오답**: `<Select options={['Muted','Deep']} />`
- **정답**: **hex 스와치 26px + 빈도 상위 40개 + HSL 유사도 OR**
- **근거**: 021 — 디자이너 직관. "색상 필터가 안 된다"는 피드백의 정체는 UX였음

### Q28. hover 효과로 `translateY(-2px)` 제안 시
- **오답**: `&:hover { transform: translateY(-2px) }`
- **정답**: **색/opacity만 변경, 위치 이동 금지**
- **근거**: 022 — 위치 이동은 인접 요소 밀림, 정밀 클릭 방해

### Q29. elevation을 카드에 적용하자고 할 때
- **오답**: `<Paper elevation={2} />`
- **정답**: **전역 elevation=0** (MuiPaper 기본)
- **근거**: 022 — MUSE 비주얼 디렉션. 그림자 대신 radius + 배경 틴트로 위계

### Q30. 라벨을 Input 위에 배치 제안 시
- **오답**: `<TextField label="제목" />`
- **정답**: **placeholder 전환** (라벨 제거)
- **근거**: 022 — floating label은 MUSE 미니멀 기조와 충돌

### Q31. T3가 프로젝트 생성 시 이미지 다시 분석할 때
- **오답**: "프로젝트의 레퍼런스 이미지 N장을 T3에 첨부"
- **정답**: **text-only compose** — T1이 미리 추출한 `extracted`만 사용
- **근거**: 023 — 비용 2.5배 증가, 일관성 저하. T1이 이미 관찰했으므로 재분석 불필요

### Q32. T1과 T3 모델 분리 유지 제안 시
- **오답**: "T1=Haiku, T3=Sonnet (품질 위해)"
- **정답**: **Haiku 통일** (T3 schema 확장 실측 OK면)
- **근거**: 023 — T3가 text-only가 되면서 Haiku로 충분. 비용 절감 체감 큼

### Q33. 다중 업로드를 `Promise.all`로 처리할 때
- **오답**: `await Promise.all(files.map(uploadOne))`
- **정답**: **`runWithConcurrency(3)`** — 동시 3개 제한
- **근거**: 024 — rate limit + Supabase 왕복 race로 간헐 생략. concurrency와 재시도는 별개 장치

### Q34. T1 실패 시 자동 삭제 제안 시
- **오답**: "실패한 레퍼런스 자동 삭제"
- **정답**: **자동 삭제 금지** — 수동 재시도 🔄 + 삭제 선택권
- **근거**: 024 — 사용자가 업로드한 파일 임의 삭제는 신뢰 파괴. UX 원칙

### Q35. async 콜백에서 dispatch 먼저 하자고 할 때
- **오답**: `dispatch(addProject); await supabase.insert(...)`
- **정답**: **Supabase 왕복 후에만 dispatch** (await 먼저)
- **근거**: 024 — race 시 DB에 없는 프로젝트 ID로 detail 페이지 이동 → "없는 프로젝트" 에러

---

## 🔍 빠른 참조 — 상황별 즉답 표

| 상황 | 한 문장 답 | 근거 |
|---|---|---|
| 밝은 색 Primary | near-black | 003 |
| 완벽한 흰색 배경 | 은은한 틴트 | 003 |
| radius 전역 설정 | 컴포넌트 오버라이드만 | 004 |
| API 키 `VITE_` | 절대 금지, 서버측 프록시 | 011 |
| flat tags | 레이어별 중첩 + enum | 013 |
| keyVisual 유지 | 삭제 → visualDirection | 013 |
| Zustand 도입 | Context+useReducer | 015 |
| STORAGE_KEY 버전 없음 | v{N} suffix 필수 | 015 |
| Export에 MUI 식별자 | hex/CSS만 | 016 |
| seed 기본 fixtures | empty가 기본 | 017 |
| `references` 테이블 | reference_items | 018 |
| RLS public | owner-only | 018 |
| T3 이미지 재첨부 | text-only, extracted pool | 023 |
| Promise.all 업로드 | concurrency 3 | 024 |
| T1 실패 자동 삭제 | 수동 재시도 선택권 | 024 |

---

## 판단 원칙 (모든 Q에 공통)

1. **데이터 스키마 변경은 되돌리기 매우 어렵다** — 초기에 신중히 결정, 문서보다 코드 신뢰
2. **단일 진실 원천 원칙** — 토큰은 `default.js`, 데이터는 `schemas.js`, AI는 `aiTasks.js`
3. **이미지 API 호출은 항상 리사이즈 먼저** (비용)
4. **공통 컴포넌트 API 확장 전 호출측 어댑터** (영향 범위)
5. **자동 삭제/수정 금지, 사용자 선택권** (UX 신뢰)
6. **계획 → 실행 분리**, 큰 구조 변경은 승인 게이트 후
7. **기본값 = 프로덕션 동작**, 개발 편의는 opt-in
