import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import { getSignedUrl } from '../../lib/museDb';

/**
 * RefImage 컴포넌트
 *
 * Reference 이미지를 안전하게 렌더. signed URL 만료(403/네트워크 에러) 시
 * storagePath 로 재서명해 1회 자동 재시도한다.
 *
 * Props:
 * @param {string} src - 초기 이미지 URL (보통 ref.thumbnailUrl) [Optional]
 * @param {string} storagePath - Supabase Storage 경로. src 만료 시 재서명에 사용 [Optional]
 * @param {string} alt - 대체 텍스트 [Optional]
 * @param {object} sx - 추가 스타일 (기본: width/height 100%, objectFit cover) [Optional]
 *
 * Example usage:
 * <RefImage src={ref.thumbnailUrl} storagePath={ref.storagePath} alt={ref.title} />
 */
export function RefImage({ src, storagePath, alt, sx, ...rest }) {
  const [currentSrc, setCurrentSrc] = useState(src || null);
  const retriedRef = useRef(false);

  useEffect(() => {
    setCurrentSrc(src || null);
    retriedRef.current = false;
  }, [src]);

  const handleError = async () => {
    if (retriedRef.current || !storagePath) return;
    retriedRef.current = true;
    const fresh = await getSignedUrl(storagePath);
    if (fresh) setCurrentSrc(fresh);
  };

  if (!currentSrc) return null;

  return (
    <Box
      component="img"
      src={ currentSrc }
      alt={ alt }
      decoding="async"
      onError={ handleError }
      sx={ {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
        ...sx,
      } }
      { ...rest }
    />
  );
}
