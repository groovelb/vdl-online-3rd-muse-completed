---
session: 026
date: 2026-04-27
title: MUSE — ProjectDetailPage 사용 레퍼런스 썸네일 노출 + Dark Reader 확장 차단
---

# 026. MUSE — ProjectDetailPage 사용 레퍼런스 썸네일 노출 + Dark Reader 확장 차단

## 🎯 의도 (User Goal)

> (1) 프로젝트 상세 페이지에서 합성에 사용된 레퍼런스 이미지가 안 보여 어떤 소스로 만들어진 결과물인지 추적이 어려움 — 헤더 아래에 썸네일 strip을 추가. (2) Dark Reader 같은 브라우저 확장이 dev/Storybook 화면 색을 임의로 반전시키는 문제를 opt-out 메타로 차단.

## 🔑 주요 의사결정

- **사용 레퍼런스는 가로 스크롤 strip으로**: 별도 섹션·그리드 만들지 않고 헤더와 Layer tabs 사이에 88px 정사각형 썸네일을 가로 스크롤(`overflowX: auto`)로 나열. 합성 소스가 4장 이내인 경우가 대부분이라 단순 row가 적합. `objectFit: cover` + 1px divider만 — 디자인 가산점 없이 정보만.
- **`project.referenceIds` × `references` prop join은 페이지 안에서**: 호스트(라우트)에서 미리 join 해서 내려주지 않고 컴포넌트 안에서 `referenceIds.map((id) => references.find((r) => r.id === id)).filter(Boolean)` 처리. props 시그니처 변경 없음.
- **Dark Reader 차단은 `darkreader-lock` 메타 한 줄 (opt-out)**: JS 감지·분기 없이 메타 한 줄로 확장이 자동 비활성화. Vite 진입점(`index.html`)은 정적 추가, Storybook은 SSR-안전한 런타임 주입 (중복 가드 포함).
- **빈 상태(referenceIds가 없거나 매칭 실패)는 섹션 자체 숨김**: "0장" 상태를 노출하지 않아 시각적 노이즈 제거.

## 💬 Claude의 핵심 반응

- 가로 스크롤 row의 썸네일 크기는 88px로 — 너무 크면 헤더와 탭 사이에서 페이지 위계를 흔들고, 너무 작으면 식별 어려움. 디자인 결정은 사용자가 추가 지시 없으면 최소 변경.
- Dark Reader 차단을 위해 자체 다크 모드 분기 등 부가 기능 제안하지 않음 — 사용자가 옮긴 가이드대로 메타 주입만 진행.

## 📂 변경된 파일

| 파일 | 종류 | 요약 |
|------|------|------|
| `src/components/templates/ProjectDetailPage.jsx` | 수정 | `usedReferences` derive 추가, 헤더와 CategoryTab 사이에 "사용된 레퍼런스 (N)" 가로 strip (88px 썸네일) |
| `index.html` | 수정 | `<head>`에 `<meta name="darkreader-lock" />` 추가 |
| `.storybook/preview.jsx` | 수정 | 상단에 `darkreader-lock` 메타 런타임 주입 (SSR 가드 + 중복 가드) |

## 🧩 컴포넌트 작업

- **수정**: `ProjectDetailPage` (사용 레퍼런스 썸네일 strip 섹션 추가)
- **재사용**: `Box`, `Typography` (MUI 직접 사용, 신규 추출 컴포넌트 없음)

## ✅ 최종 결과

- 프로젝트 상세 페이지: 헤더 → 사용 레퍼런스 썸네일 strip → Layer tabs 순으로 위계 정리. 합성 소스 즉시 식별 가능.
- Dev (`pnpm dev`) + Storybook 양쪽 모두 Dark Reader 확장 활성화 상태에서도 색 반전 일어나지 않음.
- 검증: Storybook `MUSE/Pages/ProjectDetailPage` 에서 referenceIds 있는 fixture로 strip 표시 확인.

## 🔁 재현 가이드 (교육생용)

### 1. 사용된 레퍼런스 썸네일 strip
- `ProjectDetailPage` 함수 본체 상단에 derive 추가:
  ```js
  const usedReferences = (project?.referenceIds || [])
    .map((id) => references.find((r) => r.id === id))
    .filter(Boolean);
  ```
- 프로젝트 헤더 `</Box>` 직후, `<CategoryTab>` 직전에 conditional 섹션 삽입 — 88px 썸네일을 `display: flex; gap: 1; overflowX: auto` row로 렌더, 각 썸네일은 `<Box component="img" objectFit="cover" />`. `usedReferences.length === 0`이면 섹션 자체 렌더 안 함.

### 2. Dark Reader 차단 (Vite 메인 진입점)
- `index.html` `<head>`에 `<meta name="darkreader-lock" />` 한 줄. 다른 메타는 건드리지 않음.

### 3. Dark Reader 차단 (Storybook)
- `.storybook/preview.jsx` 최상단 import 직후에 가드 포함 런타임 주입:
  ```js
  if (typeof document !== 'undefined' && !document.querySelector('meta[name="darkreader-lock"]')) {
    const m = document.createElement('meta');
    m.name = 'darkreader-lock';
    document.head.appendChild(m);
  }
  ```

> 💡 핵심 포인트:
> 1. **`darkreader-lock`은 opt-out 표준** — JS로 확장 감지·분기하지 말 것. 메타 한 줄로 확장이 알아서 비활성화.
> 2. **referenceIds → references 매칭은 페이지 안에서** — 라우트 props 시그니처를 건드리지 않고 컴포넌트 자체에서 join. 빈 결과 필터(`.filter(Boolean)`)로 stale id 방어.
