/**
 * MUSE Data Schemas (JSDoc Types)
 *
 * `docs/muse/02-ux-flow.md` 의 데이터 모델 섹션을 JSDoc typedef로 옮긴 정의.
 * 런타임 객체는 없고 IDE 자동완성/호버 정보 제공용 참조 파일.
 *
 * 2026-04-22 v2: keyVisual 레이어 제거, visualDirection(Markdown) 레이어 추가.
 *   - Reference.tags: flat string[] → 레이어별 중첩 구조
 *   - AnalysisLayers: 5번째 레이어를 keyVisual(이미지) → visualDirection(md)로 교체
 */

/**
 * @typedef {Object} ReferenceLayeredTags
 * @property {string[]} color         - preset.layers.color에서 0~3개
 * @property {string[]} typography    - preset.layers.typography에서 0~3개
 * @property {string[]} layout        - preset.layers.layout에서 0~3개
 * @property {string[]} gradient      - preset.layers.gradient에서 0~3개
 * @property {{genre: string[], style: string[], subject: string[]}} visualDirection - 서브카테고리별 0~2개
 */

/**
 * @typedef {Object} ExtractedPaletteItem
 * @property {string} hex - #RRGGBB
 * @property {string} label - 1-2 word descriptor
 * @property {'Brand'|'Surface'|'Data'|'Neutral'} [group] - 단일 이미지 관점 힌트 (role 아님)
 */

/**
 * @typedef {Object} ExtractedTypographyItem
 * @property {'display'|'heading'|'body'|'caption'} hierarchy - 단일 이미지 내 상대 위계
 * @property {string} fontFamily - CSS stack
 * @property {number} fontWeight - 100-900
 * @property {string} fontSize - CSS value
 * @property {number} lineHeight - unitless
 * @property {string} [letterSpacing] - em value
 * @property {string} [sampleText] - 실제 보이는 텍스트 스니펫
 */

/**
 * @typedef {Object} ExtractedLayoutItem
 * @property {'grid'|'spacing'|'container'} kind
 * @property {number} [columns]
 * @property {number} [gap]
 * @property {number} [px]
 * @property {number} [ratio]
 * @property {string} [maxWidth]
 */

/**
 * @typedef {Object} ExtractedGradientItem
 * @property {string} gradient - CSS gradient string
 * @property {Array<{offset: number, color: string}>} stops
 */

/**
 * @typedef {Object} ExtractedValues
 * @property {ExtractedPaletteItem[]} palette - 3~6 관찰된 색
 * @property {ExtractedTypographyItem[]} typography - 1~4 위계별 타이포 스펙
 * @property {ExtractedLayoutItem[]} layout - 0~3 레이아웃 힌트
 * @property {ExtractedGradientItem[]} gradient - 0~2 그라디언트
 */

/**
 * @typedef {Object} Reference
 * @property {string} id - 고유 식별자 (예: 'ref-001')
 * @property {'file'|'url'} source - 입력 소스 유형
 * @property {string} thumbnailUrl - 썸네일 URL 또는 data URI
 * @property {ReferenceLayeredTags} tags - 레이어별 태그 (preset 어휘에서만 선택)
 * @property {string[]} [dominantColors] - 대표 색 HEX (선택)
 * @property {ExtractedValues} [extracted] - T1 에서 추출한 T3-level 관찰값 (role/emphasis 제외)
 * @property {string} createdAt - ISO 날짜 문자열
 * @property {string} [title] - 제목 (선택)
 */

/**
 * @typedef {'landing'|'dashboard'|'mobile'|'brand'} ProjectType
 */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} name
 * @property {string} intent
 * @property {ProjectType} type
 * @property {string[]} referenceIds
 * @property {string} createdAt
 */

/**
 * @typedef {0|1|2} Emphasis
 */

/**
 * @typedef {Object} ColorToken
 * @property {string} id
 * @property {string} label
 * @property {string} hex
 * @property {'primary'|'secondary'|'accent'|'neutral'} [role]
 * @property {string} [group]
 * @property {boolean} isEnabled
 * @property {Emphasis} emphasis
 * @property {string[]} [sourceReferenceIds]
 */

/**
 * @typedef {Object} TypographyToken
 * @property {string} id
 * @property {string} label
 * @property {string} [variant]
 * @property {string} fontFamily
 * @property {number} fontWeight
 * @property {string} fontSize
 * @property {number} [lineHeight]
 * @property {string} [letterSpacing]
 * @property {string} [sampleText]
 * @property {boolean} isEnabled
 * @property {Emphasis} emphasis
 */

/**
 * @typedef {Object} LayoutToken
 * @property {string} id
 * @property {string} label
 * @property {'grid'|'spacing'|'container'} kind
 * @property {number} [columns]
 * @property {number} [gap]
 * @property {number} [px]
 * @property {number} [ratio]
 * @property {string} [maxWidth]
 * @property {boolean} isEnabled
 * @property {Emphasis} emphasis
 */

/**
 * @typedef {Object} GradientToken
 * @property {string} id
 * @property {string} label
 * @property {string} gradient
 * @property {Array<{offset:number,color:string}>} [stops]
 * @property {boolean} isEnabled
 * @property {Emphasis} emphasis
 */

/**
 * @typedef {Object} VisualDirectionLayer
 * @property {string} markdown - visual_direction_template.md 포맷으로 채워진 MD 문자열
 * @property {{genre: string[], style: string[], subject: string[]}} [tags] - 집계된 preset 태그
 */

/**
 * @typedef {Object} AnalysisLayers
 * @property {ColorToken[]} color
 * @property {TypographyToken[]} typography
 * @property {LayoutToken[]} layout
 * @property {GradientToken[]} gradient
 * @property {VisualDirectionLayer} visualDirection - Markdown 서술 + 태그 집계
 */

/**
 * @typedef {Object} AnalysisResult
 * @property {string} id
 * @property {string} projectId
 * @property {AnalysisLayers} layers
 * @property {'pending'|'running'|'done'|'error'} status
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} UserSettings
 * @property {string} aiModel
 * @property {'local'|'cloud'} storageMode
 * @property {'light'|'dark'|'system'} themeMode
 * @property {boolean} isAutoTagEnabled
 */

export {};
