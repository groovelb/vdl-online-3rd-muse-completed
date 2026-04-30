import { useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { ReferenceAnnotationOverlay } from './ReferenceAnnotationOverlay.jsx';

/**
 * ScatterGallery 컴포넌트
 *
 * 이미지를 컨테이너 전체에 흩뿌리는 2D 무드보드. 추가로 외부 progressRef(0~1) 가
 * 주어지면 진행도에 따라 jittered scatter ↔ 두 줄 horizontal flow 사이를
 * 연속 lerp 한다 (단일 RAF 안에서 일체화).
 *
 * - 분포: jittered grid + seeded RNG (deterministic)
 * - flow: i % 2 로 두 줄(상단/하단), 각 줄 반대 방향 + 다른 속도로 무한 흐름
 * - 마우스 parallax: 진행도 0 일 때만 풀 적용, 진행도 ↑ → 약화
 *
 * Props:
 * @param {string[]} images - 이미지 URL 배열 [Required]
 * @param {React.MutableRefObject<number>} progressRef - 외부 진행도 ref (0~1). 없으면 항상 0 (scatter only) [Optional]
 * @param {number} cursorRadius - 마우스 영향 falloff scale(px). 거리 = cursorRadius 인 썸네일은 maxShift × 0.5 만큼 시프트 (모든 썸네일이 차등 반응) [Optional, 기본값: 220]
 * @param {number} maxShift - 최대 시프트(px) — 마우스 위치(거리 0)에서의 변위 상한 [Optional, 기본값: 14]
 * @param {number} seed - 분포 시드 [Optional, 기본값: 42]
 * @param {number} gridCols - jittered grid 열 [Optional, 기본값: 6]
 * @param {number} gridRows - jittered grid 행 [Optional, 기본값: 5]
 * @param {number} thumbnailMin - 썸네일 최소 한 변(px) [Optional, 기본값: 64]
 * @param {number} thumbnailMax - 썸네일 최대 한 변(px) [Optional, 기본값: 132]
 * @param {number} centerKeepout - 중앙 보호 반경(px). 이 안에는 썸네일 배치 안 됨 [Optional, 기본값: 0]
 * @param {boolean} hasTooltip - hover 시 추출 토큰(컬러) 툴팁 [Optional, 기본값: false]
 * @param {number} tooltipDelay - 툴팁 진입 delay(ms) [Optional, 기본값: 200]
 * @param {Object<string,{title?:string,colors?:string[],tags?:string[]}>} tokensBySrc - 정적 토큰 매핑 [Optional]
 * @param {number} flowGap - flow 모드 줄 안 이미지 간격(px) [Optional, 기본값: 24]
 * @param {number} flowRows - flow 모드 줄 갯수 (화면을 가득 메우려고 4 권장) [Optional, 기본값: 4]
 * @param {number[]} flowSpeeds - 줄 별 속도(px/s, 양수=오른쪽으로). flowRows 와 길이 일치 [Optional, 기본값: [-34, 42, -38, 46]]
 * @param {node} children - 중앙 오버레이 슬롯 [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 *   const progressRef = useScrollProgress(wrapperRef);
 *   <ScatterGallery images={ urls } progressRef={ progressRef } />
 */
export function ScatterGallery({
  images,
  progressRef,
  cursorRadius = 220,
  maxShift = 14,
  seed = 42,
  gridCols = 6,
  gridRows = 5,
  thumbnailMin = 48,
  thumbnailMax = 96,
  centerKeepout = 0,
  hasTooltip = false,
  tooltipDelay = 200,
  tokensBySrc,
  flowGap = 24,
  flowRows = 4,
  flowSpeeds = [-34, 42, -38, 46],
  children,
  sx,
}) {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hoverIdx, setHoverIdx] = useState(-1);
  const [tooltipIdx, setTooltipIdx] = useState(-1);
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

  /* placements 산출 — 이미지 1 장 = placement 1 개 (duplicate 없음).
   *   1) jittered grid + centerKeepout 으로 scatter 좌표 산출
   *   2) round-robin 으로 줄에 분배 (i % flowRows)
   *   3) 줄 별 laneSpan ≥ size.w + 2 × thumbnailMax 가 되도록 균등 gap 계산
   *      → 줄 안 이미지가 sparse 하게 펼쳐지고, wrap 은 항상 화면 밖에서 발생
   */
  const placements = useMemo(() => {
    if (!size.w || !size.h || !images?.length) return [];
    const rng = mulberry32(seed);
    const cellW = size.w / gridCols;
    const cellH = size.h / gridRows;
    const cx = size.w / 2;
    const cy = size.h / 2;

    const out = [];
    let imgIdx = 0;
    for (let row = 0; row < gridRows && imgIdx < images.length; row += 1) {
      for (let col = 0; col < gridCols && imgIdx < images.length; col += 1) {
        const pad = 0.12;
        const jx = pad + rng() * (1 - pad * 2);
        const jy = pad + rng() * (1 - pad * 2);
        const x = col * cellW + jx * cellW;
        const y = row * cellH + jy * cellH;
        if (centerKeepout > 0 && Math.hypot(x - cx, y - cy) < centerKeepout) continue;
        const sz = thumbnailMin + rng() * (thumbnailMax - thumbnailMin);
        out.push({
          src: images[imgIdx],
          x: x - sz / 2,
          y: y - sz / 2,
          size: sz,
          row: out.length % flowRows,
        });
        imgIdx += 1;
      }
    }
    if (!out.length) return [];

    /* 줄 별 laneSpan / 균등 gap. wrap 화면 밖 보장. */
    const minLaneSpan = size.w + 2 * thumbnailMax;
    for (let r = 0; r < flowRows; r += 1) {
      const ofRow = out.filter((p) => p.row === r);
      if (!ofRow.length) continue;
      const sumSizes = ofRow.reduce((s, p) => s + p.size, 0);
      const laneSpan = Math.max(minLaneSpan, sumSizes + ofRow.length * flowGap);
      const gap = (laneSpan - sumSizes) / ofRow.length;
      let cursor = 0;
      ofRow.forEach((p) => {
        p.flowLaneStart = cursor + p.size / 2;
        cursor += p.size + gap;
        p.flowLaneSpan = laneSpan;
      });
    }
    return out;
  }, [size.w, size.h, images, seed, gridCols, gridRows, thumbnailMin, thumbnailMax, centerKeepout, flowGap, flowRows]);

  const hoverIdxRef = useRef(-1);
  useEffect(() => { hoverIdxRef.current = hoverIdx; }, [hoverIdx]);

  /* 단일 RAF — scatter↔flow lerp + cursor parallax */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    let raf = 0;
    let mx = -9999;
    let my = -9999;
    let active = true;
    const startT = performance.now();

    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      mx = e.clientX - rect.left;
      my = e.clientY - rect.top;
    };
    const onLeave = () => { mx = -9999; my = -9999; };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);

    const cur = placements.map(() => ({ dx: 0, dy: 0 }));
    const lerp = 0.15;

    const tick = () => {
      if (!active) return;
      const p = progressRef?.current ?? 0;
      // 탄력 ease — scatter↔flow 보간이 약간 당겼다가 오버슈트 후 정착
      const easedP = easeInOutBack(p);
      const t = (performance.now() - startT) / 1000;

      placements.forEach((pl, i) => {
        const node = itemRefs.current[i];
        if (!node) return;

        // flow 위치 (lane 안 cursor 가 시간에 따라 흐름) — laneSpan 으로 wrap
        const speed = flowSpeeds[pl.row] ?? 0;
        const span = pl.flowLaneSpan || 1;
        const rawPos = pl.flowLaneStart + t * speed;
        const wrapped = ((rawPos % span) + span) % span;
        // lane 을 viewport 가운데에 배치 → laneSpan ≥ W + 2*tileMax 이므로 wrap 은 항상 화면 밖
        const flowX = wrapped - span / 2 + size.w / 2 - pl.size / 2;
        const rowY = ((pl.row + 0.5) / flowRows) * size.h;
        const flowY = rowY - pl.size / 2;

        // scatter↔flow 보간 (delta 만 transform 으로) — top/left 은 scatter 정적
        const deltaX = (flowX - pl.x) * easedP;
        const deltaY = (flowY - pl.y) * easedP;

        // cursor parallax — hover 와 무관하게 모든 썸네일이 거리에 따라 차등 반응. 최대 변위 = maxShift.
        // falloff = cursorRadius / (cursorRadius + dist) → 모든 거리에서 0~1 의 가중치
        let tx = 0;
        let ty = 0;
        if (mx > -9000) {
          const ccx = pl.x + deltaX + pl.size / 2;
          const ccy = pl.y + deltaY + pl.size / 2;
          const ddx = ccx - mx;
          const ddy = ccy - my;
          const dist = Math.hypot(ddx, ddy);
          const fall = cursorRadius / (cursorRadius + dist);
          const k = fall * maxShift * (1 - p);
          const inv = dist === 0 ? 0 : 1 / dist;
          tx = ddx * inv * k;
          ty = ddy * inv * k;
        }
        cur[i].dx += (tx - cur[i].dx) * lerp;
        cur[i].dy += (ty - cur[i].dy) * lerp;
        node.style.transform = `translate3d(${ deltaX + cur[i].dx }px, ${ deltaY + cur[i].dy }px, 0)`;
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
  }, [placements, cursorRadius, maxShift, size.w, size.h, flowSpeeds, flowRows, progressRef]);

  /* tooltip delay — flow 모드(p > 0.5) 에서는 비활성 */
  useEffect(() => {
    if (!hasTooltip) return undefined;
    const p = progressRef?.current ?? 0;
    if (hoverIdx < 0 || p > 0.5) {
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
        tooltipTimerRef.current = 0;
      }
      const id = window.setTimeout(() => setTooltipIdx(-1), 0);
      return () => clearTimeout(id);
    }
    tooltipTimerRef.current = window.setTimeout(() => {
      setTooltipIdx(hoverIdx);
    }, tooltipDelay);
    return () => {
      if (tooltipTimerRef.current) clearTimeout(tooltipTimerRef.current);
    };
  }, [hoverIdx, hasTooltip, tooltipDelay, progressRef]);

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
      {/* scattered thumbnails — flow 시점에는 transform 으로 이동.
          외곽 wrapper 는 overflow 해제 (annotation 칩이 이미지 외부로 부착) */}
      { placements.map((p, i) => {
        const tokens = tokensBySrc?.[p.src];
        const isAnnotated = hasTooltip && tooltipIdx === i && tokens;
        return (
          <Box
            key={ `${ p.src }-${ i }` }
            ref={ (n) => { itemRefs.current[i] = n; } }
            onMouseEnter={ () => setHoverIdx(i) }
            onMouseLeave={ () => setHoverIdx((curr) => (curr === i ? -1 : curr)) }
            sx={ {
              position: 'absolute',
              top: p.y,
              left: p.x,
              width: p.size,
              height: p.size,
              willChange: 'transform',
              zIndex: isAnnotated ? 6 : 1,
              cursor: 'pointer',
            } }
          >
            <Box
              sx={ {
                position: 'absolute',
                inset: 0,
                borderRadius: 1.5,
                overflow: 'hidden',
                backgroundImage: `url(${ p.src })`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'filter 220ms ease',
                ...(hoverIdx === i && { filter: 'brightness(1.05)' }),
              } }
            />
            { hasTooltip && tokens && (
              <ReferenceAnnotationOverlay
                tokens={ tokens }
                isActive={ isAnnotated }
                size={ p.size }
              />
            ) }
          </Box>
        );
      }) }

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
 * easeInOutBack — 양 끝에서 살짝 overshoot. https://easings.net/#easeInOutBack
 * scatter↔flow 보간에 탄력감을 주기 위해 사용.
 * ============================================ */
function easeInOutBack(x) {
  const c1 = 1.70158;
  const c2 = c1 * 1.525;
  return x < 0.5
    ? (Math.pow(2 * x, 2) * ((c2 + 1) * 2 * x - c2)) / 2
    : (Math.pow(2 * x - 2, 2) * ((c2 + 1) * (x * 2 - 2) + c2) + 2) / 2;
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

