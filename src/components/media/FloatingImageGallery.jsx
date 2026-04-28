import { useEffect, useLayoutEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import * as THREE from 'three';

/**
 * 카메라 기준 wrap-around. pos 가 ±range 를 벗어나면 반대편으로 텔레포트하여
 * 같은 plane 갯수로 무한 갤러리 환각을 만든다.
 */
function wrap(pos, camPos, range) {
  const size = range * 2;
  let rel = pos - camPos;
  rel = ((((rel + range) % size) + size) % size) - range;
  return rel + camPos;
}

/**
 * FloatingImageGallery
 *
 * Three.js 기반 z-depth 갤러리. 무한 wrap-around 분포 + fog + 카메라 lerp + 마우스 패럴랙스.
 * 드래그 / 휠 / 호버 인터랙션 옵션화. 자식으로 오버레이 콘텐츠(타이포·CTA 등) 배치 가능.
 *
 * Props:
 * @param {string[]} images - plane 텍스처로 사용할 URL 배열 [Required]
 * @param {string} backgroundColor - scene 배경 + fog 색 [Optional, 기본값: '#FCFCFF']
 * @param {number} count - 생성할 plane 개수 (images 보다 크면 순환) [Optional, 기본값: 60]
 * @param {object} range - { x, y, z } wrap 박스 절반 크기 [Optional]
 * @param {number} planeSize - plane 한 변 크기(px) [Optional, 기본값: 380]
 * @param {number} fogNear - fog 시작 거리 [Optional, 기본값: 100]
 * @param {number} fogFar - fog 끝 거리 [Optional, 기본값: 6000]
 * @param {number} initialZ - 카메라 초기 Z [Optional, 기본값: 1500]
 * @param {boolean} isInteractive - 드래그/휠로 카메라 조작 [Optional, 기본값: true]
 * @param {boolean} hasParallax - 마우스 위치로 카메라 살짝 회전 [Optional, 기본값: true]
 * @param {number} autoDriftZ - 매 프레임 카메라가 -Z 로 자동 이동하는 속도 (px/frame) [Optional, 기본값: 0]
 * @param {number} dpr - devicePixelRatio cap (1 = 성능 우선) [Optional, 기본값: 1]
 * @param {object} sx - 외곽 컨테이너 스타일 [Optional]
 * @param {node} children - 3D 위에 얹는 React 오버레이 [Optional]
 *
 * Example usage:
 * <FloatingImageGallery
 *   images={ images }
 *   backgroundColor="#FCFCFF"
 *   isInteractive={ false }
 *   autoDriftZ={ -1.2 }
 *   sx={ { height: '100vh' } }
 * >
 *   <HeroLogo />
 * </FloatingImageGallery>
 */
export function FloatingImageGallery({
  images,
  backgroundColor = '#FCFCFF',
  count = 60,
  range = { x: 2200, y: 1600, z: 4500 },
  planeSize = 380,
  fogNear = 100,
  fogFar = 6000,
  initialZ = 1500,
  isInteractive = true,
  hasParallax = true,
  autoDriftZ = 0,
  dpr = 1,
  sx,
  children,
}) {
  const containerRef = useRef(null);
  // 자주 바뀌는 인터랙션 옵션은 ref 로 동기화 (effect 재실행 회피)
  const optsRef = useRef({ isInteractive, hasParallax, autoDriftZ });
  useLayoutEffect(() => {
    optsRef.current = { isInteractive, hasParallax, autoDriftZ };
  }, [isInteractive, hasParallax, autoDriftZ]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !images || images.length === 0) return undefined;

    const getSize = () => ({
      w: container.clientWidth || window.innerWidth,
      h: container.clientHeight || window.innerHeight,
    });

    let { w, h } = getSize();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    scene.fog = new THREE.Fog(backgroundColor, fogNear, fogFar);

    const camera = new THREE.PerspectiveCamera(70, w / h, 10, 15000);
    camera.position.z = initialZ;

    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
      alpha: false,
    });
    renderer.setPixelRatio(Math.min(dpr, window.devicePixelRatio || 1));
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';

    const baseGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin('anonymous');

    const frames = [];
    for (let i = 0; i < count; i += 1) {
      const url = images[i % images.length];
      const material = new THREE.MeshBasicMaterial({
        color: 0xfafafa,
        transparent: true,
        opacity: 0.7,
        fog: true,
      });
      const mesh = new THREE.Mesh(baseGeometry, material);
      mesh.position.set(
        (Math.random() - 0.5) * (range.x * 2),
        (Math.random() - 0.5) * (range.y * 2),
        (Math.random() - 0.5) * (range.z * 2),
      );
      textureLoader.load(
        url,
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          material.map = tex;
          material.color.set(0xffffff);
          material.needsUpdate = true;
        },
        undefined,
        () => {
          material.color.set(0xeeeeee);
        },
      );
      scene.add(mesh);
      frames.push({ mesh, material });
    }

    // 인터랙션 상태
    const mouse = new THREE.Vector2();
    const target = { x: 0, y: 0, z: initialZ };
    const current = { x: 0, y: 0, z: initialZ };
    let isDragging = false;
    let prev = { x: 0, y: 0 };

    const onMouseMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      if (isDragging && optsRef.current.isInteractive) {
        const dx = e.clientX - prev.x;
        const dy = e.clientY - prev.y;
        target.x -= dx * 4;
        target.y += dy * 4;
        prev = { x: e.clientX, y: e.clientY };
      }
    };
    const onMouseDown = (e) => {
      if (!optsRef.current.isInteractive) return;
      isDragging = true;
      prev = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => { isDragging = false; };
    const onWheel = (e) => {
      if (!optsRef.current.isInteractive) return;
      target.z += e.deltaY * 3;
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: true });

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);

      const opts = optsRef.current;
      if (opts.autoDriftZ) target.z += opts.autoDriftZ;

      const smoothing = 0.08;
      current.x += (target.x - current.x) * smoothing;
      current.y += (target.y - current.y) * smoothing;
      current.z += (target.z - current.z) * smoothing;
      camera.position.set(current.x, current.y, current.z);

      if (opts.hasParallax) {
        camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, -mouse.x * 0.1, 0.1);
        camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, mouse.y * 0.1, 0.1);
      }

      const cx = camera.position.x;
      const cy = camera.position.y;
      const cz = camera.position.z;
      for (let i = 0, l = frames.length; i < l; i += 1) {
        const m = frames[i].mesh;
        m.position.x = wrap(m.position.x, cx, range.x);
        m.position.y = wrap(m.position.y, cy, range.y);
        m.position.z = wrap(m.position.z, cz, range.z);
      }

      renderer.render(scene, camera);
    };
    animate();

    const ro = new ResizeObserver(() => {
      const next = getSize();
      w = next.w; h = next.h;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      frames.forEach(({ material }) => {
        if (material.map) material.map.dispose();
        material.dispose();
      });
      baseGeometry.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [images, backgroundColor, count, range.x, range.y, range.z, planeSize, fogNear, fogFar, initialZ, dpr]);

  return (
    <Box sx={ { position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...sx } }>
      <Box
        ref={ containerRef }
        sx={ {
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          userSelect: 'none',
          cursor: isInteractive ? 'grab' : 'default',
          '&:active': { cursor: isInteractive ? 'grabbing' : 'default' },
        } }
      />
      { children && (
        <Box sx={ { position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' } }>
          { children }
        </Box>
      ) }
    </Box>
  );
}
