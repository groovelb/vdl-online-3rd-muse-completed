# MUSE — DB Schema

## 개요

- 프로젝트: `muse` (ref: `caoaqtlpyeyosbyciqeo`, region: Northeast Asia Tokyo)
- 총 테이블 수: **6**
- 총 Enum 타입: 3 (`project_type`, `analysis_status`, `storage_mode`, `theme_mode`) — 실제로 4개
- 마이그레이션: `supabase/migrations/20260423092055_init_schema.sql`
- 작성일: 2026-04-23

## 설계 원칙 (from backend-integration-plan.md)

1. 모든 테이블 공통 컬럼: `id uuid default gen_random_uuid()` / `created_at timestamptz` / `updated_at timestamptz`
2. 모든 `updated_at` 에 `set_updated_at` 트리거 부착
3. 이종 구조는 **jsonb** — `reference_items.tags`, `analysis_results.layers`
4. 관계는 **FK + on delete cascade** 로 통일 (사용자 삭제 → 하위 데이터 자동 정리)
5. 이 마이그레이션은 **RLS enable only**. 정책은 Phase 3 에서 부착 (현 상태 = DENY by default)
6. Storage bucket (`references`) 은 Phase 4 에서 별도 생성

## ERD

```mermaid
erDiagram
    auth_users ||--|| profiles : "1:1"
    profiles ||--o{ reference_items : "owns"
    profiles ||--o{ projects : "owns"
    profiles ||--|| user_settings : "1:1"

    projects ||--o{ project_references : "has"
    reference_items ||--o{ project_references : "linked_to"

    projects ||--|| analysis_results : "1:1"

    profiles {
        uuid id PK "FK auth.users"
        text nickname UK
        text avatar_url
        timestamptz created_at
        timestamptz updated_at
    }

    reference_items {
        uuid id PK
        uuid user_id FK
        text source "file|url"
        text storage_path
        text thumbnail_url
        text title
        jsonb tags "ReferenceLayeredTags"
        text_array dominant_colors
        timestamptz created_at
        timestamptz updated_at
    }

    projects {
        uuid id PK
        uuid user_id FK
        text name
        text intent
        project_type type "enum"
        timestamptz created_at
        timestamptz updated_at
    }

    project_references {
        uuid project_id PK_FK
        uuid reference_id PK_FK
        timestamptz created_at
    }

    analysis_results {
        uuid id PK
        uuid project_id UK_FK
        jsonb layers "AnalysisLayers"
        analysis_status status "enum"
        timestamptz created_at
        timestamptz updated_at
    }

    user_settings {
        uuid user_id PK_FK
        text ai_model
        storage_mode storage_mode "enum"
        theme_mode theme_mode "enum"
        bool is_auto_tag_enabled
        timestamptz updated_at
    }
```

## 테이블 상세

### 1. `profiles`

`auth.users` 를 확장하는 사용자 메타데이터.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | uuid | PK, FK → `auth.users(id)` ON DELETE CASCADE | 사용자 ID (Supabase Auth 발급) |
| nickname | text | NOT NULL, UNIQUE | 닉네임 (`handle_new_user` 트리거가 이메일 local-part 로 초기화 — Phase 2) |
| avatar_url | text | NULLABLE | 아바타 이미지 URL |
| created_at | timestamptz | default `now()` | 생성 시각 |
| updated_at | timestamptz | default `now()`, trigger | 수정 시각 |

- 인덱스: `idx_profiles_nickname` (UNIQUE 제약이 자동 생성하는 것과 별개로 검색용)
- 트리거: `trg_profiles_updated_at`
- RLS: ENABLED (정책 Phase 3)

---

### 2. `reference_items`

Reference 엔티티 (아카이브 이미지).
테이블명이 `references` 가 아닌 이유: PostgreSQL 예약어 `REFERENCES` 충돌 회피.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | uuid | PK, default `gen_random_uuid()` | |
| user_id | uuid | NOT NULL, FK → `profiles(id)` CASCADE | 소유자 |
| source | text | NOT NULL, CHECK `in ('file','url')` | 입력 소스 |
| storage_path | text | NULLABLE | Supabase Storage 내 경로 (Phase 4) — source='file' |
| thumbnail_url | text | NULLABLE | 외부 URL 저장용 — source='url' |
| title | text | NULLABLE | 제목 |
| tags | jsonb | NOT NULL, default `'{}'::jsonb` | `ReferenceLayeredTags` 중첩 구조 (색/타이포/레이아웃/그라디언트/비주얼디렉션) |
| dominant_colors | text[] | NOT NULL, default `'{}'` | HEX 배열 |
| created_at | timestamptz | default `now()` | |
| updated_at | timestamptz | default `now()`, trigger | |

- 인덱스:
  - `idx_reference_items_user_id` (FK 조회)
  - `idx_reference_items_created_at` (내림차순 — 최신순 정렬)
  - `idx_reference_items_tags_gin` (**GIN** — `tags @> '{"color":["muted"]}'` 같은 containment 검색)
- 트리거: `trg_reference_items_updated_at`
- RLS: ENABLED

---

### 3. `projects`

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | uuid | PK | |
| user_id | uuid | NOT NULL, FK → `profiles(id)` CASCADE | 소유자 |
| name | text | NOT NULL | |
| intent | text | NOT NULL, default `''` | 한 문장 의도 |
| type | `project_type` | NOT NULL | enum: landing/dashboard/mobile/brand |
| created_at | timestamptz | default `now()` | |
| updated_at | timestamptz | default `now()`, trigger | |

- Enum: `create type project_type as enum ('landing','dashboard','mobile','brand')`
- 인덱스: `idx_projects_user_id`, `idx_projects_created_at desc`
- 트리거: `trg_projects_updated_at`
- RLS: ENABLED

---

### 4. `project_references`

Project ↔ Reference **N:M** junction.

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| project_id | uuid | NOT NULL, FK → `projects(id)` CASCADE | |
| reference_id | uuid | NOT NULL, FK → `reference_items(id)` CASCADE | |
| created_at | timestamptz | default `now()` | 추가 시점 |

- PK: `(project_id, reference_id)` 복합
- 인덱스: `idx_project_references_reference_id` (역방향 조회 — "이 레퍼런스를 쓰는 프로젝트 찾기")
- 트리거 없음 (updated_at 없음 — junction 은 상태 변경 불필요, DELETE + INSERT 로 교체)
- RLS: ENABLED

---

### 5. `analysis_results`

Project 와 **1:1** (UNIQUE 제약 강제).

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | uuid | PK | |
| project_id | uuid | NOT NULL, **UNIQUE**, FK → `projects(id)` CASCADE | 1:1 강제 |
| layers | jsonb | NOT NULL, default `'{}'::jsonb` | `AnalysisLayers` (color/typography/layout/gradient/visualDirection) |
| status | `analysis_status` | NOT NULL, default `'pending'` | enum: pending/running/done/error |
| created_at | timestamptz | default `now()` | |
| updated_at | timestamptz | default `now()`, trigger | |

- Enum: `create type analysis_status as enum ('pending','running','done','error')`
- 인덱스: `idx_analysis_results_project_id` (UNIQUE 인덱스와 별개로 명시 — 향후 join 최적화 여지)
- 트리거: `trg_analysis_results_updated_at`
- RLS: ENABLED

---

### 6. `user_settings`

Profile 과 **1:1** (user_id 자체가 PK).

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| user_id | uuid | PK, FK → `profiles(id)` CASCADE | |
| ai_model | text | NOT NULL, default `'claude-sonnet-4-6'` | |
| storage_mode | `storage_mode` | NOT NULL, default `'cloud'` | enum: local/cloud |
| theme_mode | `theme_mode` | NOT NULL, default `'system'` | enum: light/dark/system |
| is_auto_tag_enabled | boolean | NOT NULL, default `true` | T1 자동 호출 on/off |
| updated_at | timestamptz | default `now()`, trigger | |

- `created_at` 없음: 사용자 생성 시점에 동시 insert 되므로 `profiles.created_at` 으로 대체
- Enum: `storage_mode`, `theme_mode`
- 트리거: `trg_user_settings_updated_at`
- RLS: ENABLED

---

## 공통 규칙

- 모든 FK: `on delete cascade` (사용자 삭제 → 소유 데이터 전체 정리, 프로젝트 삭제 → 분석/junction 정리)
- 모든 `id`: uuid. serial/bigserial 사용 안함
- 모든 timestamp: `timestamptz` (서버는 UTC, 클라이언트가 로케일 변환)
- 삭제 정책: **hard delete** (soft delete 미도입 — 초기 단계라 단순성 우선)

## 트리거 목록

| 트리거 | 테이블 | 함수 | 시점 |
|-------|------|------|------|
| `trg_profiles_updated_at` | profiles | `set_updated_at()` | BEFORE UPDATE |
| `trg_reference_items_updated_at` | reference_items | 〃 | 〃 |
| `trg_projects_updated_at` | projects | 〃 | 〃 |
| `trg_analysis_results_updated_at` | analysis_results | 〃 | 〃 |
| `trg_user_settings_updated_at` | user_settings | 〃 | 〃 |

Phase 2 추가 예정: `on_auth_user_created` (auth.users INSERT → profiles + user_settings 자동 생성)

## Enum 목록

| Enum | 값 | 사용처 |
|------|---|------|
| `project_type` | landing, dashboard, mobile, brand | projects.type |
| `analysis_status` | pending, running, done, error | analysis_results.status |
| `storage_mode` | local, cloud | user_settings.storage_mode |
| `theme_mode` | light, dark, system | user_settings.theme_mode |

## 적용 확인

```bash
supabase migration list --linked
# → Local 20260423092055 ↔ Remote 20260423092055 동기화 확인됨 (2026-04-23 09:20:55 UTC)
```

## 다음 스텝

- **Phase 2**: `handle_new_user` 트리거 — auth.users INSERT 시 profiles + user_settings 자동 생성. Supabase Auth Dashboard 설정 (Email+Password, email confirmation)
- **Phase 3**: RLS 정책 부착 (owner-only 전반 + `is_project_owner()` helper)
