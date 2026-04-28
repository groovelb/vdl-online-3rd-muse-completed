# Work Log

MUSE 프로젝트 실습 교육 자료. **바이브 코딩으로 동일한 프로젝트를 재현**할 수 있도록 구성.

---

## ⭐ 메인 교재 — 여기서 시작하기

**[curriculum/ — 5 Stage 재구성 커리큘럼](./curriculum/00-OVERVIEW.md)**

원본 로그(001~024)를 **학습 순서로 재배치**한 프레젠테이션용 커리큘럼. "나중에 한 작업이라도 같이 했으면 좋았을 것"은 해당 Stage로 당겨서, 재설계 이력을 숨기고 **최종 모습만 가르친다**.

| Stage | 주제 |
|---|---|
| [1](./curriculum/01-planning-and-design-system.md) | 기획 점검 + 디자인 시스템 세팅 |
| [2](./curriculum/02-ux-flow-and-components.md) | UX flow + 컴포넌트 만들기 |
| [3](./curriculum/03-data-assembly.md) | 더미 데이터로 조립하기 |
| [4](./curriculum/04-local-ai-simulation.md) | 로컬에서 AI 시뮬레이션 |
| [5](./curriculum/05-supabase-integration.md) | Supabase 연동 |

---

## 보조 자료 (필요 시 참조)

| 문서 | 용도 | 언제 보나 |
|---|---|---|
| [ANALYSIS.md](./ANALYSIS.md) | 24 로그 교차 분석 (Timeline / Spec / Schema Diff / Branching Hotspots) | 사후 해부 |
| [PHASE-CARDS.md](./PHASE-CARDS.md) | 10 Phase 작업 단위 카드 (진입조건 / 산출물 / 검증) | 강사 체크용 |
| [REPRODUCE-FAQ.md](./REPRODUCE-FAQ.md) | Q&A 35개 (AI가 다른 제안 시 즉답) | 탈선 감지 시 |

## 분기점 (Checkpoints)

여러 세션 누적 결과를 1장으로 압축한 마일스톤 마커. "지금 시스템이 어디까지 와 있는지" 빠르게 파악할 때 본다.

| # | 범위 | 제목 | 날짜 |
|---|---|---|---|
| 001 | 001~024 | [MUSE Foundation 완료 — 기획 / 컴포넌트 / AI / Supabase](./CHECKPOINT-001-MUSE-Foundation-완료.md) | 2026-04-27 |

## 원본 로그 (시간순 · 부록)

curriculum은 주제별 재배치라서, **실제 프로젝트 진행 순서**를 복기하려면 아래 로그를 본다.

<details>
<summary>원본 로그 24개 펼치기</summary>

| # | 제목 | 날짜 | 파일 |
|---|------|------|------|
| 001 | MUSE 프로젝트 기획 Phase 1 (project-summary) 작성 | 2026-04-22 | [001-MUSE-프로젝트-기획-Phase1.md](./001-MUSE-프로젝트-기획-Phase1.md) |
| 002 | MUSE 프로젝트 기획 Phase 2 (ux-flow) 작성 및 컴포넌트 역할별 재분류 | 2026-04-22 | [002-MUSE-프로젝트-기획-Phase2.md](./002-MUSE-프로젝트-기획-Phase2.md) |
| 003 | MUSE 프로젝트 기획 Phase 3 (visual-direction) 작성 및 승인 | 2026-04-22 | [003-MUSE-프로젝트-기획-Phase3.md](./003-MUSE-프로젝트-기획-Phase3.md) |
| 004 | MUSE 비주얼 디렉션 기반 디자인 토큰 적용 (theme + Storybook 스토리 동기화) | 2026-04-22 | [004-MUSE-디자인-토큰-적용.md](./004-MUSE-디자인-토큰-적용.md) |
| 005 | MUSE 컴포넌트 Phase 1~5 일괄 구현 (신규 12종 + ImageCard 확장) | 2026-04-22 | [005-MUSE-컴포넌트-Phase1-5-구현.md](./005-MUSE-컴포넌트-Phase1-5-구현.md) |
| 006 | MUSE 페이지 템플릿 조립 (ArchivePage + ProjectDetailPage) | 2026-04-22 | [006-MUSE-페이지-템플릿-조립.md](./006-MUSE-페이지-템플릿-조립.md) |
| 007 | MUSE IA 완성 — ProjectListPage + SettingsPage 추가 | 2026-04-22 | [007-MUSE-ProjectListPage-SettingsPage-추가.md](./007-MUSE-ProjectListPage-SettingsPage-추가.md) |
| 008 | MUSE 데이터 모델 정의 + 더미 데이터 중앙화 (src/data/muse/) + 스토리 연동 | 2026-04-22 | [008-MUSE-더미-데이터-중앙화.md](./008-MUSE-더미-데이터-중앙화.md) |
| 009 | MUSE 더미 이미지 28장 실제 연결 + 데이터 카탈로그 4종 스토리북 등록 | 2026-04-22 | [009-MUSE-실제-이미지-연결-및-데이터-카탈로그.md](./009-MUSE-실제-이미지-연결-및-데이터-카탈로그.md) |
| 010 | MUSE — reference1.jpg 삭제 및 ProjectListPage MoodboardCard 썸네일 렌더 버그 수정 | 2026-04-22 | [010-MUSE-reference1-삭제-및-MoodboardCard-썸네일-수정.md](./010-MUSE-reference1-삭제-및-MoodboardCard-썸네일-수정.md) |
| 011 | MUSE — AI 태스크 프롬프트 등록 + Anthropic 프록시 middleware + T1 Auto-Tag Playground | 2026-04-22 | [011-MUSE-AI-프록시-및-Playground-Phase-A.md](./011-MUSE-AI-프록시-및-Playground-Phase-A.md) |
| 012 | MUSE — 태그 프리셋 JSON 통합 + 5레이어 구조 재설계 계획 (visualDirection MD 출력) | 2026-04-22 | [012-MUSE-태그-프리셋-통합-재설계-계획.md](./012-MUSE-태그-프리셋-통합-재설계-계획.md) |
| 013 | MUSE — 프리셋 JSON 통합 + keyVisual 레이어 제거 + visualDirection(MD) 도입 (Phase 1~3 실행) | 2026-04-22 | [013-MUSE-프리셋-통합-keyVisual-제거-Phase1-3.md](./013-MUSE-프리셋-통합-keyVisual-제거-Phase1-3.md) |
| 014 | MUSE — AI Flow 완성 (T2 Recommend + T3 Analyze 2-tool Playground + TAG_VOCABULARY 잔존 버그 수정) | 2026-04-22 | [014-MUSE-AI-Flow-T2-T3-Playground-완성.md](./014-MUSE-AI-Flow-T2-T3-Playground-완성.md) |
| 015 | MUSE — 문서 동기화 + 상태 관리 레이어 + ArchivePage 업로드→T1 실연결 | 2026-04-22 | [015-MUSE-상태관리-레이어-및-ArchivePage-T1-연결.md](./015-MUSE-상태관리-레이어-및-ArchivePage-T1-연결.md) |
| 016 | MUSE — dev 라우터 + Wizard T2/T3 실연결 + ZIP 번들/범용 JSON Export 전환 | 2026-04-22 | [016-MUSE-dev-라우터-Wizard-실연결-ZIP-범용JSON-Export.md](./016-MUSE-dev-라우터-Wizard-실연결-ZIP-범용JSON-Export.md) |
| 017 | MUSE — Store seed 분기 (Dev는 empty, Storybook은 fixtures) | 2026-04-22 | [017-MUSE-Store-seed-분기-Dev-empty-Storybook-fixtures.md](./017-MUSE-Store-seed-분기-Dev-empty-Storybook-fixtures.md) |
| 018 | MUSE — 02-ux-flow 데이터 모델 동기화 + Supabase 백엔드 연동 계획·튜토리얼 작성 | 2026-04-23 | [018-MUSE-UX-Flow-데이터모델-동기화-및-Supabase-백엔드-계획.md](./018-MUSE-UX-Flow-데이터모델-동기화-및-Supabase-백엔드-계획.md) |
| 019 | MUSE — Supabase Phase 1~4 적용 + 회원가입/로그인 플로우 구축 | 2026-04-23 | [019-MUSE-Supabase-Phase1-4-적용-회원가입-로그인-구축.md](./019-MUSE-Supabase-Phase1-4-적용-회원가입-로그인-구축.md) |
| 020 | MUSE — Supabase 데이터훅 완성 + AuthProvider 싱글톤 + T3 비용 최적화 + 레퍼런스 삭제/다중업로드 UX | 2026-04-23 | [020-MUSE-Supabase-데이터훅-완성-T3-비용최적화-삭제-다중업로드.md](./020-MUSE-Supabase-데이터훅-완성-T3-비용최적화-삭제-다중업로드.md) |
| 021 | MUSE — Archive 필터 계층화 + hex 색상 스와치 필터 + 카드 dominantColors 노출 | 2026-04-23 | [021-MUSE-Archive-필터-계층화-및-hex-색상-스와치-필터.md](./021-MUSE-Archive-필터-계층화-및-hex-색상-스와치-필터.md) |
| 022 | MUSE — 디자인 QA 전수 이행 (elevation/hover/위치 효과 제거, Accordion 필터, 색상환 유사색, GNB 재구성, 앰비언트 배경) | 2026-04-23 | [022-MUSE-디자인-QA-전수-이행.md](./022-MUSE-디자인-QA-전수-이행.md) |
| 023 | MUSE — T1/T3 아키텍처 전환 (업로드 시 T3 레벨 값 추출 + 프로젝트 시 이미지 없이 compose, Haiku 통일, 비용 ~2.5x 절감) | 2026-04-23 | [023-MUSE-T1-T3-아키텍처-전환-업로드시-T3레벨-추출-프로젝트시-text-only-compose.md](./023-MUSE-T1-T3-아키텍처-전환-업로드시-T3레벨-추출-프로젝트시-text-only-compose.md) |
| 024 | MUSE — 다중 업로드 간헐 생략 + 프로젝트 생성 후 "없는 프로젝트" 에러 수정 + T1 태깅 재시도 정책 | 2026-04-23 | [024-MUSE-다중업로드-생략-및-프로젝트-못찾음-버그-수정-태깅-재시도-정책.md](./024-MUSE-다중업로드-생략-및-프로젝트-못찾음-버그-수정-태깅-재시도-정책.md) |
| 025 | MUSE — Phase 2 시작. 색상필터 hex casing fix + "모두 보기" + 레퍼런스 디테일 모달 + AI Tasks 스토리북 4-섹션 재구조화 (코드 검증 정정 포함) | 2026-04-27 | [025-MUSE-Phase2-시작-색상필터-개선-디테일모달-AITasks-스토리북-재구조화.md](./025-MUSE-Phase2-시작-색상필터-개선-디테일모달-AITasks-스토리북-재구조화.md) |
| 026 | MUSE — ProjectDetailPage에 사용된 레퍼런스 썸네일 strip + Dark Reader 확장 차단 (Vite + Storybook) | 2026-04-27 | [026-MUSE-ProjectDetailPage-사용레퍼런스-썸네일-DarkReader-차단.md](./026-MUSE-ProjectDetailPage-사용레퍼런스-썸네일-DarkReader-차단.md) |
| 027 | MUSE — AI 디자인 도구 페인포인트 정성리서치 3라운드 + UX 최소개입 로드맵 (TP1~TP6) 확정 | 2026-04-28 | [027-MUSE-페인포인트-정성리서치-3라운드-UX-최소개입-로드맵.md](./027-MUSE-페인포인트-정성리서치-3라운드-UX-최소개입-로드맵.md) |
| 028 | MUSE — TP1~TP6 UX 개입 + 시스템 프롬프트 + 데이터 모델 + 스토리북 일괄 구현 (단일 세션) | 2026-04-28 | [028-MUSE-TP1-TP6-UX-개입-일괄-구현.md](./028-MUSE-TP1-TP6-UX-개입-일괄-구현.md) |
| 029 | MUSE — TP1 (레퍼런스 업로드 의도 chip) 폐기 + 관련 코드·문서 일괄 정리 + CLAUDE.md Reporting Rules 신규 | 2026-04-28 | [029-MUSE-TP1-폐기-및-관련-코드-문서-정리.md](./029-MUSE-TP1-폐기-및-관련-코드-문서-정리.md) |
| 030 | MUSE — Step 3 활용 노트 + Progressive Narrowing + TP5 폐기 + TP6 4-layer 통합 | 2026-04-28 | [030-MUSE-Step3-활용노트-Progressive-Narrowing-구현.md](./030-MUSE-Step3-활용노트-Progressive-Narrowing-구현.md) |
| 031 | MUSE — 모드별 산출물 분리: concept(웹프롬프트 800자) + handoff(프레임워크 번들 + 5 layer 한글 상세) 신설 | 2026-04-28 | [031-MUSE-mode별-산출물-분리-concept-handoff-리팩토링.md](./031-MUSE-mode별-산출물-분리-concept-handoff-리팩토링.md) |
| 032 | MUSE — 레퍼런스별 활용 노트 + AI Paste Block + 외부 플랫폼 중립 Export 통합 | 2026-04-28 | [032-MUSE-레퍼런스별-노트-AI-paste-block-export-통합.md](./032-MUSE-레퍼런스별-노트-AI-paste-block-export-통합.md) |
| 033 | MUSE — concept prompt 실측 검증 → 원복 + 직접 LLM 호출 스크립트 도입 | 2026-04-28 | [033-MUSE-concept-prompt-실측검증-원복-LLM-스크립트-도입.md](./033-MUSE-concept-prompt-실측검증-원복-LLM-스크립트-도입.md) |

</details>
