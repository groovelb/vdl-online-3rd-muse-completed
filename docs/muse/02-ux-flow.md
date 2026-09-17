# MUSE: UX Flow

> 이 문서가 결정하는 것: 각 과업을 어떤 화면과 데이터로 이루는가
> 입력: 01 4절 사용자·대상, 01 5절 과업 · 출력 대상: 03-visual-direction, /supabase-integration, /component-work (넘기는 항목은 이 문서 6절 표)

## 결정 현황

이 표의 확정 항목만 다음 문서가 그대로 인용한다. 잠정은 `(잠정)` 표시를 달고 인용하고, 미정은 인용하지 않는다.

| 섹션 | 상태 | 비고 |
|---|---|---|
| 1. UX-flow 시나리오 | 확정 | 예외 칸은 코드 추론 |
| 2.1 페이지 리스트 | 확정 | 경로는 실제 라우트 |
| 2.2 계층 트리 | 확정 | |
| 3.1 대상 정의 | 확정 | 01 4.2절 6행 그대로 |
| 3.2 이름 사전 | 확정 | 부록 DB 스키마 대조 |
| 4. 인터랙션 원칙 | 잠정 | 원문에 없어 역추출 |
| 5. 컴포넌트 리스트 | 확정 | 파일 diff로 대조 |
| 6. 다음 문서로 넘기는 것 | 확정 | |

문서 상태: 잠정 승인 (하드 게이트 충족)
개정: 2026-09-17 v2 · 변경: 새 포맷으로 재구성 (교육 예제)

비고:

- **3.1절 근거**: 01 4.2절의 6행을 이름 그대로 받았다. 속성과 영속성은 `src/data/muse/schemas.js`와 `appendix-db-schema.md`로 확인했다.
- **3.2절 근거**: 테이블명은 `appendix-db-schema.md`의 실제 테이블 6개다. `sql-reserved-words.md`와 대조해 충돌이 없다.
- **4절 잠정**: 원문에 인터랙션 원칙 절이 없다. 원문의 해결 접근과 화면 코드에서 역추출했다 (Q3).
- **5절 근거**: 스타터킷 `src/components`와 파일 단위로 대조했다. 공유 경로 52개 중 14개가 다르고, 이 저장소에만 있는 파일이 33개다(스토리와 barrel 파일 제외). `src/pages` 아래 가입·랜딩 파일 11개는 대조 대상이 없어 전부 신규로 넣었다.
- **분량**: 325줄(권장 250). 가독성 규칙(표 분할, 비고 목록, 구분선)으로 늘었다. 5절을 `appendix-screen-component-map.md`로 옮기면 줄일 수 있다.

---

## 1. UX-flow 시나리오 (01 5절 과업과 1:1)

R 읽기 · W 생성 · D 갱신/삭제. 사용자 칸의 "전 사용자"는 01 4.1절 네 이름 전부를 뜻한다.

### 1.1 영감 이미지를 모아 태그가 붙은 상태로 둔다

- **사용자**: 시니어 디자이너, 바이브 코딩 사용자
- **진입**: 로그인 직후 첫 화면 · **성공 조건**: 올린 이미지에 레이어별 태그와 대표색이 붙는다 · **예외**: 태깅 실패 시 카드에 배지가 남고 다시 시도한다

| 단계 | 화면 | 사용자 행동 | 다루는 대상 (R/W/D) | 결과 |
|---|---|---|---|---|
| 1 | Archive | 모아 둔 그리드를 훑는다 | Reference R (많음) | 열 수가 화면 폭을 따라가는 그리드 |
| 2 | Archive | 이미지를 끌어다 놓거나 주소를 붙인다 | Reference W | 빈 카드가 먼저 서고 태깅이 시작된다 |
| 3 | Archive | 태그가 채워지는 것을 기다린다 | Reference D | 레이어별 태그와 대표색이 카드에 붙는다 |
| 4 | Archive | 태그와 색으로 범위를 좁힌다 | Reference R | 따라오는 필터, 자리를 지키는 그리드 |
| 5 | Archive | 카드를 열어 크게 본다 | Reference R | 원본과 추출값을 한 화면에서 확인 |

비고:

- 단계 3의 태깅은 업로드 직후 비동기로 돈다. 사용자는 기다리는 동안 다른 일을 할 수 있다.
- 단계 4의 필터는 검색어, 레이어별 태그, 대표색 세 축이다.

### 1.2 의도와 레퍼런스를 단계마다 골라 결정을 좁힌다

- **사용자**: 전 사용자
- **진입**: ProjectList의 새 프로젝트 · **성공 조건**: 다섯 단계를 지나 분석 결과가 생긴다 · **예외**: 레퍼런스를 하나도 고르지 않으면 다음으로 못 간다 (잠정)

| 단계 | 화면 | 사용자 행동 | 다루는 대상 (R/W/D) | 결과 |
|---|---|---|---|---|
| 1 | ProjectCreate | 컨셉과 시스템 중 모드를 고른다 | Project W | 이후 안내와 산출물 기준이 갈린다 |
| 2 | ProjectCreate | 이름과 한 줄 의도를 적는다 | Project W | 의도가 추천과 합성의 기준이 된다 |
| 3 | ProjectCreate | 고른 레퍼런스에서 쓸 레이어를 켠다 | ProjectReference W, Reference R | 레퍼런스마다 가져올 레이어가 선언된다 |
| 4 | ProjectCreate | 레퍼런스마다 활용 노트를 적는다 | Project D | 노트가 합성에 먼저 반영된다 |
| 5 | ProjectCreate | 분석을 시작하고 진행을 지켜본다 | AnalysisResult W | 끝나면 ProjectDetail로 넘어간다 |

비고:

- 단계 4는 원문의 활용 노트 한 칸에서 레퍼런스별 노트로 바뀌었다. 근거는 위자드 Step 3 코드와 `projects.reference_notes` 컬럼이다.
- 단계 5의 분석은 외부 모델 호출이다. 진행 중에는 레이어별 인디케이터가 돈다.

### 1.3 만들어진 토큰의 근거를 확인하고 다듬는다

- **사용자**: 시니어 디자이너, 시스템 엔지니어
- **진입**: 분석 완료 직후 또는 ProjectList의 카드 · **성공 조건**: 토큰마다 근거를 확인하고 쓸 것만 남긴다 · **예외**: 분석 전 프로젝트는 빈 상태로 안내한다 (잠정)

| 단계 | 화면 | 사용자 행동 | 다루는 대상 (R/W/D) | 결과 |
|---|---|---|---|---|
| 1 | ProjectList | 프로젝트 카드를 고른다 | Project R (몇 개) | 썸네일 묶음으로 프로젝트를 구분 |
| 2 | ProjectDetail | 레이어 탭을 옮긴다 | AnalysisResult R | 좁은 목록과 넓은 미리보기로 갈린 화면 |
| 3 | ProjectDetail | 토큰의 근거를 펼친다 | AnalysisResult R | 출처 레퍼런스, 고른 이유, 탈락 후보 |
| 4 | ProjectDetail | 토큰을 끄고 강조를 올린다 | AnalysisResult D | 지우지 않고 끄므로 되돌릴 수 있다 |
| 5 | ProjectDetail | 쓰인 레퍼런스를 되짚는다 | ProjectReference R, Reference R | 어느 레퍼런스에서 왔는지 바로 확인 |

비고: 편집은 삭제가 아니라 끄기와 강조 두 축이다. 원문 결정이고 코드의 `isEnabled`, `emphasis` 필드와 맞는다.

### 1.4 토큰과 결정 로그를 외부 도구로 가져간다

- **사용자**: 시스템 엔지니어, 바이브 코딩 사용자
- **진입**: ProjectDetail 상단의 내보내기 · **성공 조건**: 모드에 맞는 산출물을 손에 넣는다 · **예외**: 없음

| 단계 | 화면 | 사용자 행동 | 다루는 대상 (R/W/D) | 결과 |
|---|---|---|---|---|
| 1 | ProjectDetail | 내보내기를 연다 | Project R | 모드에 맞는 산출물이 미리 골라져 있다 |
| 2 | ProjectDetail | 산출물 종류를 확인한다 | AnalysisResult R | 컨셉은 붙여넣을 글, 시스템은 묶음 |
| 3 | ProjectDetail | 복사하거나 내려받는다 | Reference R | 토큰과 결정 로그와 원본이 함께 나간다 |

비고: 시스템 모드의 묶음에는 설계 문서, 표준 토큰 파일, 결정 로그, 원본 레퍼런스가 들어간다.

### 1.5 무엇을 해 주는 도구인지 보고 계정을 만든다

- **사용자**: 전 사용자
- **진입**: 주소 직접 방문 또는 외부 링크 · **성공 조건**: 소개를 읽고 계정을 만들어 첫 화면에 닿는다 · **예외**: 로그인 없이 안쪽 화면에 오면 되돌려 보낸다

| 단계 | 화면 | 사용자 행동 | 다루는 대상 (R/W/D) | 결과 |
|---|---|---|---|---|
| 1 | Auth | 첫 화면을 본다 | 없음 | 흩뿌려진 레퍼런스가 배경을 채운다 |
| 2 | Auth | 아래로 내린다 | 없음 | 감속한 스크롤로 분류 체계를 설명 |
| 3 | Auth | 산출물 예시를 본다 | 없음 | 실제와 같은 탭과 토큰 미리보기 |
| 4 | Auth | 가입한다 | User W, UserSettings W | 계정과 기본 설정이 함께 생긴다 |
| 5 | Archive | 첫 화면에 닿는다 | Reference R | 비어 있는 그리드와 올리기 자리 |

비고: 단계 3의 미리보기는 실제 화면과 같은 부품으로 그린다. 소개와 제품이 어긋나지 않게 하려는 결정이다.

---

## 2. 정보 구조

### 2.1 페이지 리스트

| 페이지 | 경로 | 한 줄 목적 | 다루는 대상 | 등장 시나리오 |
|---|---|---|---|---|
| Auth | `/auth` | 소개 랜딩과 가입·로그인 | User, UserSettings | 5 |
| Archive | `/archive` | 레퍼런스 모으기와 좁히기 | Reference | 1, 5 |
| ProjectList | `/projects` | 프로젝트 카드 목록 | Project | 2, 3 |
| ProjectCreate | `/projects/new` | 다섯 단계 생성 흐름 | Project, ProjectReference, AnalysisResult | 2 |
| ProjectDetail | `/projects/:id` | 레이어 탭, 토큰 편집, 내보내기 | AnalysisResult, Project, Reference | 3, 4 |
| Settings | `/settings` | 모델, 저장 방식, 화면 밝기 | UserSettings | 없음 |

비고:

- 경로는 `src/App.jsx`의 라우트다. 최상위 주소로 들어오면 Archive로 넘긴다.
- ProjectCreate는 Reference를 읽기만 한다. 만들지 않으므로 다루는 대상 칸에서 뺐다.
- Settings는 과업에 묶이지 않는 설정 화면이라 등장 시나리오가 없다.
- 운영과 감사를 위한 화면(`/admin`)이 코드에 있으나 기획 범위 밖이라 넣지 않았다.

### 2.2 계층 트리

```
Auth (/auth)
├── Hero (흩뿌린 레퍼런스 배경, 한 줄 선언)
├── Input (같은 격자로 분류되는 레퍼런스)
├── Tag Flow (분류 어휘가 흐르는 띠)
├── Output (레이어 탭과 토큰 미리보기)
└── CTA (가입 진입, 가입·로그인 모달)

Archive (/archive)
├── Filter (검색, 레이어별 태그, 대표색)
├── Grid (화면 폭을 따르는 카드 그리드)
├── Upload (끌어다 놓기, 주소 붙이기)
└── Detail (원본과 추출값 모달)

ProjectList (/projects)
├── Top (제목, 새 프로젝트)
└── Grid (프로젝트 카드)

ProjectCreate (/projects/new)
├── Steps (단계 표시)
├── Step 0 모드 · Step 1 의도
├── Step 2 레퍼런스와 레이어
├── Step 3 레퍼런스별 노트
├── Step 4 분석 진행
└── Bottom (이전·다음 고정 막대)

ProjectDetail (/projects/:id)
├── Top (제목, 내보내기)
├── Left (레이어 탭, 토큰 목록)
├── Right (레이어별 미리보기)
└── Refs (쓰인 레퍼런스 줄)

Settings (/settings)
├── 모델
├── 저장 방식
└── 화면 밝기
```

---

## 3. 데이터 모델 (01 4.2절 이름 그대로)

### 3.1 대상 정의

정의와 영속성:

| 이름 | 식별자 | 주요 속성 (윤곽) | 영속성 |
|---|---|---|---|
| 레퍼런스 | Reference | 소스, 썸네일, 레이어별 태그, 대표색, 추출값 | 서버 |
| 프로젝트 | Project | 이름, 의도, 모드, 활용 노트 묶음 | 서버 |
| 레퍼런스 활용 | ProjectReference | 레퍼런스 참조, 가져올 레이어, 순서 | 서버 |
| 분석 결과 | AnalysisResult | 네 레이어 토큰, 무드 글, 결정 근거, 상태 | 서버 |
| 사용자 설정 | UserSettings | 모델, 저장 방식, 화면 밝기, 자동 태깅 | 서버 |
| 사용자 | User | 계정, 닉네임, 아바타 | 서버 |

흐름과 관계:

| 이름 | 만드는 곳 | 보이는 페이지 | 관계 |
|---|---|---|---|
| 레퍼런스 | Archive | Archive, ProjectCreate, ProjectDetail | User가 소유 |
| 프로젝트 | ProjectCreate | ProjectList, ProjectCreate, ProjectDetail | User가 소유 |
| 레퍼런스 활용 | ProjectCreate | ProjectCreate, ProjectDetail | Project와 Reference를 잇는다 |
| 분석 결과 | ProjectCreate | ProjectDetail | Project에 종속 |
| 사용자 설정 | Auth | Settings | User마다 하나 |
| 사용자 | Auth | Auth, 전역 헤더 | 모든 자료의 소유자 |

비고:

- 영속성 값은 정적 / 휘발 / 세션 / 브라우저 / 서버다. 여섯 대상이 모두 서버에 남는다.
- 화면 밝기 설정만 화면 표시에 바로 쓰이고 나머지 설정은 분석과 저장 동작을 바꾼다.
- 위자드 진행 단계, 선택 중인 레이어 탭, 스크롤 위치는 화면 상태이고 다루는 대상이 아니다.

### 3.2 데이터 모델 활용 (이름 사전)

| 데이터명 | 한국어 | 코드 식별자 | 예상 테이블명 | 생성 책임 페이지 |
|---|---|---|---|---|
| `Reference` | 레퍼런스 | `reference` | `reference_items` | Archive |
| `Project` | 프로젝트 | `project` | `projects` | ProjectCreate |
| `ProjectReference` | 레퍼런스 활용 | `projectReference` | `project_references` | ProjectCreate |
| `AnalysisResult` | 분석 결과 | `analysisResult` | `analysis_results` | ProjectCreate |
| `UserSettings` | 사용자 설정 | `userSettings` | `user_settings` | Auth |
| `User` | 사용자 | `user` | `auth.users`, `profiles` | Auth |

비고:

- `reference_items`는 예약어를 피하려고 고른 이름이다. 원문과 `appendix-db-schema.md`가 같은 이름을 쓴다.
- `User`는 가입 계정과 프로필 두 테이블로 나뉜다. 프로필은 가입 순간 자동으로 생긴다.
- 사용자 설정도 가입 순간 기본값 한 줄이 생기고, 이후 Settings에서 고친다. 그래서 생성 책임은 Auth다.
- 표의 테이블명 여섯을 `sql-reserved-words.md`와 대조했고 충돌이 없다.

---

## 4. 인터랙션 원칙 (최대 5)

| 원칙 | 근거 (01 3절 가치) | 드러나는 곳 | 유도되는 컴포넌트 유형 |
|---|---|---|---|
| 근거는 결과 바로 옆에 붙어 있다 | Traceability | ProjectDetail 토큰 목록 | 펼치는 근거 패널 |
| 질문은 새 화면이 아니라 입력 자리에 끼운다 | Authorship | ProjectCreate 각 단계 | 안내가 붙은 입력 필드 |
| 사용자가 켠 레이어만 합성에 들어간다 | Authorship | ProjectCreate 레퍼런스 선택 | 레이어 토글 chip 행 |
| 편집은 삭제가 아니라 끄기와 강조다 | Traceability | ProjectDetail 토큰 행 | 토글과 강조 슬라이더 |
| 도구는 뒤로 빠지고 이미지가 앞에 선다 | Restraint | Archive, Auth 랜딩 | 중립 카드, 폭을 따르는 그리드 |

비고:

- 원칙 1은 리서치의 첫 문제(결과만 있고 이유가 없다)에 직접 대응한다.
- 원칙 2는 큰 화면을 새로 만들지 않고 기존 입력 지점에만 질문을 얹는다는 뜻이다.
- 원칙 5는 03 1절 무드의 근거가 된다.

---

## 5. 컴포넌트 리스트

| 컴포넌트 | 페이지/섹션 | 구분 | 카테고리 | 비고 |
|---|---|---|---|---|
| AppShell | 전역 | 수정 | layout | 투명 헤더, 고정 슬롯 props |
| GNB | 전역 (AppShell 경유) | 수정 | navigation | 투명 모드와 우측 슬롯 |
| PageContainer | 전역 | 수정 | layout | fluid·focus 두 폭 모드 추가 |
| ArchivePage | Archive | 신규 | templates | 필터와 그리드 조립 |
| FilterPanel | Archive · Filter | 신규 | templates | 검색·태그·대표색 사이드바 |
| SearchBar | Archive · Filter | 수정 | input | 필터 패널용 크기·상태 |
| InfiniteMasonry | Archive · Grid | 신규 | layout | 폭에 따라 2~5열, 이어 불러오기 |
| useInfiniteScroll | Archive, ProjectCreate | 신규 | layout | 화면 끝 감지 훅 |
| ReferenceCard | Archive, ProjectCreate, Auth | 신규 | card | 썸네일, 태그, 대표색 |
| ImageCard | ReferenceCard 기반 | 수정 | card | 태그 배지와 선택 표시 |
| CustomCard | ImageCard 기반 | 수정 | card | 호버·선택 상태 확장 |
| CardContainer | CustomCard 기반 | 수정 | card | 모서리와 패딩 기준 변경 |
| LayerAnalysisStrip | Archive · Grid | 신규 | data-display | 카드 위 레이어 요약 줄 |
| FileDropzone | Archive · Upload | 수정 | input | 여러 장 동시 업로드 |
| ReferenceDetailDialog | Archive · Detail | 신규 | overlay-feedback | 원본과 추출값 모달 |
| useReferenceArchive | Archive | 신규 | templates | 필터·업로드 상태 훅 |
| ProjectListPage | ProjectList | 신규 | templates | 카드 목록 조립 |
| MoodboardCard | ProjectList · Grid | 수정 | card | 프로젝트 썸네일 묶음 |
| ImageTransition | MoodboardCard 내부 | 재활용 | media | 썸네일 교차 전환 |
| ProjectCreateWizard | ProjectCreate | 신규 | templates | 다섯 단계 셸, 고정 하단 막대 |
| ModeSelectCard | ProjectCreate · Step 0 | 신규 | card | 모드 두 장 중 하나 |
| IntentGuideField | ProjectCreate · Step 1 | 신규 | input | 안내가 붙은 의도 입력 |
| ReferencePicker | ProjectCreate · Step 2 | 신규 | templates | 추천과 아카이브 다중 선택 |
| ReferenceLayerChipRow | ProjectCreate · Step 2 | 신규 | card | 레이어 토글 chip 행 |
| RefImage | ProjectCreate, ProjectDetail | 신규 | media | 만료된 주소 재발급 이미지 |
| AnalysisProgress | ProjectCreate · Step 4 | 신규 | overlay-feedback | 레이어별 진행 인디케이터 |
| ProjectDetailPage | ProjectDetail | 신규 | templates | 탭과 미리보기 조립 |
| SplitScreen | ProjectDetail | 재활용 | layout | 25 대 75 좌우 분할 |
| CategoryTab | ProjectDetail, Auth | 재활용 | in-page-navigation | 다섯 레이어 탭 |
| 토큰 프리뷰 4종 | ProjectDetail · Right | 신규 | data-display | 레이어마다 한 종 |
| TokenListItem | ProjectDetail · Left | 신규 | data-display | 끄기와 강조 슬라이더 |
| TokenDecisionTracePanel | ProjectDetail · Left | 신규 | data-display | 출처·이유·탈락 후보 펼침 |
| DesignMdPreview | ProjectDetail · Right | 신규 | data-display | 설계 문서 미리보기 |
| ThemeExportDialog | ProjectDetail · Top | 신규 | overlay-feedback | 모드별 산출물 모달 |
| ScatterGallery | Auth · Hero, CTA | 신규 | media | 흩뿌린 배경과 시차 이동 |
| ReferenceAnnotationOverlay | Auth · Hero | 신규 | media | 이미지 위 토큰 주석 |
| MarqueeContainer | Auth · Tag Flow | 재활용 | motion | 어휘 띠 흐름 |
| SettingsPage | Settings | 신규 | templates | 좁은 폭 설정 폼 |
| AuthPage | Auth | 신규 | pages | 랜딩 섹션과 가입 모달 조립 |
| AuthHeroBackdrop | Auth · Hero | 신규 | pages | 첫 화면 배경과 진입 버튼 |
| SectionShell | Auth 섹션 공통 | 신규 | pages | 눈썹, 제목, 설명 한 벌 |
| LandingSolutionStage1 | Auth · Input | 신규 | pages | 같은 격자로 분류되는 장면 |
| LandingTagFlow | Auth · Tag Flow | 신규 | pages | 분류 어휘가 흐르는 띠 |
| LandingSolutionStage2 | Auth · Output | 신규 | pages | 산출물 미리보기 장면 |
| LandingCta | Auth · CTA | 신규 | pages | 마지막 가입 진입 |
| landingCopy | Auth | 신규 | pages | 랜딩 문구 단일 출처 |
| AuthDialog | Auth · CTA | 신규 | pages | 가입·로그인 모달 |
| AuthGuard | 전역 | 신규 | pages | 로그인 전에는 되돌려 보낸다 |
| BetaNoticeDialog | 전역 | 신규 | pages | 베타 안내 모달 |

비고:

- **합계**: 재활용 4 · 수정 9 · 신규 36 (행 기준, 한 행에 묶인 파일은 한 건).
- **구분 근거**: 스타터킷 `src/components`와 파일 단위로 대조했다. 같은 경로에 내용이 같으면 재활용, 내용이 다르면 수정, 이 저장소에만 있으면 신규다. 판단이 아니라 대조 결과다.
- **대조 범위**: 대조는 `src/components` 두 벌 사이에서만 했다. 스토리와 barrel 파일을 뺀 컴포넌트 파일 85개 중 같음 38 · 다름 14 · 이 저장소만 33이다. 이 표에는 그중 화면에 실제로 쓰이는 것만 올렸다.
- **대조 범위 밖**: `src/pages` 아래 파일은 스타터킷에 대응 폴더가 없어 대조 없이 전부 신규다. 표의 카테고리 `pages` 11행이 그것이고, `ls src/pages/auth`와 `ls src/pages/auth/sections`의 목록 그대로다. 가입·랜딩을 뺀 나머지 `src/pages` 파일(라우트 감싸개, 상단 네비, 사용자 메뉴, 운영 화면)은 이 표에 넣지 않았다.
- **원문 신규 3건의 행방**: 원문이 예고한 `LoginForm`·`SignUpForm`은 따로 만들지 않고 `AuthDialog` 한 곳에 들어갔고, `AuthGuard`는 `src/pages/auth/AuthGuard.jsx`로 만들어져 라우트 가드로 쓰인다.
- **묶음 구성**: 토큰 프리뷰 4종 = ColorSwatchList, TypographyPreview, LayoutTokenPreview, GradientPreview.
- **만들었으나 화면에 없는 것**: RefinementNotesField, ReferenceNotesDialog, FloatingImageGallery, SortMenu는 파일로 있으나 어느 화면에서도 불리지 않는다. Step 3이 레퍼런스별 노트로 바뀌면서 남은 자리다. `_appShellDecorator`는 스토리 전용이라 화면에 없다.
- **재활용 제외**: SectionContainer, TagInput, FilterBar, SlidingHighlightMenu, InlineTypography, 스타터킷과 내용이 다르지만 화면에서 쓰이지 않는다.
- **카테고리**: `directory-structure.md`의 폴더명이다. `pages`만 그 목록 밖이고 나머지는 전부 목록 안이다.

---

## 6. 다음 문서로 넘기는 것

| 받는 곳 | 가져가는 것 |
|---|---|
| 03-visual-direction | 2.1절 페이지 목록, 페이지별 콘텐츠 신호, 4절 원칙 |
| /supabase-integration | 3.2절 사전, 2.1절, 1절 단계 표, 5절 컴포넌트 리스트 |
| /component-work | 5절 신규·수정 항목 |
