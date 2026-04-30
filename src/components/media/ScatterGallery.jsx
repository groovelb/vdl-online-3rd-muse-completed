import { useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * ScatterGallery 컴포넌트
 *
 * 이미지를 컨테이너 전체에 흩뿌리는 2D 무드보드형 갤러리.
 * - 분포 알고리즘: jittered grid + seeded RNG (deterministic)
 * - 인터랙션: 커서 반경 안에 있는 썸네일만 inverse-distance 만큼 시프트
 * - hover 시: 해당 이미지가 컨테이너 배경에 blur fill 로 깔림 (옵션)
 *
 * Props:
 * @param {string[]} images - 이미지 URL 배열 [Required]
 * @param {number} cursorRadius - 마우스 영향 반경(px) [Optional, 기본값: 220]
 * @param {number} maxShift - 최대 시프트(px) — 거리 0일 때의 이동 [Optional, 기본값: 14]
 * @param {number} seed - 분포 시드 (동일하면 동일한 배치) [Optional, 기본값: 42]
 * @param {number} gridCols - jittered grid 열 [Optional, 기본값: 6]
 * @param {number} gridRows - jittered grid 행 [Optional, 기본값: 5]
 * @param {number} thumbnailMin - 썸네일 최소 한 변(px) [Optional, 기본값: 64]
 * @param {number} thumbnailMax - 썸네일 최대 한 변(px) [Optional, 기본값: 132]
 * @param {boolean} hasBackdrop - hover 시 배경 blur fill 여부 [Optional, 기본값: true]
 * @param {number} centerKeepout - 중앙 보호 반경(px). 이 안에는 썸네일 배치 안 됨 [Optional, 기본값: 0]
 * @param {boolean} hasTooltip - hover 시 추출 토큰(컬러) 툴팁 [Optional, 기본값: false]
 * @param {number} tooltipDelay - 툴팁 진입 delay(ms) [Optional, 기본값: 200]
 * @param {Object<string,{title?:string,colors?:string[],tags?:string[]}>} tokensBySrc - 정적 토큰 매핑 (override) [Optional]
 * @param {node} children - 중앙 오버레이 슬롯 (로고 등) [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <ScatterGallery images={ urls } seed={ 7 } centerKeepout={ 240 }>
 *   <Logo />
 * </ScatterGallery>
 */
export function ScatterGallery({
  images,
  cursorRadius = 220,
  maxShift = 14,
  seed = 42,
  gridCols = 6,
  gridRows = 5,
  thumbnailMin = 48,
  thumbnailMax = 96,
  hasBackdrop = true,
  centerKeepout = 0,
  hasTooltip = false,
  tooltipDelay = 200,
  tokensBySrc,
  children,
  sx,
}) {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hoverIdx, setHoverIdx] = useState(-1);
  const [lastHoverSrc, setLastHoverSrc] = useState(null);
  const [tooltipIdx, setTooltipIdx] = useState(-1);
  const [hoverColors, setHoverColors] = useState(null);
  const tooltipTimerRef = useRef(0);

  /* container size 추적 */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* deterministic 분포 — seed + container size 변경 시만 재계산 */
  const placements = useMemo(() => {
    if (!size.w || !size.h || !images?.length) return [];
    const rng = mulberry32(seed);
    const cellW = size.w / gridCols;
    const cellH = size.h / gridRows;
    const cx = size.w / 2;
    const cy = size.h / 2;
    const out = [];

    for (let row = 0; row < gridRows; row += 1) {
      for (let col = 0; col < gridCols; col += 1) {
        const idx = out.length;
        if (idx >= images.length) break;
        // cell 내에서 random offset (가장자리 padding 12%)
        const pad = 0.12;
        const jx = pad + rng() * (1 - pad * 2);
        const jy = pad + rng() * (1 - pad * 2);
        const x = col * cellW + jx * cellW;
        const y = row * cellH + jy * cellH;
        // 중앙 keepout
        if (centerKeepout > 0) {
          const dx = x - cx;
          const dy = y - cy;
          if (Math.hypot(dx, dy) < centerKeepout) continue;
        }
        const sz = thumbnailMin + rng() * (thumbnailMax - thumbnailMin);
        const src = images[idx % images.length];
        out.push({
          src,
          x: x - sz / 2,
          y: y - sz / 2,
          size: sz,
          // idle phase
          phase: rng() * Math.PI * 2,
          phaseSpeed: 0.6 + rng() * 0.6,
          phaseAmp: 2 + rng() * 4,
        });
      }
    }
    return out;
  }, [size.w, size.h, images, seed, gridCols, gridRows, thumbnailMin, thumbnailMax, centerKeepout]);

  /* hover 중인 idx 를 ref 로 ㄱ도 유지 (RAF 안에서 최신값 읽기) */
  const hoverIdxRef = useRef(-1);
  useEffect(() => { hoverIdxRef.current = hoverIdx; }, [hoverIdx]);

  /* 마우스 parallax — DOM transform 직조작 (re-render 회피)
   * hover 된 썸네일은 일체 변형 안 시킴 (transform: none) — 끊김 방지 */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let raf = 0;
    let mx = -9999;
    let my = -9999;
    let active = true;

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
    };
    const onLeave = () => { mx = -9999; my = -9999; };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);

    // 현재 보간된 위치 — 매 frame target 으로 lerp
    const cur = placements.map(() => ({ dx: 0, dy: 0 }));
    const lerp = 0.15;

    const tick = () => {
      if (!active) return;
      const hovered = hoverIdxRef.current;
      placements.forEach((p, i) => {
        const node = itemRefs.current[i];
        if (!node) return;
        let tx = 0;
        let ty = 0;
        // hover 중인 썸네일 — target 0 (시프트 멈춤)
        if (i !== hovered && mx > -9000) {
          const cx = p.x + p.size / 2;
          const cy = p.y + p.size / 2;
          const ddx = cx - mx;
          const ddy = cy - my;
          const dist = Math.hypot(ddx, ddy);
          if (dist < cursorRadius) {
            const k = (1 - dist / cursorRadius) * maxShift;
            const inv = dist === 0 ? 0 : 1 / dist;
            tx = ddx * inv * k;
            ty = ddy * inv * k;
          }
        }
        cur[i].dx += (tx - cur[i].dx) * lerp;
        cur[i].dy += (ty - cur[i].dy) * lerp;
        node.style.transform = `translate3d(${cur[i].dx}px, ${cur[i].dy}px, 0)`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [placements, cursorRadius, maxShift]);

  const hoverSrc = hoverIdx >= 0 ? placements[hoverIdx]?.src : null;

  // hover 떠난 뒤에도 마지막 이미지를 유지 — opacity 0 으로 fade out 되는 동안 image 안 사라지게
  useEffect(() => {
    if (hoverSrc) setLastHoverSrc(hoverSrc);
  }, [hoverSrc]);

  // tooltip delay — hover 200ms 유지되면 띄움
  useEffect(() => {
    if (!hasTooltip) return undefined;
    if (hoverIdx < 0) {
      setTooltipIdx(-1);
      setHoverColors(null);
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
        tooltipTimerRef.current = 0;
      }
      return undefined;
    }
    tooltipTimerRef.current = window.setTimeout(() => {
      setTooltipIdx(hoverIdx);
    }, tooltipDelay);
    return () => {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    };
  }, [hoverIdx, hasTooltip, tooltipDelay]);

  // tooltip src 결정 + 토큰 lookup / 색 추출
  const tooltipSrc = tooltipIdx >= 0 ? placements[tooltipIdx]?.src : null;
  const tooltipStatic = tooltipSrc ? tokensBySrc?.[tooltipSrc] : null;
  useEffect(() => {
    if (!tooltipSrc) { setHoverColors(null); return; }
    if (tooltipStatic?.colors?.length) { setHoverColors(tooltipStatic.colors); return; }
    let cancelled = false;
    extractDominantColors(tooltipSrc, 5).then((cols) => {
      if (!cancelled) setHoverColors(cols);
    });
    return () => { cancelled = true; };
  }, [tooltipSrc, tooltipStatic]);

  const tooltipPlacement = tooltipIdx >= 0 ? placements[tooltipIdx] : null;
  const tooltipPos = useMemo(() => {
    if (!tooltipPlacement || !size.w) return null;
    const cardW = 240;
    const gap = 12;
    const rightX = tooltipPlacement.x + tooltipPlacement.size + gap;
    const flip = rightX + cardW > size.w - 16;
    const left = flip
      ? Math.max(16, tooltipPlacement.x - cardW - gap)
      : rightX;
    const top = Math.max(16, Math.min(size.h - 160, tooltipPlacement.y));
    return { left, top, width: cardW };
  }, [tooltipPlacement, size.w, size.h]);

  // 마지막 tooltip 컨텐츠/위치 유지 — fade out 도중 사라지지 않게
  const [lastTooltip, setLastTooltip] = useState(null);
  useEffect(() => {
    if (tooltipIdx >= 0 && tooltipPos) {
      setLastTooltip({ pos: tooltipPos, src: placements[tooltipIdx]?.src });
    }
  }, [tooltipIdx, tooltipPos, placements]);
  const renderPos = tooltipPos || lastTooltip?.pos;
  const renderStaticTokens = (tooltipStatic || (lastTooltip ? tokensBySrc?.[lastTooltip.src] : null));

  return (
    <Box
      ref={ containerRef }
      sx={ {
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        ...sx,
      } }
    >
      {/* hover backdrop */}
      { hasBackdrop && (
        <Box
          sx={ {
            position: 'absolute',
            inset: 0,
            backgroundImage: lastHoverSrc ? `url(${lastHoverSrc})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(48px) saturate(1.1)',
            transform: 'scale(1.18)',
            opacity: hoverSrc ? 0.55 : 0,
            transition: 'opacity 1200ms cubic-bezier(0.22, 0.61, 0.36, 1)',
            pointerEvents: 'none',
            zIndex: 0,
          } }
        />
      ) }

      {/* scattered thumbnails */}
      { placements.map((p, i) => (
        <Box
          key={ `${p.src}-${i}` }
          ref={ (n) => { itemRefs.current[i] = n; } }
          onMouseEnter={ () => setHoverIdx(i) }
          onMouseLeave={ () => setHoverIdx((curr) => (curr === i ? -1 : curr)) }
          sx={ {
            position: 'absolute',
            top: p.y,
            left: p.x,
            width: p.size,
            height: p.size,
            borderRadius: 1.5,
            overflow: 'hidden',
            backgroundImage: `url(${p.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            willChange: 'transform',
            transition: 'filter 220ms ease',
            zIndex: 1,
            cursor: 'pointer',
            '&:hover': {
              filter: 'brightness(1.05)',
              zIndex: 5,
            },
          } }
        />
      )) }

      {/* tooltip — 추출 토큰(컬러 + 옵션 태그). fade out 도중 잔존 위해 lastTooltip 유지 */}
      { hasTooltip && renderPos && (
        <Box
          sx={ {
            position: 'absolute',
            top: renderPos.top,
            left: renderPos.left,
            width: renderPos.width,
            zIndex: 8,
            pointerEvents: 'none',
            opacity: tooltipIdx >= 0 ? 1 : 0,
            transition: 'opacity 480ms cubic-bezier(0.22, 0.61, 0.36, 1)',
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 18px 40px rgba(0,0,0,0.15)',
            p: 1.75,
            backdropFilter: 'blur(8px)',
          } }
        >
          { renderStaticTokens?.title && (
            <Typography
              sx={ {
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.02em',
                mb: 0.75,
              } }
            >
              { renderStaticTokens.title }
            </Typography>
          ) }
          <Typography
            variant="caption"
            color="text.secondary"
            sx={ { display: 'block', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.62rem', mb: 0.75 } }
          >
            Extracted color
          </Typography>
          <Box sx={ { display: 'flex', gap: 0.75, flexWrap: 'wrap' } }>
            { (hoverColors || renderStaticTokens?.colors || Array(5).fill(null)).map((c, i) => (
              <Box
                key={ i }
                sx={ {
                  width: 28,
                  height: 28,
                  borderRadius: 1,
                  bgcolor: c || 'action.hover',
                  border: '1px solid',
                  borderColor: 'divider',
                  flexShrink: 0,
                } }
                title={ c || '' }
              />
            )) }
          </Box>
          { renderStaticTokens?.tags?.length > 0 && (
            <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 } }>
              { renderStaticTokens.tags.map((t) => (
                <Box
                  key={ t }
                  sx={ {
                    px: 0.75,
                    py: 0.15,
                    borderRadius: 999,
                    border: '1px solid',
                    borderColor: 'divider',
                    fontSize: '0.65rem',
                    color: 'text.secondary',
                    letterSpacing: '0.02em',
                  } }
                >
                  { t }
                </Box>
              )) }
            </Box>
          ) }
        </Box>
      ) }

      {/* center slot */}
      { children && (
        <Box
          sx={ {
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            pointerEvents: 'none',
          } }
        >
          { children }
        </Box>
      ) }
    </Box>
  );
}

/* ============================================
 * 작은 seeded RNG — Mulberry32
 * https://stackoverflow.com/a/47593316
 * ============================================ */
function mulberry32(seed) {
  let t = seed >>> 0;
  return function rand() {
    t = (t + 0x6D2B79F5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/* ============================================
 * extractDominantColors — 32x32 다운샘플 + RGB bucket(>>4) 모드 카운트
 * 결과는 module-level Map 으로 캐시 (src 단위)
 * ============================================ */
const COLOR_CACHE = new Map();

function extractDominantColors(src, count = 5) {
  if (COLOR_CACHE.has(src)) return COLOR_CACHE.get(src);
  const promise = new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve([]);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = 32;
        const h = 32;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;
        const buckets = new Map();
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 200) continue;
          const r = (data[i] >> 4) << 4;
          const g = (data[i + 1] >> 4) << 4;
          const b = (data[i + 2] >> 4) << 4;
          // 너무 어두운 / 너무 밝은 (전체 면적 차지하는 mat) 약간 페널티: 가중치 0.4
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          const weight = (luma < 18 || luma > 240) ? 0.4 : 1;
          const key = (r << 16) | (g << 8) | b;
          buckets.set(key, (buckets.get(key) || 0) + weight);
        }
        const sorted = [...buckets.entries()].sort((a, b) => b[1] - a[1]);
        const out = [];
        const minDist = 28; // hex 거리 임계 — 비슷한 색 dedupe
        for (const [key] of sorted) {
          const r = (key >> 16) & 0xff;
          const g = (key >> 8) & 0xff;
          const b = key & 0xff;
          const isDup = out.some((c) => {
            const dr = c.r - r;
            const dg = c.g - g;
            const db = c.b - b;
            return Math.sqrt(dr * dr + dg * dg + db * db) < minDist;
          });
          if (isDup) continue;
          out.push({ r, g, b });
          if (out.length >= count) break;
        }
        resolve(out.map(({ r, g, b }) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`));
      } catch {
        resolve([]);
      }
    };
    img.onerror = () => resolve([]);
    img.src = src;
  });
  COLOR_CACHE.set(src, promise);
  return promise;
}
