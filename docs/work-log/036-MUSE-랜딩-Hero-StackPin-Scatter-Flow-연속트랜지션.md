---
session: 036
date: 2026-04-30
title: MUSE 랜딩 Hero Stack-Pin + Scatter↔Flow 연속 트랜지션 + GNB ghost 모드
---

# 036. MUSE 랜딩 Hero Stack-Pin + Scatter↔Flow 연속 트랜지션 + GNB ghost 모드

## 🎯 의도 (User Goal)

> 비로그인 랜딩(`/auth`) 페이지를, "히어로 배경이 화면에 고정된 채 스크롤 진행도에 따라 두 모드(scatter ↔ 두 줄 horizontal flow)로 연속 전환"되고, 컨텐츠(로고/타이틀/CTA → 메인 질문)는 자연 스크롤로 위 → 아래 흐르는 stack-pin 인터랙티브 hero 로 재설계. 동시에 다른 라우트와 동일한 GNB 패턴(ghost 모드 신설) + 스토리북 등록.

## 🔑 주요 의사결정

- **GNB ghost 모드 신설**: hero 위에 떠있을 GNB 가 `isTransparent + hasBorder=false` 의 합성보다 의도가 명확하도록 `isGhost` 단일 prop 으로 통합 (배경 / 보더 / blur 모두 제거). AppShell 도 `isHeaderGhost` 로 통과
- **Hero 레이아웃 = Stack-Pin (sticky stage)**: wrapper `200vh`, 안의 sticky bg `100vh`. content overlay `200vh` 가 자연 스크롤. opacity fade 폐기 (사용자 명시 거절 — "fade in/out 하라고 한 적 없는데"). 컨텐츠는 그냥 위 → 아래 흐름
- **Scatter ↔ Flow 단일 컴포넌트 일체화**: `BlurredMarqueeBackdrop` 폐기, `ScatterGallery` 에 `progressRef` prop 신설. 단일 RAF 안에서 두 모드를 매 프레임 lerp → 끊김 없는 연속 전환. 두 컴포넌트 cross-fade 안 함
- **블러 전부 제거**: hover backdrop blur, marquee blur, 모바일 grid blur, scroll indicator backdrop-filter 까지 사용자 지시로 일체 삭제
- **Off-screen wrap 보장 — duplicate 폐기 → sparse spacing**: 19 이미지 1:1 placement, 4 줄 round-robin 분배. 줄 안 균등 gap 으로 `laneSpan ≥ W + 2 × tileMax` 확보. wrap (시간 mod span) 은 항상 화면 밖에서 발생
- **모바일 fallback (md 미만)**: pin 비활성, 두 모드를 단순 stack 으로 렌더 (성능/터치 안전)
- **GEN landing 카피 정리**: hero 가 메인 질문(`PROBLEM.title`) 흡수 → `LandingProblem` 섹션 폐기. `PROBLEM.eyebrow / lede / items` 4 카드도 함께 폐기. `HERO.cta = '시작하기'` 추가

## 💬 Claude의 핵심 반응

- **`<GNB>` 직접 마운트 → `<AppShell>` 패턴으로 교체**: 다른 라우트(AppShellLayout) 가 이미 AppShell 을 쓰고 있어서, 동일한 패턴으로 통일 (사용자: "다른 라우터에서 사용한 gnb랑 동일하게 해")
- **`useScrollProgress` 훅 신설**: wrapper 의 진행도(0~1) 를 `--p` CSS variable 과 `progressRef.current` 양쪽에 기록. IntersectionObserver gate 로 viewport 밖 cost 0. RAF 단일화
- **첫 번째 시도(duplicate 채우기) 폐기**: lane 을 채우려 같은 이미지를 여러 placement 로 복제했는데, 사용자 거절 "복사할 필요없이 있는 그대로 배치하면 될거같은데 왜케 아메바를 만들어놨어". → 19 placements 1:1, gap 만 늘려서 laneSpan 확보
- **fade-in/out 시도(첫 시도) 거절**: "컨텐츠들을 스크롤이 되야지 저런식으로 fadeinout 하라고 한적 없는데" → opacity formula 전부 제거, content overlay 가 자연 스크롤 하도록 구조 재배치
- **단일 ScatterGallery 로 진화**: 별도 `BlurredMarqueeBackdrop` 컴포넌트는 한 번 만들었다가 폐기. 한 컴포넌트 안에서 scatter↔flow 보간이 더 자연스럽고 cross-fade 빈 구간이 생기지 않음

## 📂 변경된 파일

| 파일 | 종류 | 요약 |
|------|------|------|
| `src/components/navigation/GNB.jsx` | 수정 | `isGhost` prop 신설 (배경 / 보더 / blur 일괄 제거) |
| `src/components/navigation/GNB.stories.jsx` | 수정 | `Ghost` 스토리 + props 표 row 추가 |
| `src/components/layout/AppShell.jsx` | 수정 | `isHeaderGhost` prop 통과 |
| `src/hooks/useScrollProgress.js` | 추가 | wrapper 진행도(0~1) → `--p` CSS var + ref |
| `src/components/media/ScatterGallery.jsx` | 수정 | `progressRef` prop, 4 줄 flow 모드, scatter↔flow 단일 RAF lerp, hover blur backdrop 삭제 |
| `src/components/media/index.js` | 수정 | `BlurredMarqueeBackdrop` export 제거 |
| `src/components/media/BlurredMarqueeBackdrop.jsx` | 삭제 | ScatterGallery 가 흡수 |
| `src/pages/auth/AuthHeroBackdrop.jsx` | 수정 | wrapper 200vh + sticky bg + content overlay 자연 스크롤 |
| `src/pages/auth/AuthPage.jsx` | 수정 | `<AppShell isHeaderGhost>` + GNB 우측 signin/signup 버튼, `LandingProblem` import 제거 |
| `src/pages/auth/landingCopy.js` | 수정 | `LANDING_GNB`, `HERO.cta` 추가, `PROBLEM` 4 카드 폐기 (title 만 유지) |
| `src/pages/auth/sections/LandingProblem.jsx` | 삭제 | hero 가 흡수 |
| `src/stories/page/LandingPage.stories.jsx` | 추가 | `Page/Landing` 스토리 (MemoryRouter + AuthProvider 데코레이터) |

## 🧩 컴포넌트 작업

- **신규 hook**: `useScrollProgress(targetRef)` (`src/hooks/`) — wrapper 의 viewport 진행도를 `--p` CSS var + 반환된 ref `.current` 양쪽에 기록
- **수정**: `GNB` (`isGhost` prop), `AppShell` (`isHeaderGhost` prop 통과), `ScatterGallery` (4 줄 flow 모드 + progressRef 보간)
- **폐기**: `BlurredMarqueeBackdrop`, `LandingProblem`
- **재사용**: `AppShell`, `ScatterGallery`, `Button`, `Typography`, `Box`, `IconButton`, `KeyboardArrowDownIcon`

## ✅ 최종 결과

랜딩 `/auth` — GNB ghost + Stack-pin hero (sticky bg + 자연 스크롤 컨텐츠) + 끊김 없는 scatter↔4 줄 flow 연속 lerp 가 단일 RAF 안에서 동작. 검증: `pnpm build`, `pnpm build-storybook` 통과. Storybook `Page/Landing` 에서 production AuthPage 그대로 마운트.

## 🔁 재현 가이드 (교육생용)

1. **GNB ghost 모드 추가** — Claude 에게 "GNB 에 배경 / 보더 / blur 다 빼는 ghost 모드 추가해줘". `isGhost` prop 신설 + AppShell `isHeaderGhost` 통과. 랜딩 GNB 는 `<AppShell isHeaderGhost ...>` 패턴으로 다른 라우트(`AppShellLayout`) 와 동일하게 맞춤
2. **`useScrollProgress` 훅** — `src/hooks/useScrollProgress.js` 에 작성. wrapper 의 `getBoundingClientRect()` 로 `(rect.height - viewport) / scrolled` 진행도 산출. `el.style.setProperty('--p', p)` + `progressRef.current = p` 양쪽에 기록. IntersectionObserver gate 로 viewport 밖이면 scroll listener detach
3. **Hero 구조 = wrapper 200vh + sticky stage 100vh + content overlay 200vh**
   ```jsx
   <Wrapper ref={wrapperRef} sx={{ position:'relative', height:'200vh' }}>
     <StickyStage sx={{ position:'sticky', top:0, height:'100vh' }}>
       <ScatterGallery progressRef={progressRef} flowRows={4} ... />
     </StickyStage>
     <ContentOverlay sx={{ position:'absolute', top:0, height:'200vh' }}>
       [100vh] 로고/타이틀/CTA
       [100vh] 메인 질문
     </ContentOverlay>
   </Wrapper>
   ```
   사용자가 거절하는 패턴 → opacity fade. content 는 그냥 자연 스크롤로 위 → 아래 흐르도록
4. **ScatterGallery 에 scatter↔flow 통합** — `placements` 산출 시 각 이미지에 (scatterX, scatterY, size) + (row = i%flowRows, flowLaneStart, flowLaneSpan) 동시 보유. RAF 안에서 `transform = translate3d((flowX - scatterX) * p, (flowY - scatterY) * p, 0)`. duplicate 만들지 말 것 — 줄 안 균등 gap 으로 `laneSpan = max(W + 2×tileMax, sumSizes + N × flowGap)` 확보하면 wrap 자동으로 화면 밖
5. **블러 전부 제거** — hover backdrop, scroll indicator, marquee 등 모든 `filter: blur` / `backdropFilter: blur` 삭제. 사용자가 명시적으로 거절한 효과
6. **모바일은 pin 비활성** — `useMediaQuery(theme.breakpoints.down('md'))` 분기. `MobileHero` 가 두 모드를 단순 stack 으로 렌더
7. **landingCopy 정리** — `PROBLEM.items` 4 카드 폐기, `PROBLEM.title` 만 유지. `HERO.cta = '시작하기'` 추가. `LandingProblem.jsx` 파일 삭제
8. **Storybook 등록** — `src/stories/page/LandingPage.stories.jsx`. `MemoryRouter(initialEntries=['/auth'])` + `AuthProvider` 데코레이터 (AuthDialog 의 useNavigate / useSignIn / useSignUp 컨텍스트 충족)

> 💡 핵심 포인트: **stack-pin 은 "wrapper 길게 + sticky 짧게 + 자연 스크롤 컨텐츠"** 의 조합으로 라이브러리 없이 만들 수 있다. progress 신호는 `--p` CSS var 로 빼두면 컨텐츠는 CSS 만으로, 무거운 transform 은 RAF 단일 루프로 처리해서 main thread 부담 0. duplicate 로 lane 을 채우는 것보다 sparse spacing 으로 laneSpan 을 확장하는 게 시각적으로 깔끔하다.
