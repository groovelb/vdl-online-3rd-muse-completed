---
session: {NNN}
date: {YYYY-MM-DD}
title: {한 줄 제목}
---

# {NNN}. {한 줄 제목}

## 🎯 의도 (User Goal)

> 사용자가 무엇을 원했는지 1~2문장으로

## 🔑 주요 의사결정

- **{결정 1}**: {왜 이렇게 했는가}
- **{결정 2}**: {왜 이렇게 했는가}
- **{결정 3}**: {왜 이렇게 했는가}

## 💬 Claude의 핵심 반응

재현에 영향을 주는 제안/판단만 기록 (전체 대화 X)

- {예: 신규 컴포넌트 생성 대신 기존 `Card` 재활용 권장}
- {예: framer-motion 대신 MUI sx transition 사용}

## 📂 변경된 파일

| 파일 | 종류 | 요약 |
|------|------|------|
| `src/components/card/HoverCard.jsx` | 추가 | 호버 모션 카드 |
| `src/components/card/index.js` | 수정 | barrel export 추가 |

## 🧩 컴포넌트 작업

- **신규**: `HoverCard` (category: `card`)
- **수정**: `Card` ({무엇을 바꿨는지})
- **재사용**: `Typography`, `Box`

## ✅ 최종 결과

{한 줄 요약} — 검증: {예: Storybook `Card/HoverCard` 스토리에서 확인}

## 🔁 재현 가이드 (교육생용)

1. {Claude에게 "~~를 만들어줘"라고 요청}
2. {`src/components/card/HoverCard.jsx` 생성됨 — 핵심 코드 패턴: ...}
3. {barrel export 추가}
4. {Storybook 실행 후 확인}

> 💡 핵심 포인트: {교육생이 놓치기 쉬운 부분 1줄}
