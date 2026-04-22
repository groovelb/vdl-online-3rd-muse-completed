/**
 * MUSE Data Schemas (JSDoc Types)
 *
 * `docs/muse/02-ux-flow.md` 의 데이터 모델 섹션을 그대로 JSDoc typedef로 옮긴 정의.
 * 런타임에 사용되는 객체는 없고, IDE 자동완성/추론용 참조 파일.
 */

/**
 * @typedef {Object} Reference
 * @property {string} id - 고유 식별자 (예: 'ref-001')
 * @property {'file'|'url'} source - 입력 소스 유형
 * @property {string} thumbnailUrl - 썸네일 URL 또는 data URI
 * @property {string[]} tags - AI 자동/수동 태그
 * @property {string[]} [dominantColors] - 대표 색 HEX (선택)
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
 * @property {string} intent - 한 문장 의도
 * @property {ProjectType} type
 * @property {string[]} referenceIds - 연결된 Reference id 배열
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
 * @property {string} [variant] - h1/h2/body1 등 MUI variant 키
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
 * @property {number} [columns] - grid
 * @property {number} [gap] - grid
 * @property {number} [px] - spacing
 * @property {number} [ratio] - container (0~1)
 * @property {string} [maxWidth] - container
 * @property {boolean} isEnabled
 * @property {Emphasis} emphasis
 */

/**
 * @typedef {Object} GradientToken
 * @property {string} id
 * @property {string} label
 * @property {string} gradient - CSS gradient 문자열
 * @property {Array<{offset:number,color:string}>} [stops]
 * @property {boolean} isEnabled
 * @property {Emphasis} emphasis
 */

/**
 * @typedef {Object} KeyVisualItem
 * @property {string} id
 * @property {string} thumbnailUrl
 * @property {string} [caption]
 * @property {boolean} isEnabled
 * @property {Emphasis} emphasis
 */

/**
 * @typedef {Object} AnalysisLayers
 * @property {ColorToken[]} color
 * @property {TypographyToken[]} typography
 * @property {LayoutToken[]} layout
 * @property {GradientToken[]} gradient
 * @property {KeyVisualItem[]} keyVisual
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
