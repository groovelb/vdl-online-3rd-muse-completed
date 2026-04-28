# AI Design Tools — Pain Points Research (2026-04 raw)

> 수집일: 2026-04-27 (라운드 1 + 라운드 2)
> 출처: 영문 28건 + 한국어 13건 (총 41건). Reddit/Twitter/디스콰이엇 제외 (로그인·user-agent 차단).
> 목적: MUSE의 차별 메시지("디자인 시스템을 쉽게 구성 + 결정 책임지는 도구") 검증을 위한 1차 데이터.

---

## 🥇 결정타 인용 (랜딩 카피 직접 활용 가능)

### 1. 김은수 (IBM Research UX 엔지니어) — ZDNet Korea, 2026-04-26
> **"DESIGN.md는 '주요 버튼은 테라코타 색'이라고 기록하지만, 왜 테라코타를 골랐는지는 담지 않는다. 결과는 있지만 이유가 빠져 있는 구조."**

> "AI에게 '초보자용으로 변경해달라'고 요청했을 때, 화면 구성만 단순하게 변경되기를 원했으나 버튼 색상, 레이아웃, 톤앤매너까지 연쇄적으로 달라지는 경우가 많다."

> 해결책 제안: **"읽을 수 있고, 제어 가능하며, 검증 가능한 추론 체인"**

→ MUSE 미션 선언과 거의 동일. 직접 인용 가능 (한국 IBM 연구자 + ZDNet 신뢰도).

### 2. Figma 2026 디자이너 보고서
> "AI 생성 UI의 품질에 만족하는 디자이너는 **15%에 불과**, 대부분의 경우 상당한 수준의 수작업 수정 수반"

→ 시장 크기 + 미충족 수요의 직접 통계.

### 3. Levi Myers (Bitovi) — 2026-04
> **"Stitch isn't useful for designers at this time."**
> "Everything looks… the same."

→ 가장 단호한 사형선고.

### 4. PCWorld (via 다수 한국 매체)
> "클로드 프로($20/월)로 30분 써봤더니 일주일 사용 한도의 80%가 사라졌다"

→ 비용 페인포인트의 가장 인용도 높은 사례.

### 5. Dennis Ocasio
> "Claude Design은 hungry. The whole point of a tool like this is to encourage exploration… **But if every exploration costs tokens, you start playing it safe.**"

→ 도구 철학 자체의 모순 지적.

---

## 🥇 결정타 인용 (라운드 2 추가)

### 6. designmd.app/en/what-is-design-md (자체 페이지가 인정한 한계)
> "**Multi-Reference Composition**: Tokens reference single paths, **cannot express conditional composites**"
> "**MUI/Chakra Parity: No documented export paths to Material Design or Chakra design tokens** — only Tailwind and DTCG"
> "Localization: No mechanism for language-specific typography, RTL/LTR directional tokens, or regional color semantics"
> "Component State Matrices: Missing disabled states, loading states, error hierarchies, focus indicators, or accessibility-specific overrides"

→ **DESIGN.md 표준 자체가 명시적으로 비어있다고 인정**한 4개 영역 = MUSE 직격 점유 가능 자리.

### 7. SeedFlip 비교 글 (2026)
> "tweakcn ... **Typography is untouched. Shadows are whatever shadcn ships with. Radius is the default.**"
> "color-picker generators touch these dimensions [only]"
> **"A generator that doesn't output [typography, shape, atmosphere] is generating a partial theme and calling it complete."**

### 8. Royarindam Medium (2026-04)
> "The AI isn't trying to mess with you; it just doesn't have a Source of Truth. **It's guessing your 'vibe.'**"
> "design.md should be treated as a **prompt-conditioner, not a contract**"
> "Even when Stitch ignored specifics, having the design.md in the prompt produced cleaner output"

### 9. Toss tech (한국, "AI 시대 디자이너를 없앴더니")
> "디자이너의 미래는 직접 디자인하는 것이 아니라 **'AI가 더 뛰어난 결과물을 만들 수 있도록 원칙과 시스템을 설계하는 것'**"

→ MUSE 사용자 페르소나(시스템 설계자) 직접 정의.

### 10. Sketch2React Medium (Material UI)
> "We're only changing the naming and layer hierarchy. **Nothing changes visually in your design document!**" — 즉 자동화 안 됨, 수동 재구조화 필요

### 11. design-tokens.dev (Material UI 가이드)
> "Manual TypeScript augmentation required" / "manually map design tokens to MUI's CSS variables" / "Shadow tokens require either sector mapping through 25 array entries or custom field setup—both tedious approaches"

→ **MUI 영역 = AI 자동화 도구 부재 블루오션** 직접 입증.

### 12. DesignWhine
> "DESIGN.md tightly coupled to **Stitch's ecosystem rather than a formal open standard**"
> "Stitch still lacks—or only partially implements—many of the team-oriented features that make Figma central"

### 13. Xinran Ma Medium (Stitch upgrade walkthrough)
> "It looks like I hit a temporary technical limit while trying to create that custom design system from the site"
> "the imagination can be very 'imaginative'" — 통제 부족

### 14. shadcn-ui Discussion #7292
> "this one is outdated the colors are broken on the latest shadcn components" — 도구 유지보수 부담 일반화

---

## 🥇 결정타 인용 (라운드 3 추가)

### 15. UXPin "Why AI Design Tools That Ignore Your Design System" (★★★★★)
> "Most AI design tools generate to their own conventions because they **lack a direct connection to component libraries** — either generating pixels, their own code, or approximating visual patterns. **None of these approaches use actual production components.**"

> "AI coding tools don't check design tokens; they **approximate**, writing code like 'padding: 12px' based on **training data rather than looking up actual design system tokens**."

> "Developers face two options: **rebuild everything using real components** (negating the AI's speed advantage), **or ship the approximation and deal with inconsistency in production.**"

→ MUSE의 schema-strict tool + 토큰 직접 export로 직격하는 영역. UXPin은 DESIGN.md 시장 메타 비판자.

### 16. velog/@hanui "shadcn/ui 한국 프로젝트에서 제대로 쓰는 법" (★★★★ KR 신규)
> **"KRDS(한국형 웹 디자인 시스템)** 따라야 하고, 색상, 간격, 타이포그래피 전부 가이드가 있으며, shadcn/ui 컴포넌트 하나하나 수정해야 하는데, **솔직히 이거 하다 보면 처음부터 만드는 게 나을 수도 있다**"

> "디자인 토큰의 변수 키 값이 통일되지 않아, Button에서 size의 키 값은 s,m,l이라면 Tooltip에서 size는 sm,md,lg **이런 식으로 키 값이 변하는 문제**"

→ **한국 시장 페인포인트 직접 발화**: 정부 공식 KRDS와 글로벌 도구의 갭. 한국어 시장 차별점 발견 (가설 D 보강).

### 17. velog/@rainlee "디자인 시스템 구축기" (★★★★ KR)
> "**완전 자동화된 파이프라인은 때로는 온전한 품질을 기대하기 어려울 때가 있습니다**"

> "토큰이 빌드되어 게시되기 전 수동검토가 필요한 경우 최신 디자인 토큰이 포함된 업데이트 버전을 임시환경에 배포하여 테스트해보는 것도 좋은 방법"

→ MUSE의 "AI 자동 + 사용자 검토 가능" 워크플로우 직격 정당화.

### 18. Emilia BiblioKit "3 Design System Bugs That Survive Every Code Review" (★★★★)
> "AI Makes Them [design system bugs] Worse" — 헤드라인 자체

→ 디자인 시스템 일관성 검증의 부재가 AI 도구로 악화된다는 메타 발화.

### 19. Inhaq "Figma to Code: Design Tokens 2026" (★★★)
> "Teams have historically lost **hundreds of hours manually translating** hex codes and padding values from Figma into CSS"
> "designer handed a file with spacing values of 25pt, but the codebase used an **8pt spatial system**, leading the developer to assume it was intentional and update the codebase"

→ MUSE가 토큰 직접 export로 회피 가능. 디자이너-개발자 번역 시간 비용의 정량적 발화.

### 20. Figma Config 2025 발표 (라운드 3 시장 동향)
> Figma가 "AI-generated design tokens that write to production repositories" + "native Git integration" + "live code sync" 발표
→ **Figma 자체가 카테고리 진입 시도**. 6개월 후 경쟁 격화 신호. MUSE의 Figma 비의존 차별점이 약화 가능.

### 21. velog/@blue03183 "Claude Code 갑작스런 5일 제한" (★★★ KR)
> Claude Code의 사용 한도 문제가 한국 사용자에게도 동일하게 발생 — 비용 페인포인트 한국 시장 검증.

### 22. tweakcn discussions (라운드 3 신규)
사용자 요청 미충족:
- "Generate components using AI"
- "Image input for AI"
- "Design system linting"
- "Contrast accessibility reporting"

→ shadcn 도구 사용자도 AI + 이미지 입력 + 검증을 원함 = MUSE 직격 수요.

### 23. Acadia "Why AI Systems Describe Your Brand Inconsistently" (★★★)
- AI가 브랜드를 묘사할 때 일관성 없는 출력
- 검색 엔진(GEO)에서도 같은 문제

→ 결정 근거 추적 필요성을 검색 SEO/AI Search 영역까지 확장한 발화.

### 24. MarTech "Why AI-driven creative is failing" (★★★)
- "AI speeds up execution, but human judgment is still required to avoid generic results"
- "AI-generated interfaces lack soul and produce cookie-cutter output"

→ 시장 메타 진단. MUSE의 "사람이 결정하고 AI는 합성한다" 메시지 정당화.

---

## 가설별 정리

### A. 산출물 피상적 (★★★★★ — 매우 강함)

- **Banani**: "Design.md addresses only visual consistency... doesn't claim to address functional design, UX logic, or interaction patterns"
- **awesome-design-md README**: "Fix wrong colors, missing tokens, **weak descriptions**" (자체 인정)
- **TDP designproject.io**: "Stitch created an entirely new design system on the fly **rather than using the one I provided**" (DESIGN.md 무시)
- **Bitovi**: "many designs struggled to meet even the most basic accessibility requirements, such as a color contrast and touch target sizes"
- **TDP**: "enforcing brand rules through prompting alone is a losing game"
- **wikidocs 박재홍**: "AI가 '해석'하는 것이기 때문에 매번 미묘하게 다른 결과를 낼 수 있다" — border-radius 8px/12px 비결정성
- **Pillitteri**: "Stitch does not read your specific components, only color themes and fonts at a surface level"
- **Stitch review**: "outputs often default to a limited set of layout structures, meaning many designs end up looking alike"
- **Frontend Design skill (Vercel)**: AI default = "Inter font, purple gradient, card layout, safe neutrals"

### B. 결정 근거 추적 불가 (★★★★★ — 김은수 인용으로 강해짐)

- **김은수 ZDNet**: "결과는 있지만 **이유가 빠져 있는 구조**"
- **김은수 ZDNet**: "디자이너는 컨트롤을 포기하고 처음부터 다시 시작하거나, 반대로 AI를 아예 쓰지 않는"
- **Malewicz Medium**: "Is it skilled designer level output though? **No.**"
- **brunch @sungdairi**: "AI가 생성한 결과물이 시각적으로는 그럴싸해 보이지만, 실제 사용성을 고려한 세밀한 설계나 독창성은 부족"
- **TDP**: "Color: Generated greens instead of respecting the provided design system tokens, with **no way to click into the swatch and edit it**"
- **Bitovi Levi Myers**: "Brand direction and art style requests were largely ignored"

### C. AI 코딩 도구 호환 (★★★ — 양면성)

긍정:
- Pillitteri: "Claude Design's tight workflow with Claude Code"

부정:
- **Banani**: "users must explicitly tell [the agent] to reference the file" — DESIGN.md는 그냥 두면 무시됨
- **TDP**: "Getting Stitch output into a real codebase is genuinely hard"
- **TDP**: "complexity-Based Ambiguity" + "no way to buy credits"
- **Magic Patterns**: "Claude Design gives you clickable screens **without backend functionality**"
- Create With: "HTML-first workflow lacks deep component system integration"

### D. 한국어/비영어권 (★★★★ — KRDS 발화로 강해짐)

- **velog/@hanui (라운드 3 결정타)**: "**KRDS** 따라야 하고... 솔직히 이거 하다 보면 처음부터 만드는 게 나을 수도 있다" — 한국 정부 공식 KRDS 디자인 시스템과 글로벌 도구의 갭
- **designmd.app 자체 사양**: "Localization: **No mechanism for language-specific typography**, RTL/LTR directional tokens, or regional color semantics" ← 표준 자체가 인정
- 한국 매체 13건이 모두 영어 어휘 그대로 사용 ("DESIGN.md", "primary", "elevation")
- **velog 일반**: 토큰 키 값 통일 안 됨 (Button=s/m/l vs Tooltip=sm/md/lg) — 한국 프로젝트 수동 작업 부담

### E. 다중 레퍼런스 부재 (★★★★★ — designmd.app 자체 인정으로 결정타)

- **designmd.app 자체 사양**: "Multi-Reference Composition: Tokens reference single paths, **cannot express conditional composites**" ← 표준 자체가 인정
- **getdesign.md**: 60+ 브랜드 중 1개 *선택*만 가능
- **Magic Patterns**: 모든 alternatives가 단일 입력 가정
- **Bitovi**: "uninspired layouts that misapply common patterns" — 다중 레퍼런스 합성 부재가 원인
- **karozieminski**: "Claude Design은 단발 생성, sustained design work는 못함"
- **무드보드 도구 시장 (Inspo AI, Adobe Firefly, Miro, Venngage, Kosmik)**: 무드보드 합성은 됨, 디자인 토큰/DESIGN.md/MUI export 까진 안 감 → **MUSE 진입 위치 확정**

### F. Figma 의존/비의존 (★★★)

- **Stitch review**: "Experimental mode does not support Figma export"
- **moda.app**: "For detailed refinement, you need to export to Figma and work there"
- **karozieminski**: "no real-time co-editing (unlike Figma)"
- **brunch @sungdairi**: "여러 명이 동시에 편집하는 기능이 없습니다"
- **Magic Patterns**: "Figma Make addresses existing design tool integration" — Figma 의존이 차별점이 됨

### G. 비용·속도 (★★★★★ — 가장 일관된 발화)

- **Pillitteri**: "Two prompts for a 12-slide presentation and you are out"
- **Ocasio**: "Claude Design is **hungry**"
- **Karo Zieminski**: "burned through Pro weekly allowance in **under 30 minutes**"
- **Create With**: "Pro users hit weekly caps within hours of heavy use"
- **PCWorld via 다수 KR 매체**: "30분 = 일주일 한도 80%"
- **Banani Stitch**: "Stitch does not clearly show how many credits a prompt will use before generation"
- **Banani Stitch**: "no way to buy credits in Google Stitch AI"
- **karozieminski**: "10-30 second delay is enough for my brain to drift"

### H. (신규) 협업 부재 (★★★)

- **karozieminski**: "no real-time co-editing", "absent public share links", "no voice input", "no infinite canvas"
- **brunch @sungdairi**: "한 화면에 팀원 커서가 여럿 떠서 같이 수정하는 그림은 클로드 디자인에서는 안 됩니다"
- **risemoment.ai**: "현재 협업 기능은 기본 수준이며 아직 완전한 멀티플레이어가 아니에요"
- **Ocasio**: "team collaboration capabilities are described as 'thin'"

### I. (신규) 디자이너의 craft 대체 불가 (★★★★)

- **Fanny Medium**: "Some of the best design decisions I've made came from **friction** — from spending a week in a single Figma file, moving things two pixels, **arguing with myself**"
- **Fanny**: "Pipelines optimize for throughput, and **design isn't always a throughput problem**"
- **Fanny**: "starting from a terminal with vague creative direction is **like trying to describe a painting over the phone**"
- **Malewicz**: "Is it skilled designer level output though? No."
- **이랜서**: "요청이 추상적이면 결과물도 원하는 방향에서 벗어나기 쉽습니다"
- **Stitch review**: "using Stitch independently of a designer's input or expertise will almost certainly result in a product riddled with usability issues"

### J. (신규) 도구 안정성/UX 미성숙 (★★)

- **risemoment.ai**: "편집 경험도 아직 거친 부분이 있어요... 앱이 다소 느리고 RAM을 많이 사용하는 체감"
- **karozieminski**: "Cannot generate photorealistic images directly", "No backend/database functionality"
- **Stitch**: "68 replies on 'Sorry, Stitch is unavailable' threads with over 10,000 views" (Google AI Developers Forum)
- **tweakcn 12 open issues**: color accuracy bugs, no internationalization, OKLCH 처리 버그
- **PlatinumFundraising**: "Screenshot format writes URL text to file instead of downloading image binary" (firecrawl-cli #82)

---

## MUSE 차별 메시지 카피 후보 (검증된 인용 기반)

### 메인 헤드라인 (3개 후보)
1. **"AI가 디자인했지만 왜 그랬는지 모르는 시대를 끝낸다"** ← 김은수 ZDNet 인용 직결
2. **"DESIGN.md는 결과만 줍니다. MUSE는 이유까지 추적합니다."** ← awesome-design-md "weak descriptions" + 김은수
3. **"60+ 브랜드 따라하지 마세요. 5장 무드보드에서 당신만의 디자인을 합성하세요."** ← getdesign.md 자체 한계

### 서브 메시지 (페인포인트 직격)
- **"30분에 한도 80% 사라지는 도구가 아닙니다."** (PCWorld 인용)
- **"AI가 매번 다른 답을 주는 도구가 아닙니다."** (border-radius 8px/12px 인용)
- **"AI가 정한 primary 색의 출처를 클릭 한 번으로 확인합니다."** (TDP "no way to click into swatch")
- **"디자인 시스템을 'Stripe처럼'이 아닌 '당신처럼' 만듭니다."** (60+ 브랜드 라이브러리 한계)

### 사회적 증거 인용
- "AI 생성 UI에 만족하는 디자이너 15% — 나머지 85%를 위한 도구" (Figma 2026)
- IBM Research UX 엔지니어 "결과는 있지만 이유가 빠져 있는 구조" — 직접 인용 + 출처 ZDNet 노출

---

## 출처 인덱스 (27건)

### 영문 (18건)
1. https://pasqualepillitteri.it/en/news/1027/claude-design-vs-google-stitch-figma-stock-crash
2. https://engincanveske.substack.com/p/i-tried-both-claude-design-and-google
3. https://michalmalewicz.medium.com/will-claude-design-replace-designers-f92623f3befe
4. https://www.magicpatterns.com/blog/claude-design-alternatives
5. https://www.createwith.com/blog/we-tested-claude-design-vs-figma-make-google-stitch-and-claude-code
6. https://aimarketingforstorytellers.substack.com/p/googles-stitch-vs-claude-design-throwdown
7. https://aitoolsclub.com/claude-design-vs-google-stitch-which-ai-designs-better-website-prototypes/
8. https://blog.logrocket.com/ux-design/i-tried-google-stitch-heres-what-i-loved-hated/
9. https://www.bitovi.com/blog/google-stitch-a-product-designers-review
10. https://designproject.io/blog/google-stitch-review/
11. https://moda.app/blog/google-stitch-review
12. https://karozieminski.substack.com/p/claude-design-review-prompts-figma
13. https://ocasioconsulting.com/claude-design-review/
14. https://medium.com/design-bootcamp/what-claude-design-actually-changes-for-designers-0c5b04fae343
15. https://medium.com/design-bootcamp/claude-design-is-here-full-breakdown-a32767258fb9
16. https://www.banani.co/blog/google-stitch-pricing-and-credits
17. https://www.banani.co/blog/design-md-guide
18. https://github.com/VoltAgent/awesome-design-md
19. https://github.com/jnsahaj/tweakcn/issues
20. https://www.firecrawl.dev/blog/best-claude-code-skills

### 영문 라운드 2 추가 (10건)
21. https://designmd.app/en/what-is-design-md (★★★★★)
22. https://medium.com/@royarindam2402/the-end-of-ui-hallucinations-a-guide-to-google-stitch-design-md-for-devs-e874ddc7eb59
23. https://www.designwhine.com/what-the-hell-is-google-stitchs-design-md/
24. https://medium.com/design-bootcamp/my-hands-on-walkthrough-of-google-stitch-s-biggest-upgrades-yet-b8cb921ccee8
25. https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/
26. https://www.seedflip.co/blog/best-shadcn-theme-generators-2026 (★★★★)
27. https://medium.com/sketch2react/how-to-combine-design-tokens-with-material-ui-30a982c17c22
28. https://www.design-tokens.dev/guides/mui/ (★★★★)
29. https://github.com/shadcn-ui/ui/discussions/7292
30. https://www.firecrawl.dev/blog/best-mcp-servers-for-developers
31. https://mindwiredai.com/2026/04/23/design-md-is-now-open-source-googles-new-file-format-that-makes-ai-build-your-brand-correctly/

### 한국어 (13건)
1. https://zdnet.co.kr/view/?no=20260426093121 (★★★★★ 최우선)
2. https://brunch.co.kr/@sungdairi/86
3. https://blog.risemoment.ai/claude-design-complete-guide/
4. https://allmyuniverse.com/claude-design-prototype-guide-without-designer/
5. https://daleseo.com/claude-design/
6. https://wikidocs.net/blog/@jaehong/10792/
7. https://blog.secondbrush.co.kr/dailyprompt-731/
8. https://www.elancer.co.kr/blog/detail/1075
9. https://ditoday.com/피그마-대체할까-앤트로픽-클로드-디자인-출시/
10. https://www.gpters.org/news/post/complete-summary-how-use-FT0hAJo0eifVMAj
11. https://brunch.co.kr/@ghidesigner/459 (긍정 일색, 인용 없음)

### 한국어 라운드 2 추가 (4건)
12. https://toss.tech/article/removing_designers_in_ai_era (★★★★ 페르소나 정의)
13. https://brunch.co.kr/@morningwalk/1225
14. https://blog.google/innovation-and-ai/models-and-research/google-labs/stitch-design-md/ (영문이지만 한국 reference)

### ProductHunt 댓글 (1건)
- https://www.producthunt.com/products/figma-for-ai-agents — Piotr Pasierbek "curious how detailed you can get with component behavior - like does it understand hover states and micro-interactions"

---

### K. (신규) MUI 특화 자동화 부재 (★★★★ — 라운드 2)

- **designmd.app**: "**MUI/Chakra Parity: No documented export paths** to Material Design or Chakra design tokens"
- **design-tokens.dev MUI 가이드**: "Manual TypeScript augmentation required" / "manually map design tokens to MUI's CSS variables" / "Shadow tokens require sector mapping through 25 array entries"
- **Sketch2React Medium**: "We're only changing the naming and layer hierarchy. **Nothing changes visually**" — 자동화 안 됨
- **Material UI Sync plugin**: Figma 의존 (MUSE처럼 Figma 비의존 도구 부재)
- **Builder.io**: Figma API 의존, Material UI 자동 매핑은 표면적
- **MUI Sync**: "Component customization through theme generation is **experimental and limited to the Button, Switch, and Typography components**"

### L. (신규) shadcn 도구의 부분성 (★★★★ — 라운드 2)

- **SeedFlip 비교**: "**A generator that doesn't output [typography, shape, atmosphere] is generating a partial theme and calling it complete.**"
- **tweakcn**: "Typography is untouched. Shadows are whatever shadcn ships with. Radius is the default"
- **shadesigner**: "decision fatigue problem" — 슬라이더 인터페이스 한계
- **shadcn discussion #7292**: "this one is outdated the colors are broken"
- shadcn 시장은 5+ 도구가 경쟁 중이지만 **모두 색상 위주, typography/atmosphere 합성 부재**

### N. (신규) AI가 production component에 연결 안 됨 (★★★★★ — 라운드 3)

- **UXPin**: "Most AI design tools generate to their own conventions because they **lack a direct connection to component libraries**"
- **UXPin**: "AI coding tools don't check design tokens; they **approximate**, writing code like 'padding: 12px' based on training data"
- **UXPin**: "Developers face two options: rebuild everything or ship the approximation and deal with inconsistency in production"
- **MarTech**: "AI-generated interfaces lack soul and produce cookie-cutter output"
- **Emilia BiblioKit**: "AI Makes [design system bugs] Worse"
- **Riley Gerszewski**: 반대 의견도 — "AI didn't ruin design, you're blaming the tool"

→ **UXPin 인용은 시장 메타 비판 1순위**. MUSE의 "MUI/Tailwind 직접 export" 차별점 직격 정당화.

### O. (신규) Figma의 카테고리 역공습 (★★★ — 시장 동향, 라운드 3)

- **Figma Config 2025 발표**: AI-generated design tokens + native Git + live code sync (Q3 2026 예정)
- **Tokens Studio**: 이미 W3C DTCG 표준 출력
- **Material UI Sync plugin**: Figma 의존하는 MUI 도구 (MUSE 차별점 약화 가능)

→ MUSE가 Figma 비의존을 강조하더라도, 6개월 후 Figma 자체가 같은 가치를 제공할 가능성. **속도가 결정적.**

### M. (신규) DESIGN.md = "vibe 추측" (★★★★ — 라운드 2 결정타)

- **Royarindam Medium**: "The AI isn't trying to mess with you; it just doesn't have a Source of Truth. **It's guessing your 'vibe.'**"
- **Royarindam**: "design.md should be treated as a **prompt-conditioner, not a contract**"
- **Royarindam**: "Even when Stitch ignored specifics, having the design.md in the prompt produced cleaner output" — 명세를 contract로 안 봄
- **김은수 ZDNet**: 결정 근거 부재가 정확히 같은 문제
- **Bitovi**: "Brand direction and art style requests were largely ignored"

→ "DESIGN.md는 prompt conditioner이지 계약이 아니다"라는 게 가장 강력한 비판. **MUSE가 schema-strict tool로 contract-grade 출력 강제**한다는 게 직격 차별점.

---

## 아직 부족한 영역 (다음 라운드 후보)

| 가설 | 부족한 이유 | 해결 방법 |
|---|---|---|
| D. 한국어 어휘 처리 | 명시 발화 부족 — 한국 디자이너 직접 인터뷰 필요 | 디스콰이엇/페이스북 그룹 (로그인 필요) |
| 다중 레퍼런스 합성 시도 사례 | 명시 발화 약함 — 디자이너 워크플로우 글 부족 | brunch 검색 "AI 무드보드" + Reddit (차단 풀린 후) |
| MUI 특화 시장 | 일반 shadcn/Tailwind 대비 발화 부족 | MUI 사용자 forum + Material UI Discord |
| Stitch DESIGN.md 무시 사례 더 깊이 | TDP 1건만 확인 — 더 많은 증례 필요 | Twitter/X 스레드 (로그인 필요) |

다음 라운드는 **리포트 v2**로 위 4개 영역 전용으로 갈 수 있음. 또는 충분하다고 판단되면 이 데이터로 MUSE 카피 v1 작성 단계로 진입.
