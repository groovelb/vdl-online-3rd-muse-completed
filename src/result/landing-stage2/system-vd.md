# 의도까지 추적 가능한 디자인 시스템 — Visual Direction

## 1. 프로젝트 개요
- **프로젝트명**: 의도까지 추적 가능한 디자인 시스템 (Intent-Driven Design System)
- **유형**: Fintech + Neon-Gradient Branding System
- **한 문장 의도**: 컬러는 네온/그라디언트 강한 톤, 타이포는 매거진 헤드라인 임팩트, 레이아웃은 fintech-grade 격자.
- **분석 레퍼런스 수**: 3개 (ref-001, ref-002, ref-003)

## 2. 전체 방향성

금융 기술(fintech) 신뢰성과 네온 그라디언트의 고에너지를 결합한 시스템. **ref-001**의 bold display typography로 매거진 임팩트를 주고, **ref-003**의 neon-glow + mesh gradient 색상 팔레트가 현대적 전자기기 감성을 더하며, **ref-002**의 12-column fintech grid가 정보 구조를 견고하게 지탱한다. 모든 토큰은 어느 참고 자료에서 왔는지, 왜 선택되었는지 추적 가능하도록 설계되었다.

## 3. Visual Direction 태그
- **장르**: FinTech, Digital Product  
- **스타일**: Neon-Glow, Geometric, High-Contrast  
- **비주얼 주인공**: Neon Magenta (#FF1744) Primary Color, Dynamic Gradient Backgrounds, Bold Geometric Typography

## 4. 톤 & 무드 서술

- **Primary Color Dominance**: ref-003의 Neon Magenta (#FF1744)가 모든 CTA, 강조 요소의 중심. 고채도로 신뢰성과 에너지를 동시에 전달.  
- **Gradient Layering**: ref-003의 135° 선형 그라디언트(Magenta→Violet→Electric Blue)가 배경, 히어로 섹션, 강조 영역의 동적 배경으로 반복. Radial cyan glow는 소프트 하이라이트 역할.  
- **Dark Canvas**: ref-001, ref-003 공통의 Ink Dark (#1A1A1A) 배경에서 네온 색상이 극대화. AAA 명도 기준 충족으로 접근성 보장.  
- **Display Typography**: ref-001의 Bricolage Grotesque Bold(800) + 극도로 좁은 tracking(-0.04em)으로 매거진 헤드라인의 영향력 있는 존재감. clamp() 함수로 반응형 대 소형 디바이스 모두 임팩트 유지.  
- **Fintech Grid Foundation**: ref-002의 12열 격자(24px gap, 1280px max-width)가 모든 데이터, 카드, 폼 요소를 정렬. 금융 대시보드의 정보 신뢰성 강화.  
- **Neon-to-Neutral Dialogue**: 고채도 네온(magenta, cyan, electric blue) ↔ 중성(ink dark, surface light) 대비로 가독성과 에너지의 완벽한 균형.

## 5. 구현 가이드라인

- **Color Role Enforcement** (mode=system): primary는 neon magenta만. secondary는 electric blue. accent는 cyan glow. neutral은 ink dark / surface light. 역할 중복 없음.  
- **Typography Hierarchy**: h1(display, 64–120px) → h2(heading, 36–56px) → body1(16px) → caption(12px). Bricolage Grotesque는 헤드라인 전용, IBM Plex Sans는 본문 전용. 혼합 금지.  
- **Gradient Usage**: linear-gradient(135deg, ...) 는 fullscreen hero, 데이터 섹션 배경, 강조 오버레이. radial cyan glow는 보조 데코, 상호작용 호버 상태.  
- **Grid & Container**: 모든 콘텐츠는 12-col 격자 내 정렬. gap 24px 일정. 최대 너비 1280px. Hero section은 16:9 ratio로 그라디언트 배경 최적화.  
- **Spacing Scale**: xs(4px) → sm(8px) → md(16px) → lg(24px) → xl(32px). Button padding은 md, card는 lg, section은 xl로 시각적 호흡감 조정.  
- **Rounded Consistency**: sm(4px) 버튼/입력장, md(8px) 카드/모달, lg(16px) 레이아웃 요소. 기하학적 선명함 유지.

## 6. 피해야 할 요소

- **Washed-out Colors**: 네온 팔레트의 고채도가 핵심. desaturated 또는 pastel 톤은 시스템의 에너지 약화.  
- **Typography Mixing**: Bricolage(headlines)와 IBM Plex(body)의 혼합 사용 금지. 각 역할 명확화 필수.  
- **Low-Contrast Combinations**: light surface on light background, dark ink on dark background 금지. AAA 기준 명도차이 확보 필수.  
- **Gradient Overuse**: 배경 + 텍스트 동시 그라디언트 적용 금지. 읽기성 저하. 배경만 또는 accent 요소 경계선만 그라디언트.  
- **Breaking Grid**: 12-col grid, 24px gap, 1280px max-width 이탈. fintech 신뢰성의 근간.  
- **Orphaned Icons/Graphics**: 모든 보조 요소(icon, divider, shape)는 색상 팔레트(primary/secondary/accent/neutral)로 통일. 임의의 색상 신입 금지.
