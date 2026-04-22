---
session: 010
date: 2026-04-22
title: MUSE — reference1.jpg 삭제 및 ProjectListPage MoodboardCard 썸네일 렌더 버그 수정
---

# 010. MUSE — reference1.jpg 삭제 및 ProjectListPage MoodboardCard 썸네일 렌더 버그 수정

## 🎯 의도 (User Goal)

> (1) 부적절한 더미 이미지(reference1.jpg — 마이클 잭슨 사진)를 제거. (2) Storybook `Page/ProjectListPage`에서 프로젝트 카드의 2×2 분할 썸네일이 빈 회색으로만 나오는 문제를 수정.

## 🔑 주요 의사결정

- **파일 삭제 + 참조만 제거, id 체계·번호는 유지**: `reference1.jpg` 실물 파일 삭제, `references.js`에서 `ref1` import와 `IMAGES` 첫 엔트리 제거. 나머지 파일명(`reference2.jpg` ~ `reference28.jpg`)은 그대로 두어 파일명 대량 rename으로 인한 git diff 오염 방지.
- **id 매핑은 자동으로 1칸씩 당김**: `references.map((_, i) => ref-${i+1})` 생성 로직 덕에 총 27건으로 줄고 `ref-001`이 이제 `reference2.jpg`를 가리킴. `projects.js`의 `referenceIds`(ref-001 ~ ref-023)는 27건 범위 안이라 여전히 전부 유효 → 수정 불필요.
- **MoodboardCard 썸네일 버그의 원인**: `MoodboardCard.jsx:200`이 각 thumbnail image에서 `image.thumbnail || image.src?.medium`을 읽는데, `ProjectListPage`에서 `{ id, src: urlString }` 형태로 넘기고 있어 `image.src?.medium`은 undefined가 됨 → `<img src={undefined}>`가 빈 회색 블록으로 렌더링.
- **MoodboardCard API를 건드리지 않고 페이지 어댑터만 수정**: 기존 계약(`thumbnail` 또는 `src.medium` 중 하나)을 존중하고 `ProjectListPage` 쪽에서 `thumbnail` 필드를 채우는 방향으로 수정. 공통 컴포넌트 시그니처 확장은 파급이 커서 회피.
- **한 줄 주석으로 계약 명시**: 매핑부에 `// MoodboardCard는 image.thumbnail 또는 image.src.medium을 읽음` 주석을 남겨, 이후 이 페이지를 만질 교육생이 이 규칙을 또 어기지 않도록 방지.

## 💬 Claude의 핵심 반응

- 파일을 지우기 전에 `ls | wc -l`로 결과 개수를 선검증 → 27이 맞는지 확인하고 진행. 혹시라도 hidden file이 있으면 기대치와 어긋날 수 있음.
- 27건으로 줄어도 `projects.js`의 referenceIds가 유효한지 즉시 점검 → 재배치 불필요 판단. 불필요한 변경 회피.
- 썸네일 버그는 `Read MoodboardCard.jsx` 끝까지 읽어 **실제 이미지 src 추출 라인(`image.thumbnail || image.src?.medium`)** 을 확인. 추측하지 않고 구현을 직접 봐서 원인 확정.
- MoodboardCard 시그니처를 확장(`src` 문자열도 허용)하는 대안을 고려했으나, 기존 다른 사용처(예: `MoodboardCard.stories.jsx`의 기존 호출)가 `thumbnail`/`src.medium` 형식을 쓰고 있을 가능성이 커 **호출 측 어댑터 수정**이 더 안전하다고 판단.

## 📂 변경된 파일

| 파일 | 종류 | 요약 |
|------|------|------|
| `src/data/muse/dummyImage/reference1.jpg` | 삭제 | 부적절 이미지 제거 |
| `src/data/muse/references.js` | 수정 | `ref1` import + `IMAGES` 배열 첫 엔트리 제거, 제거 사유 주석 추가. 총 27건으로 축소 |
| `src/components/templates/ProjectListPage.jsx` | 수정 | MoodboardCard items 매핑에서 `src` → `thumbnail` 필드로 교체, MoodboardCard 계약 주석 추가 |

## 🧩 컴포넌트 작업

- **수정**: `ProjectListPage` (MoodboardCard 어댑터 매핑만). MoodboardCard/Card 등 공통 컴포넌트는 변경 없음.
- **재활용**: `MoodboardCard` (기존 API 그대로 소비)

## ✅ 최종 결과

- 총 Reference 27건, `Page/ProjectListPage` 스토리에서 4개 프로젝트 카드 모두 2×2 실 이미지 썸네일 표시.
- 다른 페이지(`ArchivePage`, `ProjectDetailPage`, `ReferencePicker` 등)는 이미 올바른 필드(`src` 대 `thumbnailUrl`)를 쓰고 있어 영향 없음.

## 🔁 재현 가이드 (교육생용)

1. 부적절 이미지 삭제:
   - `rm src/data/muse/dummyImage/reference1.jpg`
   - `src/data/muse/references.js`에서 `import ref1 ...`과 `IMAGES` 배열 첫 엔트리(`ref1,`) 제거
   - 삭제 사유 한 줄 주석으로 기록
2. 축소 후에도 `projects.js`의 `referenceIds`가 유효 범위인지 점검 — 남은 건수(27) 내이면 수정 불필요.
3. `Page/ProjectListPage`에서 썸네일이 빈 회색으로만 보이면:
   - `src/components/card/MoodboardCard.jsx`에서 썸네일을 어디서 읽는지 확인 (`image.thumbnail || image.src?.medium`)
   - 호출 측(`ProjectListPage.jsx`)의 items 매핑이 `src: string`이면 `thumbnail: string`으로 교체
   - 매핑부에 계약 주석 추가

> 💡 핵심 포인트:
> - **공통 컴포넌트의 API를 확장하기 전에, 호출 측 어댑터를 수정할 여지가 있는지 먼저 본다.** 공통 컴포넌트 시그니처가 넓어지면 다른 모든 사용처에 파급이 온다.
> - **id 체계와 파일명을 분리**하면 일부 자산 제거가 데이터 모델에 전파되지 않는다. `references.map((_, i) => id = pad(i+1))` 같은 생성 규칙은 자산 변동을 흡수하는 방파제.
> - **빈 이미지 블록 디버깅**: 회색 사각형만 보이면 거의 대부분 `<img src={undefined}>`. 호출 측에서 객체 구조(field 이름 케이스)가 컴포넌트 기대와 일치하는지 먼저 확인.
