import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';

const TAG_GROUPS = [
  { key: 'color', label: '색상' },
  { key: 'typography', label: '타이포' },
  { key: 'layout', label: '레이아웃' },
  { key: 'gradient', label: '그라디언트' },
];
const VD_GROUPS = [
  { key: 'genre', label: '장르' },
  { key: 'style', label: '스타일' },
  { key: 'subject', label: '주제' },
];

/** 한 그룹의 태그 칩 행 — 라벨 + Chip 리스트. 비어있으면 렌더 X */
function TagRow({ label, tags, activeTags = [] }) {
  if (!tags || tags.length === 0) return null;
  return (
    <Box sx={ { display: 'flex', alignItems: 'flex-start', gap: 2.5, py: 1.5 } }>
      <Typography
        variant="body2"
        sx={ { minWidth: 96, pt: 1, color: 'text.secondary', fontSize: '0.9rem', fontWeight: 500 } }
      >
        { label }
      </Typography>
      <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 1 } }>
        { tags.map((t) => (
          <Chip
            key={ t }
            label={ t }
            color={ activeTags.includes(t) ? 'primary' : 'default' }
            variant={ activeTags.includes(t) ? 'filled' : 'outlined' }
            sx={ { height: 34, fontSize: '0.88rem', px: 0.5 } }
          />
        )) }
      </Box>
    </Box>
  );
}

/**
 * ReferenceDetailDialog 컴포넌트
 *
 * 아카이브 카드 클릭 시 나타나는 상세 모달.
 * 카드 UI에서 잘려나간 메타데이터(전체 태그, 대표 색상, 출처 등)를 한 번에 보여준다.
 *
 * 동작 흐름:
 * 1. `reference`가 truthy이면 열림, null이면 닫힘
 * 2. 좌측엔 큰 이미지(원본 비율 유지), 우측엔 메타 정보 패널
 * 3. 태그는 레이어별로 그룹화. 현재 active 필터에 들어있는 태그는 primary 칩으로 강조
 * 4. ESC / 백드롭 / X 버튼으로 닫힘
 *
 * Props:
 * @param {object|null} reference - 표시할 레퍼런스 객체 (null이면 닫힘) [Required]
 * @param {function} onClose - () => void 닫기 콜백 [Required]
 * @param {string[]} activeTags - 현재 활성 태그 (강조 표시용) [Optional, 기본값: []]
 * @param {string[]} activeColors - 현재 활성 대표 색상 (강조 표시용) [Optional, 기본값: []]
 *
 * Example usage:
 * <ReferenceDetailDialog
 *   reference={ detailTarget }
 *   onClose={ () => setDetailTarget(null) }
 *   activeTags={ activeTags }
 *   activeColors={ activeColors }
 * />
 */
export function ReferenceDetailDialog({
  reference,
  onClose,
  activeTags = [],
  activeColors = [],
}) {
  const isOpen = !!reference;
  const t = reference?.tags || {};
  const vd = t.visualDirection || {};
  const dominantColors = reference?.dominantColors || [];
  const palette = reference?.extracted?.palette || [];

  return (
    <Dialog
      open={ isOpen }
      onClose={ onClose }
      fullScreen
      PaperProps={ { sx: { borderRadius: 0, bgcolor: 'background.default' } } }
    >
      <IconButton
        onClick={ onClose }
        aria-label="닫기"
        sx={ {
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 2,
          bgcolor: 'rgba(20,19,43,0.6)',
          color: 'common.white',
          backdropFilter: 'blur(6px)',
          '&:hover': { bgcolor: 'rgba(20,19,43,0.85)' },
        } }
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={ { p: 0, height: '100vh', overflow: 'hidden' } }>
        <Box
          sx={ {
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(320px, 420px)' },
            gridTemplateRows: { xs: '1fr auto', md: '1fr' },
            height: '100%',
          } }
        >
          { /* 우측 메타 사이드 (md 이상) — 데스크탑 우측 컬럼은 두 번째 자식이라 아래에서 렌더 */ }
          { /* 좌측 이미지 영역 — 원본비율 정가운데 */ }
          <Box
            sx={ {
              position: 'relative',
              bgcolor: 'background.default',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              height: { xs: '55vh', md: '100vh' },
              p: { xs: 4, md: 10 },
            } }
          >
            { reference && (
              <Box
                component="img"
                src={ reference.thumbnailUrl || reference.src }
                alt={ reference.title || 'Reference' }
                sx={ {
                  maxWidth: { xs: '100%', md: 'min(100%, 1200px)' },
                  maxHeight: { xs: '100%', md: 'min(100%, 80vh)' },
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                } }
              />
            ) }
          </Box>

          { /* 우측 메타 사이드 */ }
          <Box
            sx={ {
              p: { xs: 4, md: 8 },
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              overflowY: 'auto',
              height: { xs: 'auto', md: '100vh' },
              maxHeight: { xs: '45vh', md: '100vh' },
            } }
          >
            <Box>
              <Typography variant="h3" sx={ { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.15 } }>
                { reference?.title || '(제목 없음)' }
              </Typography>
              { (reference?.createdAt || (reference?.source && reference.source !== 'unknown')) && (
                <Typography variant="body2" color="text.secondary" sx={ { display: 'block', mt: 2, fontSize: '0.95rem' } }>
                  { [
                    reference?.createdAt && `수집일 ${reference.createdAt}`,
                    reference?.source && reference.source !== 'unknown' && `출처 ${reference.source}`,
                  ].filter(Boolean).join(' · ') }
                </Typography>
              ) }
            </Box>

            { dominantColors.length > 0 && (
              <Box>
                <Typography variant="overline" sx={ { fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.08em' } }>
                  대표 색상
                </Typography>
                <Box sx={ { display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 } }>
                  { dominantColors.map((hex, i) => {
                    const isActive = activeColors.some(
                      (a) => a.toLowerCase() === hex.toLowerCase(),
                    );
                    const labelObj = palette[i];
                    return (
                      <Box
                        key={ `${hex}-${i}` }
                        sx={ { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 } }
                      >
                        <Box
                          title={ hex }
                          sx={ {
                            width: 52,
                            height: 52,
                            borderRadius: '50%',
                            bgcolor: hex,
                            border: isActive ? '3px solid' : '1px solid',
                            borderColor: isActive ? 'primary.main' : 'divider',
                            boxSizing: 'border-box',
                          } }
                        />
                        <Typography sx={ { fontSize: '0.78rem', color: 'text.secondary', lineHeight: 1.2 } }>
                          { labelObj?.label || hex }
                        </Typography>
                      </Box>
                    );
                  }) }
                </Box>
              </Box>
            ) }

            <Divider />

            <Box>
              <Typography variant="overline" sx={ { fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.08em' } }>
                레이어 태그
              </Typography>
              <Box sx={ { mt: 1.5 } }>
                { TAG_GROUPS.map(({ key, label }) => (
                  <TagRow key={ key } label={ label } tags={ t[key] } activeTags={ activeTags } />
                )) }
              </Box>
            </Box>

            <Box>
              <Typography variant="overline" sx={ { fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.08em' } }>
                비주얼 디렉션
              </Typography>
              <Box sx={ { mt: 1.5 } }>
                { VD_GROUPS.map(({ key, label }) => (
                  <TagRow key={ key } label={ label } tags={ vd[key] } activeTags={ activeTags } />
                )) }
              </Box>
            </Box>
          </Box>

        </Box>
      </DialogContent>
    </Dialog>
  );
}
