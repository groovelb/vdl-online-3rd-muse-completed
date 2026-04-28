# cli-test input.json 스키마

## 형식

```json
{
  "projectName": "<프로젝트 이름>",
  "intent": "<프로젝트 한 줄 의도>",
  "refs": [
    {
      "id": "<UUID — supabase reference_items.id>",
      "note": "<사용자 활용 노트 verbatim>",
      "useLayers": ["color", "typography", ...]
    }
  ]
}
```

## 필드 상세

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `projectName` | string | ✅ | 프로젝트 표시 이름. 빈 값 불가 — 사용자에게 1번 확인 |
| `intent` | string | ✅ | 한 줄 의도. wizard Step 1 의 intent 와 동일 |
| `refs` | Array | ✅ | 1+ ref. 0 개면 에러 |
| `refs[].id` | string (UUID) | ✅ | supabase reference_items.id 와 정확 매치 (T1 처리된 ref) |
| `refs[].note` | string | ⭕ | 사용자 활용 노트 verbatim. 빈 노트면 `""`. 의역 금지 |
| `refs[].useLayers` | string[] | ⭕ | TP4 chip 선택. `["color"]` 등. 자동(전체)이면 `[]` |

## 사용자 채팅 input → input.json 정제 가이드

사용자가 채팅에 UI 복붙 또는 자연어 input 줄 때 Claude 가 정제하는 룰:

1. **projectName**: "프로젝트 타이틀 / 프로젝트 이름 / project name" 라벨 후 콜론 또는 줄바꿈 → 그 다음 텍스트
2. **intent**: "한줄설명 / 의도 / intent / 요약" 라벨 후 텍스트
3. **refs**: ref 별 블록 분리. 보통 다음 패턴:
   - 첫 줄: title (사용자 표시명, 무시 가능 — supabase 에서 가져옴)
   - UUID 한 줄
   - "차용 layer:" 또는 "useLayers:" 줄 — 자동(전체) / [color, typography] 식
   - bullet ` - ` 로 시작하는 노트 줄 (여러 줄 가능, `\n` 으로 합침)
   - 점수 (`78/100` 등) — input.json 에 포함하지 않음 (코드 미사용)

## 예시

사용자 채팅 input:

```
프로젝트 타이틀: retro mood dashboard
한줄설명: functional dashboard with retro mood and paper texture

Grainy Ethereal Gradient
248c3094-8bca-47b7-9d2f-c65dd51081bf
차용 layer: 자동 (전체)
- use retro style paper grained background with fixed position
- paper texture
78 / 100

Typographic Weight Specimen
88fd6205-e3d4-4cd2-9748-65941efcfaf5
차용 layer: 자동 (전체)
- bold & contrast typography Hierarchy
38 / 100

Minimalist Dashboard Structure
6c113186-bbca-4010-9250-38e1a087f1ce
차용 layer: 자동 (전체)
- Editorial Dashboard Layout
- blend grid and gradient background
65 / 100
```

→ 정제된 input.json:

```json
{
  "projectName": "retro mood dashboard",
  "intent": "functional dashboard with retro mood and paper texture",
  "refs": [
    {
      "id": "248c3094-8bca-47b7-9d2f-c65dd51081bf",
      "note": "use retro style paper grained background with fixed position\n- paper texture",
      "useLayers": []
    },
    {
      "id": "88fd6205-e3d4-4cd2-9748-65941efcfaf5",
      "note": "bold & contrast typography Hierarchy",
      "useLayers": []
    },
    {
      "id": "6c113186-bbca-4010-9250-38e1a087f1ce",
      "note": "Editorial Dashboard Layout\n- blend grid and gradient background",
      "useLayers": []
    }
  ]
}
```

## ⚠️ Claude 가 자주 실수하는 부분

- 점수 (`78/100`) 를 input 에 넣지 말 것 (코드가 안 씀)
- title 을 input.refs 에 넣을 필요 없음 (supabase 에서 fetch)
- `note` 안에 사용자가 적은 `-` bullet markdown 그대로 보존 (의역 X)
- `useLayers` 가 "자동(전체)" 이면 `[]` (빈 배열). `["all"]` 같은 string 금지
