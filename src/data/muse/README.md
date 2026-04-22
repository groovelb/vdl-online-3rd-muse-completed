# MUSE Dummy Data

`docs/muse/02-ux-flow.md` 의 데이터 모델을 그대로 반영한 더미 데이터 세트.
Storybook 페이지 템플릿(`ArchivePage`, `ProjectListPage`, `ProjectDetailPage`, `SettingsPage`, `ProjectCreateWizard`, `ReferencePicker`)이 모두 이 디렉토리에서 데이터를 import한다.

## 파일 구조

| 파일 | 역할 |
|------|------|
| `schemas.js` | JSDoc typedef. IDE 자동완성용. 런타임 값 없음 |
| `references.js` | Reference 28건 — `dummyImage/reference{N}.jpg` 정적 import로 연결 |
| `projects.js` | Project 4건 + id 맵 + thumbnail 조립 버전 |
| `analysisResults.js` | 프로젝트별 5-layer AnalysisResult |
| `userSettings.js` | 기본 설정 값 |
| `dummyImage/` | 실제 레퍼런스 이미지 (reference1.jpg ~ reference28.jpg / jpeg) |
| `index.js` | barrel export |

## Storybook 데이터 확인

- **`MUSE/Data/References`** — 전체 목록/스키마/그리드/id 조회 3가지 뷰 제공

## 이미지 교체 방식

### 1) 같은 파일명 유지

`dummyImage/reference1.jpg` 등의 파일명 그대로 내용만 바꾸면 코드 수정 없음. 프로젝트 전체가 자동 반영.

### 2) 이미지 추가

새 이미지 파일을 `dummyImage/`에 넣고 `references.js` 상단의 import 구문 + `IMAGES` 배열에만 추가.

```js
import ref29 from './dummyImage/reference29.jpg';
// ...
const IMAGES = [..., ref28, ref29];
```

`references` 배열 길이가 자동으로 늘어나며, 모든 스토리/페이지가 새 길이를 반영한다.

### 3) 프로젝트 카드 썸네일

`projects.js`의 `projectsWithThumbnails`가 Reference 썸네일을 자동 파생. 별도 교체 불필요.

### 4) 키비주얼 (프로젝트 상세)

`analysisResults.js`의 `buildKeyVisuals`가 프로젝트의 referenceIds에서 썸네일을 참조.

## 사용 예

```jsx
import {
  references,
  referencesById,
  projectsWithThumbnails,
  getAnalysisResult,
  defaultUserSettings,
} from '../../data/muse';

<ArchivePage references={ references } ... />
<ProjectListPage projects={ projectsWithThumbnails } ... />
<ProjectDetailPage
  project={ projectsWithThumbnails[0] }
  analysis={ getAnalysisResult(projectsWithThumbnails[0].id).layers }
  ...
/>
```
