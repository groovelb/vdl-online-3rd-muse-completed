import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import { RefImage } from '../media/RefImage.jsx';
import { LAYER_LABEL } from '../../data/muse/layers.js';

/**
 * ReferenceNotesDialog — 레퍼런스별 자유 텍스트 노트 일괄 편집
 *
 * 프로젝트 상세에서 "사용된 레퍼런스" 옆 ✏️ 버튼 클릭 시 열림.
 * 모든 used reference 를 list 형식으로 한 화면에서 편집.
 * 노트는 paste block 생성에만 사용되며 T3 재호출 X.
 *
 * Props:
 * @param {boolean} open - Dialog 노출 여부 [Required]
 * @param {function} onClose - 닫기 콜백 [Required]
 * @param {Array<{id, thumbnailUrl, title}>} usedReferences - 프로젝트가 참조하는 레퍼런스 [Required]
 * @param {Object<string, string>} initialNotes - 현재 저장된 ref별 노트 {refId: text} [Optional, 기본값: {}]
 * @param {Object<string, string[]>} useLayersByRef - ref별 useLayers (read-only 표시) [Optional, 기본값: {}]
 * @param {function} onSave - (nextNotes) => Promise<void> 저장 콜백 [Required]
 *
 * Example usage:
 * <ReferenceNotesDialog
 *   open={ open }
 *   onClose={ handleClose }
 *   usedReferences={ refs }
 *   initialNotes={ project.referenceNotes }
 *   useLayersByRef={ layersByRef }
 *   onSave={ async (notes) => updateProject(id, { referenceNotes: notes }) }
 * />
 */
export function ReferenceNotesDialog({
  open,
  onClose,
  usedReferences = [],
  initialNotes = {},
  useLayersByRef = {},
  onSave,
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) setNotes(initialNotes || {});
  }, [open, initialNotes]);

  const handleChange = (refId, value) => {
    setNotes((prev) => ({ ...prev, [refId]: value }));
  };

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      const cleaned = Object.fromEntries(
        Object.entries(notes).filter(([, v]) => v && v.trim().length > 0).map(([k, v]) => [k, v.trim()]),
      );
      await onSave(cleaned);
      onClose?.();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[ReferenceNotesDialog] save 실패', e);
      window.alert(`저장 실패: ${e?.message || e}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={ open } onClose={ () => !isSaving && onClose?.() } maxWidth="md" fullWidth>
      <DialogTitle>레퍼런스별 활용 노트</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={ { mb: 2 } }>
          각 레퍼런스의 어느 부분을 차용할지 자유롭게 적어주세요. 외부 AI 도구에 paste 할 때 이 노트가 ref별 매칭 단서로 들어갑니다.
        </Typography>
        <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2 } }>
          { usedReferences.map((ref) => {
            const layers = useLayersByRef[ref.id] || [];
            const note = notes[ref.id] || '';
            return (
              <Box
                key={ ref.id }
                sx={ {
                  display: 'flex',
                  gap: 2,
                  alignItems: 'flex-start',
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                } }
              >
                <Box
                  sx={ {
                    width: 96,
                    height: 96,
                    flexShrink: 0,
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                  } }
                >
                  { ref.thumbnailUrl && (
                    <RefImage
                      src={ ref.thumbnailUrl }
                      storagePath={ ref.storagePath }
                      alt={ ref.title || ref.id }
                    />
                  ) }
                </Box>
                <Box sx={ { flex: 1, minWidth: 0 } }>
                  <Box sx={ { display: 'flex', alignItems: 'baseline', gap: 1, mb: 0.5 } }>
                    <Typography variant="body2" sx={ { fontWeight: 600 } }>
                      { ref.title || ref.id }
                    </Typography>
                    <Typography variant="caption" sx={ { fontFamily: 'monospace', color: 'text.secondary' } }>
                      { ref.id }
                    </Typography>
                  </Box>
                  { layers.length > 0 ? (
                    <Box sx={ { display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 } }>
                      { layers.map((l) => (
                        <Chip
                          key={ l }
                          label={ LAYER_LABEL[l] || l }
                          size="small"
                          variant="outlined"
                          sx={ { height: 20, fontSize: '0.65rem' } }
                        />
                      )) }
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary" sx={ { display: 'block', mb: 1 } }>
                      차용 layer: 자동 (전체)
                    </Typography>
                  ) }
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={ 2 }
                    maxRows={ 3 }
                    placeholder={ '예: hero 영역 색감만 차용 / 우측 사이드바 구조 모방' }
                    value={ note }
                    onChange={ (e) => handleChange(ref.id, e.target.value) }
                    inputProps={ { maxLength: 100 } }
                    helperText={ `${note.length} / 100` }
                  />
                </Box>
              </Box>
            );
          }) }
          { usedReferences.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={ { textAlign: 'center', py: 4 } }>
              사용된 레퍼런스가 없습니다.
            </Typography>
          ) }
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={ onClose } disabled={ isSaving }>취소</Button>
        <Button onClick={ handleSave } variant="contained" disabled={ isSaving }>
          { isSaving ? '저장 중…' : '저장' }
        </Button>
      </DialogActions>
    </Dialog>
  );
}
