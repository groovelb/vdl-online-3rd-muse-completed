import { useEffect, useRef } from 'react';

/**
 * useScrollProgress
 *
 * 대상 엘리먼트가 viewport 안에 머무는 동안의 진행도(0~1) 를
 * `--p` CSS variable + 반환된 ref(`.current`) 양쪽에 기록한다.
 *
 * - CSS var: 자손이 `var(--p)` 로 직접 읽어 transform/opacity 계산 가능
 * - ref:     RAF 안에서 매 프레임 최신 값 읽기 (rerender 0)
 *
 * IntersectionObserver gate 로 viewport 밖일 땐 scroll listener 자체를
 * detach → off-screen cost 0.
 *
 * @param {React.RefObject<HTMLElement>} targetRef - 진행도를 측정할 wrapper
 * @returns {React.MutableRefObject<number>} 매 frame 갱신되는 progress(0~1) ref
 *
 * Example usage:
 *   const wrapperRef = useRef(null);
 *   const progressRef = useScrollProgress(wrapperRef);
 *   // wrapperRef.current.style 의 --p / progressRef.current 둘 다 0~1 로 갱신됨
 */
export function useScrollProgress(targetRef) {
  const progressRef = useRef(0);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return undefined;
    let raf = 0;
    let listening = false;

    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      const p = total > 0 ? Math.max(0, Math.min(1, scrolled / total)) : 0;
      el.style.setProperty('--p', String(p));
      progressRef.current = p;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    const attach = () => {
      if (listening) return;
      window.addEventListener('scroll', onScroll, { passive: true });
      listening = true;
      update();
    };
    const detach = () => {
      if (!listening) return;
      window.removeEventListener('scroll', onScroll);
      listening = false;
    };

    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) attach();
      else detach();
    });
    io.observe(el);

    update();

    return () => {
      io.disconnect();
      detach();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [targetRef]);

  return progressRef;
}
