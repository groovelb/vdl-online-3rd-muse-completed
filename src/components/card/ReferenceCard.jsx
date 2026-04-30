import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import RefreshIcon from '@mui/icons-material/Refresh';
import { ImageCard } from './ImageCard.jsx';
import { LayerAnalysisStrip } from '../data-display/LayerAnalysisStrip.jsx';

/**
 * ReferenceCard 컴포넌트
 *
 * MUSE 의 공식 데이터 모델 `Reference` (store.references 의 항목, `ref-XXX` id) 를
 * 표시하는 도메인 카드. 시각 베이스는 `ImageCard`. T1 분석 state 머신 + 에러 오버레이를
 * 내장해서 ArchivePage / ReferencePicker / AdminRoute / 랜딩 데모 등 *Reference 를 보여주는
 * 모든 자리* 에서 동일 외형 보장.
 *
 * State (state=0|1|2):
 *   0  업로드 직후 — 이미지만 (tags / colors / title 비움)
 *   1  분석 중 — analyzingVariant 에 따라 strip(하단) 또는 chip(우상단 작은 뱃지)
 *   2  완료 — tags / dominantColors / title 채워진 ImageCard
 *
 * Error: errorMessage 가 truthy 이면 우상단 빨간 chip + onRetry 버튼 표시.
 *
 * Props:
 * @param {string} src - 이미지 URL [Required]
 * @param {string} title - 분석 완료 시 노출될 제목 [Optional]
 * @param {string[]} tags - 분석 완료 시 노출될 태그 목록 [Optional, 기본값: []]
 * @param {string[]} dominantColors - 분석 완료 시 노출될 대표 색상 [Optional, 기본값: []]
 * @param {0|1|2} state - 카드 상태 [Optional, 기본값: 2]
 * @param {('pending'|'running'|'done')[]} layerStatuses - state=1 + analyzingVariant='strip' 시 strip 에 전달 [Optional]
 * @param {string[]} layerLabels - LayerAnalysisStrip 레이블 [Optional]
 * @param {'chip'|'strip'} analyzingVariant - 분석 중 표시 방식 [Optional, 기본값: 'chip']
 * @param {string} errorMessage - 분석 실패 메시지 (truthy → 에러 chip 표시) [Optional]
 * @param {function} onRetry - 에러 chip 의 재시도 클릭 [Optional]
 * @param {function} onClick - ImageCard 클릭 (상세 열기 등) [Optional]
 * @param {function} onLike - ImageCard 좋아요 [Optional]
 * @param {boolean} isSelectable - 선택 모드 [Optional]
 * @param {boolean} isSelected - 선택 상태 [Optional]
 * @param {function} onToggleSelect - 선택 토글 [Optional]
 * @param {boolean} hideActions - ImageCard 의 기본 액션 숨김 [Optional]
 * @param {node} customOverlay - ImageCard 의 hover overlay 슬롯 [Optional]
 * @param {string} mediaRatio - 미디어 비율. 'auto' 면 원본 비율 유지 [Optional, 기본값: 'auto']
 * @param {object} sx - 외곽 wrapper 스타일 [Optional]
 *
 * Example usage:
 * // ArchivePage / 일반 표시
 * <ReferenceCard
 *   src={ ref.thumbnailUrl }
 *   title={ ref.title }
 *   tags={ ref.tags }
 *   dominantColors={ ref.dominantColors }
 *   state={ ref._pending ? 1 : 2 }
 *   errorMessage={ ref._tagError }
 *   onRetry={ () => retryTag(ref.id) }
 *   onClick={ () => openDetail(ref.id) }
 * />
 *
 * // 랜딩 데모 / 상세 strip
 * <ReferenceCard
 *   src={ ref.src }
 *   state={ 1 }
 *   analyzingVariant="strip"
 *   layerStatuses={ ['done', 'running', 'pending', 'pending', 'pending'] }
 * />
 *
 * // ReferencePicker
 * <ReferenceCard
 *   src={ ref.src }
 *   title={ ref.title }
 *   isSelectable
 *   isSelected={ picked.has(ref.id) }
 *   onToggleSelect={ (next) => toggle(ref.id, next) }
 * />
 */
export function ReferenceCard({
  src,
  title,
  tags = [],
  dominantColors = [],
  state = 2,
  layerStatuses,
  layerLabels,
  analyzingVariant = 'chip',
  errorMessage,
  onRetry,
  onClick,
  onLike,
  isSelectable,
  isSelected,
  onToggleSelect,
  hideActions,
  customOverlay,
  mediaRatio = 'auto',
  sx,
}) {
  const isAnalyzing = state === 1;
  const isDone = state === 2;
  const showStrip = isAnalyzing && analyzingVariant === 'strip';
  const showChip = isAnalyzing && analyzingVariant === 'chip';
  const showError = !!errorMessage;

  return (
    <Box sx={ { position: 'relative', borderRadius: '12px', overflow: 'hidden', ...sx } }>
      <ImageCard
        src={ src }
        title={ isDone ? title : ' ' }
        tags={ isDone ? tags : [] }
        dominantColors={ isDone ? dominantColors : [] }
        mediaRatio={ mediaRatio }
        onClick={ onClick }
        onLike={ onLike }
        isSelectable={ isSelectable }
        isSelected={ isSelected }
        onToggleSelect={ onToggleSelect }
        hideActions={ hideActions }
        customOverlay={ customOverlay }
        sx={ { borderRadius: '12px', overflow: 'hidden' } }
      />

      { showStrip && (
        <LayerAnalysisStrip
          layerStatuses={ layerStatuses }
          layerLabels={ layerLabels }
          sx={ { mt: 2 } }
        />
      ) }

      { showChip && !showError && (
        <Box
          sx={ {
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(252,252,255,0.9)',
            borderRadius: 999,
            px: 1,
            py: 0.25,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            backdropFilter: 'blur(6px)',
          } }
        >
          <CircularProgress size={ 10 } thickness={ 5 } />
          <Typography variant="caption" sx={ { fontSize: 10, color: 'text.secondary' } }>
            태깅 중
          </Typography>
        </Box>
      ) }

      { showError && (
        <Box
          sx={ {
            position: 'absolute',
            top: 8,
            right: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            bgcolor: 'error.main',
            color: 'common.white',
            borderRadius: 999,
            pl: 1,
            pr: 0.25,
            py: 0.25,
            fontSize: 10,
          } }
          title={ errorMessage }
        >
          <span>태깅 실패</span>
          { onRetry && (
            <IconButton
              size="small"
              onClick={ (e) => {
                e.stopPropagation();
                onRetry();
              } }
              aria-label="태깅 다시 시도"
              sx={ {
                p: 0.25,
                color: 'common.white',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
              } }
            >
              <RefreshIcon sx={ { fontSize: 14 } } />
            </IconButton>
          ) }
        </Box>
      ) }
    </Box>
  );
}
