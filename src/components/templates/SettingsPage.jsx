import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { PageContainer } from '../layout/PageContainer.jsx';
import { BETA_LIMITS } from '../../config/betaLimits';

const AI_MODELS = [
  { value: 'claude-opus-4-7', label: 'Claude Opus 4.7 (최고 품질)' },
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (균형)' },
  { value: 'claude-haiku-4-5', label: 'Claude Haiku 4.5 (빠름)' },
];

const THEME_MODES = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

/**
 * SettingsPage 템플릿
 *
 * MUSE 설정 화면. AI 모델, 자동 태깅, 테마 모드를 관리한다.
 *
 * Props:
 * @param {object} settings - { aiModel, themeMode, isAutoTagEnabled } [Required]
 * @param {function} onChange - (patch) => void [Required]
 * @param {function} onSave - "저장" 클릭 [Optional]
 * @param {object} usage - { references: number, projects: number } 베타 사용량 [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <SettingsPage
 *   settings={ settings }
 *   usage={ { references: 12, projects: 3 } }
 *   onChange={ (patch) => updateSettings(patch) }
 *   onSave={ () => api.save(settings) }
 * />
 */
export function SettingsPage({ settings, onChange, onSave, usage, sx }) {
  const [dirty, setDirty] = useState(false);

  const patch = (next) => {
    setDirty(true);
    onChange?.(next);
  };

  return (
    <PageContainer variant="focus" focusMaxWidth={ 640 } sx={ sx }>
      {/* Hero */}
      <Box sx={ { py: { xs: 4, md: 8 } } }>
        <Typography variant="h2" sx={ { fontWeight: 600, letterSpacing: '-0.02em' } }>Settings</Typography>
      </Box>

        <Box sx={ { display: 'flex', flexDirection: 'column', gap: 5 } }>
          {/* Beta usage */}
          { usage && (
            <>
              <Section
                title="베타 사용량"
                description="정식 출시 전 계정당 한도가 적용됩니다"
              >
                <Stack spacing={ 1 }>
                  <UsageRow
                    label="레퍼런스"
                    used={ usage.references ?? 0 }
                    limit={ BETA_LIMITS.references }
                  />
                  <UsageRow
                    label="프로젝트"
                    used={ usage.projects ?? 0 }
                    limit={ BETA_LIMITS.projects }
                  />
                </Stack>
              </Section>

              <Divider />
            </>
          ) }

          {/* AI Model */}
          <Section
            title="AI 모델"
            description="레퍼런스 태깅과 토큰 분석에 사용할 모델"
          >
            <FormControl fullWidth>
              <Select
                value={ settings.aiModel || 'claude-sonnet-4-6' }
                onChange={ (e) => patch({ aiModel: e.target.value }) }
              >
                { AI_MODELS.map((m) => (
                  <MenuItem key={ m.value } value={ m.value }>{ m.label }</MenuItem>
                )) }
              </Select>
            </FormControl>
          </Section>

          <Divider />

          {/* Auto-tag toggle */}
          <Section
            title="자동 태깅"
            description="아카이빙 시 AI가 컬러톤/스타일/카테고리 태그를 자동 부여"
          >
            <FormControlLabel
              control={
                <Switch
                  checked={ !!settings.isAutoTagEnabled }
                  onChange={ (e) => patch({ isAutoTagEnabled: e.target.checked }) }
                />
              }
              label={ settings.isAutoTagEnabled ? '활성' : '비활성' }
            />
          </Section>

          <Divider />

          {/* Theme */}
          <Section
            title="테마 모드"
            description="MUSE 앱 자체의 라이트/다크 모드"
          >
            <RadioGroup
              row
              value={ settings.themeMode || 'system' }
              onChange={ (e) => patch({ themeMode: e.target.value }) }
            >
              { THEME_MODES.map((m) => (
                <FormControlLabel
                  key={ m.value }
                  value={ m.value }
                  control={ <Radio /> }
                  label={ m.label }
                />
              )) }
            </RadioGroup>
          </Section>

          {/* Save */}
          { onSave && (
            <Box sx={ { display: 'flex', justifyContent: 'flex-end', pt: 2 } }>
              <Button
                variant="contained"
                color="primary"
                disabled={ !dirty }
                onClick={ () => {
                  onSave();
                  setDirty(false);
                } }
              >
                저장
              </Button>
            </Box>
          ) }
        </Box>

      <Box sx={ { height: 64 } } />
    </PageContainer>
  );
}

/** 사용량 행 — 라벨 좌측, 카운트 우측 */
function UsageRow({ label, used, limit }) {
  const ratio = limit > 0 ? Math.min(used / limit, 1) : 0;
  const color = ratio >= 1 ? 'error.main' : ratio >= 0.8 ? 'warning.main' : 'text.primary';
  return (
    <Box
      sx={ {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
      } }
    >
      <Typography variant="body2" color="text.secondary">{ label }</Typography>
      <Typography variant="body2" sx={ { fontWeight: 600, color, fontVariantNumeric: 'tabular-nums' } }>
        { used }
        <Box component="span" sx={ { color: 'text.disabled', fontWeight: 400, ml: 0.25 } }>
          / { limit }
        </Box>
      </Typography>
    </Box>
  );
}

/** 섹션 래퍼 (내부 유틸) */
function Section({ title, description, children }) {
  return (
    <Box>
      <Typography variant="h6" sx={ { mb: 0.5, fontWeight: 600 } }>{ title }</Typography>
      { description && (
        <Typography variant="body2" color="text.secondary" sx={ { mb: 2 } }>
          { description }
        </Typography>
      ) }
      { children }
    </Box>
  );
}
