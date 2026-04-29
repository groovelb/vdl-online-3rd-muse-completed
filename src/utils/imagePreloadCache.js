/**
 * imagePreloadCache
 *
 * 라우트 이동 시 <img> DOM 이 unmount → remount 되며 발생하는
 * "이미지가 다시 깜빡이며 채워지는" 현상을 방지하기 위한 클라이언트 메모리 캐시.
 *
 * 동작:
 * - module-level Map<url, HTMLImageElement> 에 Image 객체를 보관해 GC 를 막는다.
 * - 같은 URL 이 다음 라우트의 <img src=...> 에 다시 들어오면 브라우저 메모리 캐시에서
 *   즉시 디코드된 픽셀이 그려져 빈 프레임 없이 보인다.
 * - HTTP Cache-Control(7일) 과 직교: 이건 새로고침 후 disk cache, 이건 SPA 세션 내 memory cache.
 *
 * 사용:
 *   preloadImage(url)      // 단일 URL
 *   preloadImages(urls[])  // 배열 — 이미 캐시된 URL 은 무시
 *   evictUnused(active)    // active 외 항목 메모리 해제
 */

const cache = new Map(); // url → HTMLImageElement

export function preloadImage(url) {
  if (!url) return null;
  const cached = cache.get(url);
  if (cached) return cached;
  const img = new Image();
  img.decoding = 'async';
  img.src = url;
  cache.set(url, img);
  return img;
}

export function preloadImages(urls) {
  if (!urls) return;
  urls.forEach((u) => preloadImage(u));
}

export function evictUnused(activeUrls) {
  const active = new Set(activeUrls || []);
  for (const url of cache.keys()) {
    if (!active.has(url)) cache.delete(url);
  }
}

export function getImagePreloadCacheSize() {
  return cache.size;
}
