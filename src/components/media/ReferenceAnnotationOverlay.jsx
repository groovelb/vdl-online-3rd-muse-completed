import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

/**
 * ReferenceAnnotationOverlay
 *
 * 레퍼런스 이미지 hover 시 외곽 코너 브래킷 + 스캔 라인 + 가장자리 어노테이션 칩
 * 으로 "AI detection" 톤을 표현. 실제 bbox 좌표는 사용하지 않고 이미지 1장 자체를
 * detection 대상으로 다룬다.
 *
 * 모든 사이즈에서 타이틀/태그/컬러 모두 노출. 외부 부착이라 작은 썸네일도 가독성 OK.
 *
 * Props:
 * @param {{ title?: string, tags?: string[], colors?: string[] }} tokens - 표시할 데이터 [Optional]
 * @param {boolean} isActive - 활성화 여부 (entry 트리거) [Required]
 * @param {number} size - 컨테이너 한 변(px) [Required]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 *  <ReferenceAnnotationOverlay tokens={ tokens } isActive size={ 120 } />
 */
export function ReferenceAnnotationOverlay({ tokens, isActive, size, sx }) {
  const theme = useTheme();

  const stroke = theme.palette.primary.main;
  const bracketLen = Math.max(8, Math.min(16, Math.round(size * 0.14)));
  const bracketWidth = 1.5;

  const showTitle = isActive && !!tokens?.title;
  const showTags = isActive && tokens?.tags?.length > 0;
  const showColors = isActive && tokens?.colors?.length > 0;

  return (
    <Box
      sx={ {
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: isActive ? 1 : 0,
        transition: 'opacity 100ms ease',
        ...sx,
      } }
    >
      {/* 코너 브래킷 4개 */}
      { CORNERS.map((c) => (
        <Box
          key={ c.key }
          sx={ {
            position: 'absolute',
            width: bracketLen,
            height: bracketLen,
            ...c.pos,
            borderColor: stroke,
            borderStyle: 'solid',
            borderTopWidth: c.borders.t ? bracketWidth : 0,
            borderRightWidth: c.borders.r ? bracketWidth : 0,
            borderBottomWidth: c.borders.b ? bracketWidth : 0,
            borderLeftWidth: c.borders.l ? bracketWidth : 0,
            opacity: 0,
            animation: isActive ? `refAnnoCorner 200ms ${ c.delay }ms ease-out forwards` : 'none',
            '@keyframes refAnnoCorner': {
              '0%':   { opacity: 0, transform: 'scale(0.6)' },
              '100%': { opacity: 1, transform: 'scale(1)' },
            },
          } }
        />
      )) }

      {/* 스캔 라인 */}
      { isActive && (
        <Box
          sx={ {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: 24,
            background: `linear-gradient(180deg, transparent 0%, ${ alpha(stroke, 0.55) } 50%, transparent 100%)`,
            animation: 'refAnnoScan 220ms ease-out forwards',
            '@keyframes refAnnoScan': {
              '0%':   { transform: 'translateY(-24px)', opacity: 0.9 },
              '100%': { transform: `translateY(${ size }px)`, opacity: 0 },
            },
          } }
        />
      ) }

      {/* 좌상단 타이틀 칩 (이미지 외부) */}
      { showTitle && (
        <Box
          sx={ {
            position: 'absolute',
            bottom: '100%',
            left: 0,
            mb: '6px',
            px: 0.75,
            py: 0.25,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.background.paper, 0.94),
            border: '1px solid',
            borderColor: alpha(stroke, 0.4),
            maxWidth: Math.max(size + 32, 160),
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            opacity: 0,
            animation: 'refAnnoChipIn 180ms 280ms ease-out forwards',
            '@keyframes refAnnoChipIn': {
              '0%':   { opacity: 0, transform: 'translateY(2px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
          } }
        >
          <Typography sx={ { fontSize: 11, fontWeight: 600, letterSpacing: '0.02em', color: 'text.primary', lineHeight: 1.2 } }>
            { tokens.title }
          </Typography>
        </Box>
      ) }

      {/* 하단 태그 칩 라인 (이미지 외부) */}
      { showTags && (
        <Box
          sx={ {
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            mt: '6px',
            display: 'flex',
            gap: 0.5,
            flexWrap: 'wrap',
            opacity: 0,
            animation: 'refAnnoChipIn 180ms 360ms ease-out forwards',
          } }
        >
          { tokens.tags.slice(0, 3).map((tag) => (
            <Box
              key={ tag }
              sx={ {
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 0.75,
                py: 0.15,
                borderRadius: 999,
                bgcolor: alpha(theme.palette.background.paper, 0.94),
                border: '1px solid',
                borderColor: 'divider',
              } }
            >
              <Box sx={ { width: 5, height: 5, borderRadius: '50%', bgcolor: stroke } } />
              <Typography sx={ { fontSize: 10, color: 'text.secondary', letterSpacing: '0.02em', lineHeight: 1.2 } }>
                { tag }
              </Typography>
            </Box>
          )) }
        </Box>
      ) }

      {/* 우측 세로 컬러 스와치 (이미지 외부) */}
      { showColors && (
        <Box
          sx={ {
            position: 'absolute',
            left: '100%',
            top: 0,
            ml: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            p: '4px',
            borderRadius: 1,
            bgcolor: alpha(theme.palette.background.paper, 0.94),
            border: '1px solid',
            borderColor: 'divider',
            opacity: 0,
            animation: 'refAnnoChipIn 180ms 420ms ease-out forwards',
          } }
        >
          { tokens.colors.slice(0, 4).map((c, k) => (
            <Box
              key={ `${ c }-${ k }` }
              sx={ {
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: c,
                border: `1px solid ${ alpha('#fff', 0.5) }`,
                boxShadow: `0 0 0 1px ${ alpha('#000', 0.15) }`,
              } }
            />
          )) }
        </Box>
      ) }
    </Box>
  );
}

const CORNERS = [
  { key: 'tl', pos: { top: 0,    left: 0 },  borders: { t: 1, l: 1 }, delay: 0 },
  { key: 'tr', pos: { top: 0,    right: 0 }, borders: { t: 1, r: 1 }, delay: 40 },
  { key: 'br', pos: { bottom: 0, right: 0 }, borders: { b: 1, r: 1 }, delay: 80 },
  { key: 'bl', pos: { bottom: 0, left: 0 },  borders: { b: 1, l: 1 }, delay: 120 },
];
