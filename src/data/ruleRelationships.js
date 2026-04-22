/**
 * 프로젝트 룰 관계 데이터 (자동 생성)
 *
 * 이 파일은 scripts/generate-rules.js 에 의해 자동 생성됩니다.
 * 직접 수정하지 마세요. 수정이 필요하면 스크립트를 수정하세요.
 *
 * 생성: pnpm generate-rules
 * 생성일: 2026-04-15
 */

export const priorityMeta = {
  root: { color: '#000000', label: 'Root', order: 0 },
  CRITICAL: { color: '#D32F2F', label: '절대 위반 불가', order: 1 },
  MUST: { color: '#ED6C02', label: '반드시 준수', order: 2 },
  SHOULD: { color: '#0288D1', label: '관련 작업 시 준수', order: 3 },
  Skill: { color: '#7B1FA2', label: 'Skill (의도 기반 활성화)', order: 4 },
  'Skill Resource': { color: '#9E9E9E', label: 'Skill Resource (on-demand)', order: 5 },
};

export const ruleNodes = [
  {
    "id": "claude-md",
    "name": "CLAUDE.md",
    "priority": "root",
    "path": "CLAUDE.md",
    "description": "프로젝트 규칙 진입점 (라우터 역할)"
  },
  {
    "id": "code-convention",
    "name": "code-convention.md",
    "priority": "MUST",
    "path": ".claude/rules/code-convention.md",
    "description": "JavaScript + React.js 코드 작성 규칙"
  },
  {
    "id": "design-system",
    "name": "design-system.md",
    "priority": "MUST",
    "path": ".claude/rules/design-system.md",
    "description": "새로운 컴포넌트를 만들기 전에 반드시 기존 컴포넌트로 대체 가능한지 확인하고, 가능하면 최대한 재활용해라. 불필요한 중복 컴포넌트 생성을 피해야 함."
  },
  {
    "id": "directory-structure",
    "name": "directory-structure.md",
    "priority": "MUST",
    "path": ".claude/rules/directory-structure.md",
    "description": "파일/컴포넌트 생성 시 반드시 아래 구조를 따른다."
  },
  {
    "id": "mui-grid-usage",
    "name": "mui-grid-usage.md",
    "priority": "CRITICAL",
    "path": ".claude/rules/mui-grid-usage.md",
    "description": "```jsx"
  },
  {
    "id": "component-work",
    "name": "component-work (Skill)",
    "priority": "Skill",
    "path": ".claude/skills/component-work/SKILL.md",
    "description": "Creates, modifies, deletes UI components and their Storybook stories. Manages component taxonomy, design tokens, and interactive patterns for MUI-based design system."
  },
  {
    "id": "component-work--components",
    "name": "components.md",
    "priority": "Skill Resource",
    "path": ".claude/skills/component-work/resources/components.md",
    "description": "Vibe Dictionary 텍소노미 v0.4 기반 분류. 번호는 텍소노미 카테고리 번호."
  },
  {
    "id": "component-work--interactive-principles",
    "name": "interactive-principles.md",
    "priority": "Skill Resource",
    "path": ".claude/skills/component-work/resources/interactive-principles.md",
    "description": "> 기존 디자인 시스템 위에서 인터랙티브 컴포넌트 설계 시 따라야 할 원칙"
  },
  {
    "id": "component-work--mui-theme",
    "name": "mui-theme.md",
    "priority": "Skill Resource",
    "path": ".claude/skills/component-work/resources/mui-theme.md",
    "description": "MUI 커스텀 테마 설정 규칙"
  },
  {
    "id": "component-work--project-summary",
    "name": "project-summary.md",
    "priority": "Skill Resource",
    "path": ".claude/skills/component-work/resources/project-summary.md",
    "description": "**Starter Kit Basic**은 React + MUI + Storybook 환경을 디자이너에게 마치 디자인 툴처럼 사용할 수 있도록 도와주는 개발 환경입니다."
  },
  {
    "id": "component-work--refactoring-guide",
    "name": "refactoring-guide.md",
    "priority": "Skill Resource",
    "path": ".claude/skills/component-work/resources/refactoring-guide.md",
    "description": "> 리팩토링 작업 시 준수해야 할 가이드."
  },
  {
    "id": "component-work--storybook-writing",
    "name": "storybook-writing.md",
    "priority": "Skill Resource",
    "path": ".claude/skills/component-work/resources/storybook-writing.md",
    "description": "Storybook 스토리 작성 시 준수해야 할 규칙"
  },
  {
    "id": "component-work--taxonomy-index",
    "name": "taxonomy-index.md",
    "priority": "Skill Resource",
    "path": ".claude/skills/component-work/resources/taxonomy-index.md",
    "description": "> 전체 분류체계 빠른 참조용 인덱스"
  },
  {
    "id": "component-work--taxonomy-v0-4",
    "name": "taxonomy-v0.4.md",
    "priority": "Skill Resource",
    "path": ".claude/skills/component-work/resources/taxonomy-v0.4.md",
    "description": "---"
  },
  {
    "id": "convert-external",
    "name": "convert-external (Skill)",
    "priority": "Skill",
    "path": ".claude/skills/convert-external/SKILL.md",
    "description": "Converts external code (TypeScript, Tailwind, styled-components) into project-compliant MUI sx-based JSX components. Handles type removal, style migration, and taxonomy classification."
  },
  {
    "id": "convert-external--conversion-checklist",
    "name": "conversion-checklist.md",
    "priority": "Skill Resource",
    "path": ".claude/skills/convert-external/resources/conversion-checklist.md",
    "description": "> 외부 코드 분석 시 감지해야 할 항목과 변환 규칙"
  },
  {
    "id": "project-planning",
    "name": "project-planning (Skill)",
    "priority": "Skill",
    "path": ".claude/skills/project-planning/SKILL.md",
    "description": "Creates structured planning documents (project-summary, ux-flow, visual-direction) in docs/ for new feature or project initiatives."
  },
  {
    "id": "project-planning--doc-templates",
    "name": "doc-templates.md",
    "priority": "Skill Resource",
    "path": ".claude/skills/project-planning/resources/doc-templates.md",
    "description": "> 각 Phase에서 문서 작성 시 이 템플릿의 구조를 따른다."
  },
  {
    "id": "rule-visualization",
    "name": "rule-visualization (Skill)",
    "priority": "Skill",
    "path": ".claude/skills/rule-visualization/SKILL.md",
    "description": "Syncs ruleRelationships.js data with actual .claude/ file structure and updates Storybook rule visualization. Run pnpm generate-rules instead for automated sync."
  }
];

export const edgeTypes = {
  loads: { label: '자동 로드', style: 'solid' },
  references: { label: '텍스트 참조', style: 'dashed' },
  conditional: { label: '조건부 참조', style: 'dotted' },
  activates: { label: '의도 기반 활성화', style: 'solid' },
  resources: { label: 'on-demand Read', style: 'dashed' },
};

export const ruleEdges = [
  {
    "from": "claude-md",
    "to": "code-convention",
    "type": "loads"
  },
  {
    "from": "claude-md",
    "to": "design-system",
    "type": "loads"
  },
  {
    "from": "claude-md",
    "to": "directory-structure",
    "type": "loads"
  },
  {
    "from": "claude-md",
    "to": "mui-grid-usage",
    "type": "loads"
  },
  {
    "from": "claude-md",
    "to": "component-work",
    "type": "activates",
    "note": ""
  },
  {
    "from": "component-work",
    "to": "component-work--components",
    "type": "resources",
    "note": ""
  },
  {
    "from": "component-work",
    "to": "component-work--interactive-principles",
    "type": "resources",
    "note": ""
  },
  {
    "from": "component-work",
    "to": "component-work--mui-theme",
    "type": "resources",
    "note": ""
  },
  {
    "from": "component-work",
    "to": "component-work--project-summary",
    "type": "resources",
    "note": ""
  },
  {
    "from": "component-work",
    "to": "component-work--refactoring-guide",
    "type": "resources",
    "note": ""
  },
  {
    "from": "component-work",
    "to": "component-work--storybook-writing",
    "type": "resources",
    "note": ""
  },
  {
    "from": "component-work",
    "to": "component-work--taxonomy-index",
    "type": "resources",
    "note": ""
  },
  {
    "from": "component-work",
    "to": "component-work--taxonomy-v0-4",
    "type": "resources",
    "note": ""
  },
  {
    "from": "claude-md",
    "to": "convert-external",
    "type": "activates",
    "note": ""
  },
  {
    "from": "convert-external",
    "to": "convert-external--conversion-checklist",
    "type": "resources",
    "note": ""
  },
  {
    "from": "claude-md",
    "to": "project-planning",
    "type": "activates",
    "note": ""
  },
  {
    "from": "project-planning",
    "to": "project-planning--doc-templates",
    "type": "resources",
    "note": ""
  },
  {
    "from": "claude-md",
    "to": "rule-visualization",
    "type": "activates",
    "note": ""
  }
];

export const conditionMatrix = [
  {
    "task": "컴포넌트 생성",
    "rules": [
      "code-convention",
      "design-system"
    ],
    "skill": "component-work",
    "skillResources": [
      "component-work--taxonomy-index",
      "component-work--storybook-writing"
    ]
  },
  {
    "task": "컴포넌트 수정",
    "rules": [
      "code-convention",
      "design-system"
    ],
    "skill": "component-work",
    "skillResources": [
      "component-work--storybook-writing"
    ]
  },
  {
    "task": "컴포넌트 삭제",
    "rules": [],
    "skill": "component-work"
  },
  {
    "task": "인터랙티브 컴포넌트",
    "rules": [
      "code-convention",
      "design-system"
    ],
    "skill": "component-work",
    "skillResources": [
      "component-work--taxonomy-index",
      "component-work--interactive-principles",
      "component-work--storybook-writing"
    ]
  },
  {
    "task": "스토리 작성/수정",
    "rules": [],
    "skill": "component-work",
    "skillResources": [
      "component-work--storybook-writing"
    ]
  },
  {
    "task": "외부 코드 변환",
    "rules": [
      "code-convention",
      "design-system"
    ],
    "skill": "convert-external",
    "skillResources": [
      "convert-external--conversion-checklist"
    ]
  },
  {
    "task": "리팩토링",
    "rules": [
      "code-convention"
    ],
    "skill": "component-work",
    "skillResources": [
      "component-work--refactoring-guide"
    ]
  },
  {
    "task": "테마/스타일 수정",
    "rules": [
      "design-system"
    ],
    "skillResources": [
      "component-work--mui-theme"
    ]
  },
  {
    "task": "Grid 사용",
    "rules": [
      "mui-grid-usage"
    ]
  }
];
