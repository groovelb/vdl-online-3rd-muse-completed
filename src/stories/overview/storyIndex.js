/**
 * 스토리 title 로 스토리북 주소를 만든다.
 *
 * 모든 `*.stories.jsx` 원문을 읽어 title 과 첫 스토리 이름을 뽑는다. 모듈을 실행하지 않고
 * 정규식만 쓰므로 부작용이 없고, 스토리를 더 만들면 목록이 저절로 따라온다.
 * id 규칙은 스토리북의 sanitize 와 같다: 소문자로 낮추고 알파벳과 숫자가 아닌 것을 `-` 로 바꾼 뒤
 * 연속된 `-` 를 하나로 줄이고 양끝을 떼어 낸다.
 */

const sources = import.meta.glob('../../**/*.stories.jsx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

/** MDX 문서 래퍼는 `<Meta title="..." />` 로 title 을 적는다 */
const docSources = import.meta.glob('../../**/*.mdx', {
  eager: true,
  query: '?raw',
  import: 'default',
});

/** 스토리북과 같은 규칙으로 id 조각을 만든다 */
export const sanitize = (value) => String(value)
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/-+/g, '-')
  .replace(/^-|-$/g, '');

/** title 문자열 → `{ componentId, storyId }` */
export const storyIdByTitle = Object.values(sources).reduce((acc, src) => {
  const title = (src.match(/title:\s*'([^']*)'/) || [])[1];
  if (!title) return acc;
  const first = (src.match(/export const (\w+)\s*=/) || [])[1];
  const componentId = sanitize(title);
  acc[title] = {
    componentId,
    storyId: first ? `${componentId}--${sanitize(first)}` : null,
  };
  return acc;
}, {});

/** MDX 문서 페이지는 story 가 아니라 docs 주소를 쓴다 */
export const docIdByTitle = Object.values(docSources).reduce((acc, src) => {
  const title = (src.match(/<Meta\s+title="([^"]*)"/) || [])[1];
  if (title) acc[title] = sanitize(title);
  return acc;
}, {});

/**
 * title 로 스토리북 주소를 만든다. 없는 title 이면 null.
 *
 * @param {string} title - 스토리북 title 문자열
 * @returns {string|null} `?path=/story/...` 주소
 */
export const storyLink = (title) => {
  const entry = storyIdByTitle[title];
  if (entry && entry.storyId) return `?path=/story/${entry.storyId}`;
  const docId = docIdByTitle[title];
  if (docId) return `?path=/docs/${docId}--docs`;
  return null;
};
