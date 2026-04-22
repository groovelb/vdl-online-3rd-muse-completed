/**
 * serializeTheme
 *
 * theme-like 객체를 MUI `createTheme` 용 JS 소스 문자열로 직렬화.
 * - 함수, Symbol, undefined는 제외
 * - 문자열은 single quote, 숫자/불리언은 그대로
 * - key가 JS 식별자로 유효하면 따옴표 없이, 아니면 quoted
 *
 * @param {object} themeObject - 직렬화할 theme 객체
 * @param {object} options
 * @param {boolean} options.asCreateThemeCall - createTheme(...) 호출 형태로 감쌀지 [기본값: true]
 * @returns {string} JS 소스 문자열
 */
export function serializeTheme(themeObject, { asCreateThemeCall = true } = {}) {
  const body = stringifyValue(themeObject, 0);
  if (!asCreateThemeCall) {
    return body;
  }
  return [
    "import { createTheme } from '@mui/material/styles';",
    '',
    `const theme = createTheme(${body});`,
    '',
    'export default theme;',
  ].join('\n');
}

const IDENT_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const INDENT = '  ';

function stringifyValue(value, depth) {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'function' || typeof value === 'symbol') return undefined;
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'string') return stringifyString(value);
  if (Array.isArray(value)) return stringifyArray(value, depth);
  if (typeof value === 'object') return stringifyObject(value, depth);
  return undefined;
}

function stringifyString(s) {
  // single quote 기반, 내부 single quote는 escape
  return `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

function stringifyKey(key) {
  if (IDENT_RE.test(key)) return key;
  return stringifyString(key);
}

function stringifyObject(obj, depth) {
  const entries = Object.entries(obj)
    .map(([k, v]) => {
      const valueStr = stringifyValue(v, depth + 1);
      if (valueStr === undefined) return null;
      return `${INDENT.repeat(depth + 1)}${stringifyKey(k)}: ${valueStr}`;
    })
    .filter(Boolean);
  if (!entries.length) return '{}';
  return `{\n${entries.join(',\n')},\n${INDENT.repeat(depth)}}`;
}

function stringifyArray(arr, depth) {
  const items = arr
    .map((v) => stringifyValue(v, depth + 1))
    .filter((v) => v !== undefined);
  if (!items.length) return '[]';
  const inlineThreshold = 6;
  const isAllPrimitive = items.every((i) => !i.includes('\n'));
  if (isAllPrimitive && items.length <= inlineThreshold) {
    return `[${items.join(', ')}]`;
  }
  return `[\n${items.map((i) => `${INDENT.repeat(depth + 1)}${i}`).join(',\n')},\n${INDENT.repeat(depth)}]`;
}
