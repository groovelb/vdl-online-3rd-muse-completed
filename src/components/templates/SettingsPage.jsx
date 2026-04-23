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
import { AppShell } from '../layout/AppShell.jsx';
import { PageContainer } from '../layout/PageContainer.jsx';

const AI_MODELS = [
  { value: 'claude-opus-4-7', label: 'Claude Opus 4.7 (최고 품질)' },
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6 (균형)' },
  { value: 'claude-haiku-4-5', label: 'Claude Haiku 4.5 (빠름)' },
];

const STORAGE_MODES = [
  { value: 'local', label: 'Local (브라우저)', hint: '외부 전송 없이 내 기기에만 저장' },
  { value: 'cloud', label: 'Cloud (계정)', hint: '다른 기기에서도 동기화 (계정 필요)' },
];

const THEME_MODES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

/**
 * SettingsPage 템플릿
 *
 * MUSE 설정 화면. AI 모델, 스토리지 모드, 테마 모드를 관리한다.
 *
 * Props:
 * @param {object} settings - { aiModel, storageMode, themeMode, isAutoTagEnabled } [Required]
 * @param {function} onChange - (patch) => void [Required]
 * @param {function} onSave - "저장" 클릭 [Optional]
 * @param {node} logo - AppShell 로고 [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <SettingsPage
 *   settings={ settings }
 *   onChange={ (patch) => updateSettings(patch) }
 *   onSave={ () => api.save(settings) }
 * />
 */
export function SettingsPage({ settings, onChange, onSave, logo, headerEnd, sx }) {
  const [dirty, setDirty] = useState(false);

  const patch = (next) => {
    setDirty(true);
    onChange?.(next);
  };

  return (
    <AppShell
      logo={ logo || <Typography variant="h6" sx={ { fontWeight: 700 } }>MUSE</Typography> }
      headerPersistent={ headerEnd }
      sx={ sx }
    >
      <PageContainer>
        {/* Hero */}
        <Box sx={ { py: { xs: 3, md: 5 } } }>
          <Typography variant="h3" sx={ { fontWeight: 700, letterSpacing: '-0.02em' } }>Settings</Typography>
        </Box>

        <Box sx={ { maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 5 } }>
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

          {/* Storage */}
          <Section
            title="스토리지"
            description="레퍼런스와 프로젝트를 어디에 저장할지 선택"
          >
            <RadioGroup
              value={ settings.storageMode || 'local' }
              onChange={ (e) => patch({ storageMode: e.target.value }) }
            >
              { STORAGE_MODES.map((m) => (
                <Box key={ m.value } sx={ { mb: 1 } }>
                  <FormControlLabel value={ m.value } control={ <Radio /> } label={ m.label } />
                  <Typography variant="caption" color="text.secondary" sx={ { display: 'block', pl: 4 } }>
                    { m.hint }
                  </Typography>
                </Box>
              )) }
            </RadioGroup>
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
    </AppShell>
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
