import { useEffect, useRef, useState } from 'react';

/**
 * useStaggeredSequence
 *
 * 일련의 항목(N 개) 이 IntersectionObserver gate 통과 후 시간차(stagger) 로 순차적으로
 * state 0 → 1 → 2 로 진행되는 시퀀스를 RAF 로 진행시킨다. 항목 별 (state, elapsedInItem)
 * 배열을 반환. layerStatuses 같은 파생 state 는 호출처에서 elapsedInItem 으로부터 계산.
 *
 * - state 0: 아직 진입 전 (cardEnter 시점 이전)
 * - state 1: 진행 중 (cardEnter ≤ elapsed < cardEnter + durationMs)
 * - state 2: 완료 (elapsed ≥ cardEnter + durationMs)
 *
 * 한 번 시작하면 한 번만 실행 (idempotent). 첫 번째 항목이 cardEnter=0, i 번째는 i × staggerMs.
 *
 * @param {object} options
 * @param {React.RefObject<HTMLElement>} options.targetRef - IntersectionObserver 대상 [Required]
 * @param {number} options.count - 항목 개수 [Required]
 * @param {number} options.staggerMs - 항목 사이 시작 시차 (기본: 600 ms)
 * @param {number} options.durationMs - 항목별 state 1 지속 시간 (기본: 2400 ms)
 * @param {number} options.threshold - 시작 트리거가 될 IntersectionObserver threshold (기본: 0.5)
 * @returns {Array<{ state: 0|1|2, elapsedInItem: number }>} 항목별 현재 state + 항목 시작 후 경과 ms
 *
 * Example usage:
 *   const ref = useRef(null);
 *   const items = useStaggeredSequence({ targetRef: ref, count: 3 });
 *   items[0].state // 0 / 1 / 2
 *   items[0].elapsedInItem // ms since this item entered state 1
 */
export function useStaggeredSequence({
  targetRef,
  count,
  staggerMs = 600,
  durationMs = 2400,
  threshold = 0.5,
}) {
  const [now, setNow] = useState(0);
  const [startedAt, setStartedAt] = useState(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return undefined;
    if (startedAt) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
        setStartedAt(performance.now());
      }
    }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, [targetRef, startedAt, threshold]);

  useEffect(() => {
    if (!startedAt) return undefined;
    let active = true;
    const tick = () => {
      if (!active) return;
      const elapsed = performance.now() - startedAt;
      setNow(elapsed);
      const totalDuration = staggerMs * (count - 1) + durationMs + 200;
      if (elapsed < totalDuration) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [startedAt, count, staggerMs, durationMs]);

  return Array.from({ length: count }, (_, i) => {
    if (!startedAt) return { state: 0, elapsedInItem: 0 };
    const cardEnter = i * staggerMs;
    if (now < cardEnter) return { state: 0, elapsedInItem: 0 };
    const elapsedInItem = now - cardEnter;
    if (elapsedInItem >= durationMs) {
      return { state: 2, elapsedInItem };
    }
    return { state: 1, elapsedInItem };
  });
}
