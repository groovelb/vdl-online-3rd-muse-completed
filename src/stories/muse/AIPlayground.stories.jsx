import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import {
  checkAnthropicHealth,
  callAnthropic,
  extractToolInput,
  extractText,
  toImageBlock,
  imageUrlToBase64DataUrl,
} from '../../utils/museAi';
import {
  references,
  TASK_AUTO_TAG,
} from '../../data/muse';
import {
  DocumentTitle,
  PageContainer,
  SectionTitle,
} from '../../components/storybookDocumentation';

export default {
  title: 'MUSE/AI Playground',
  parameters: { layout: 'padded' },
};

const CodeBlock = ({ children, tone = 'light', maxHeight }) => (
  <Box
    component="pre"
    sx={ {
      m: 0,
      p: 2,
      bgcolor: tone === 'dark' ? 'grey.900' : 'grey.100',
      color: tone === 'dark' ? 'grey.100' : 'text.primary',
      borderRadius: 2,
      fontSize: 12,
      lineHeight: 1.6,
      fontFamily: 'monospace',
      overflow: 'auto',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      maxHeight,
    } }
  >
    { typeof children === 'string' ? children : JSON.stringify(children, null, 2) }
  </Box>
);

/* ============================================
 * Health Check — Phase A 연결 확인
 * ============================================ */

export const HealthCheck = {
  name: 'Health Check',
  render: () => {
    const [status, setStatus] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await checkAnthropicHealth();
        setStatus(data);
      } catch (e) {
        setError(e?.message || String(e));
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => { run(); }, []);

    return (
      <>
        <DocumentTitle
          title="AI Health Check"
          status="Playground"
          note="Verifies /api/anthropic middleware is up"
          brandName="MUSE"
          systemName="AI Playground"
          version="0.1"
        />
        <PageContainer>
          <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
            Health Check
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={ { mb: 3 } }>
            Storybook Vite dev 서버의 <code>/api/anthropic/health</code> 프록시 엔드포인트 응답을 확인한다.
            <br />
            키는 서버에만 있고, 응답에는 앞 12자 prefix만 반환되어 브라우저에 절대 노출되지 않는다.
          </Typography>

          <Box sx={ { display: 'flex', gap: 1, mb: 2 } }>
            <Button variant="contained" onClick={ run } disabled={ isLoading }>
              { isLoading ? '확인 중…' : '재확인' }
            </Button>
          </Box>

          { error && <Alert severity="error" sx={ { mb: 2 } }>{ error }</Alert> }

          { status && (
            <>
              { status.hasKey ? (
                <Alert severity="success" sx={ { mb: 2 } }>
                  API 키가 서버 측에 로드되었습니다. ({ status.keyPrefix })
                </Alert>
              ) : (
                <Alert severity="warning" sx={ { mb: 2 } }>
                  API 키를 찾지 못했습니다. <code>.env.local</code>에 <code>ANTHROPIC_API_KEY</code>가 설정됐는지 확인 후 Storybook 재시작 필요.
                </Alert>
              ) }
              <SectionTitle title="응답 원본" />
              <CodeBlock>{ status }</CodeBlock>
            </>
          ) }
        </PageContainer>
      </>
    );
  },
};

/* ============================================
 * T1 · Auto Tag — 이미지 1장 태깅
 * ============================================ */

const MODEL_OPTIONS = [
  { value: 'claude-haiku-4-5', label: 'Haiku 4.5 (저렴·빠름)' },
  { value: 'claude-sonnet-4-6', label: 'Sonnet 4.6 (균형)' },
  { value: 'claude-opus-4-7', label: 'Opus 4.7 (최고 품질)' },
];

export const T1AutoTag = {
  name: 'T1 · Auto Tag',
  render: () => {
    const [selectedId, setSelectedId] = useState(references[0]?.id);
    const [model, setModel] = useState(TASK_AUTO_TAG.model);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [raw, setRaw] = useState(null);
    const [elapsed, setElapsed] = useState(null);

    const selected = references.find((r) => r.id === selectedId);

    const run = async () => {
      if (!selected) return;
      setIsLoading(true);
      setError(null);
      setResult(null);
      setRaw(null);
      setElapsed(null);
      const start = performance.now();
      try {
        // Vite import URL → base64 dataURL (Anthropic image 블록)
        const dataUrl = await imageUrlToBase64DataUrl(selected.thumbnailUrl);
        const imageBlock = toImageBlock(dataUrl);
        if (!imageBlock) throw new Error('이미지 블록 생성 실패');

        const response = await callAnthropic({
          model,
          max_tokens: 512,
          system: TASK_AUTO_TAG.systemPrompt,
          tools: [TASK_AUTO_TAG.toolSchema],
          tool_choice: { type: 'tool', name: TASK_AUTO_TAG.toolSchema.name },
          messages: [
            {
              role: 'user',
              content: [
                imageBlock,
                { type: 'text', text: TASK_AUTO_TAG.userMessageTemplate },
              ],
            },
          ],
        });

        setRaw(response);
        const toolInput = extractToolInput(response, TASK_AUTO_TAG.toolSchema.name);
        if (!toolInput) {
          throw new Error(`Tool use 응답 없음. text: ${extractText(response) || '(empty)'}`);
        }
        setResult(toolInput);
      } catch (e) {
        setError(e?.message || String(e));
      } finally {
        setElapsed(Math.round(performance.now() - start));
        setIsLoading(false);
      }
    };

    return (
      <>
        <DocumentTitle
          title="T1 · Auto Tag"
          status="Playground"
          note="Live test: image → tags / dominantColors / title"
          brandName="MUSE"
          systemName="AI Playground"
          version="0.1"
        />
        <PageContainer>
          <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
            T1 · Auto Tag
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={ { mb: 3 } }>
            { TASK_AUTO_TAG.purpose }
          </Typography>

          {/* Controls */}
          <Box sx={ { display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' } }>
            <FormControl size="small" sx={ { minWidth: 160 } }>
              <InputLabel>Reference</InputLabel>
              <Select
                label="Reference"
                value={ selectedId }
                onChange={ (e) => setSelectedId(e.target.value) }
              >
                { references.map((r) => (
                  <MenuItem key={ r.id } value={ r.id }>{ r.id } · { r.title }</MenuItem>
                )) }
              </Select>
            </FormControl>
            <FormControl size="small" sx={ { minWidth: 240 } }>
              <InputLabel>Model</InputLabel>
              <Select
                label="Model"
                value={ model }
                onChange={ (e) => setModel(e.target.value) }
              >
                { MODEL_OPTIONS.map((m) => (
                  <MenuItem key={ m.value } value={ m.value }>{ m.label }</MenuItem>
                )) }
              </Select>
            </FormControl>
            <Button variant="contained" onClick={ run } disabled={ isLoading }>
              { isLoading ? <><CircularProgress size={ 16 } sx={ { mr: 1 } } /> 분석 중… </> : '분석 실행' }
            </Button>
            { elapsed != null && (
              <Typography variant="caption" color="text.secondary">
                { elapsed } ms
              </Typography>
            ) }
          </Box>

          { error && <Alert severity="error" sx={ { mb: 3 } }>{ error }</Alert> }

          {/* Compare: Image vs Result */}
          <Box sx={ { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 } }>
            <Box>
              <Typography variant="caption" color="text.secondary" sx={ { display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.08em' } }>
                Input Image
              </Typography>
              { selected && (
                <>
                  <Box
                    component="img"
                    src={ selected.thumbnailUrl }
                    alt={ selected.title }
                    sx={ {
                      width: '100%',
                      aspectRatio: '4 / 3',
                      objectFit: 'cover',
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                    } }
                  />
                  <Typography variant="caption" sx={ { display: 'block', mt: 1, fontFamily: 'monospace', color: 'text.secondary' } }>
                    { selected.id } · { selected.title }
                  </Typography>
                </>
              ) }
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" sx={ { display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: '0.08em' } }>
                AI Output
              </Typography>

              { !result && !isLoading && (
                <Typography variant="body2" color="text.secondary">
                  분석 실행 버튼을 눌러주세요
                </Typography>
              ) }

              { result && (
                <>
                  <Box sx={ { mb: 2 } }>
                    <Typography variant="overline" color="text.secondary">Title</Typography>
                    <Typography variant="h6" sx={ { fontWeight: 600 } }>{ result.title }</Typography>
                  </Box>

                  <Box sx={ { mb: 2 } }>
                    <Typography variant="overline" color="text.secondary">Tags</Typography>
                    <Box sx={ { display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 0.5 } }>
                      { (result.tags || []).map((t) => (
                        <Chip key={ t } label={ t } size="small" color="primary" variant="outlined" />
                      )) }
                    </Box>
                  </Box>

                  <Box sx={ { mb: 2 } }>
                    <Typography variant="overline" color="text.secondary">Dominant Colors</Typography>
                    <Box sx={ { display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' } }>
                      { (result.dominantColors || []).map((hex) => (
                        <Box
                          key={ hex }
                          sx={ {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            px: 1.25,
                            py: 0.5,
                            borderRadius: 999,
                            border: '1px solid',
                            borderColor: 'divider',
                          } }
                        >
                          <Box sx={ { width: 16, height: 16, borderRadius: '50%', bgcolor: hex } } />
                          <Typography variant="caption" sx={ { fontFamily: 'monospace' } }>{ hex }</Typography>
                        </Box>
                      )) }
                    </Box>
                  </Box>

                  <Typography variant="overline" color="text.secondary">Raw JSON</Typography>
                  <CodeBlock maxHeight={ 240 }>{ result }</CodeBlock>
                </>
              ) }
            </Box>
          </Box>

          {/* Golden comparison */}
          <SectionTitle title="Golden Example" description="aiTasks.js에 정의된 기대 출력 (참고용)" />
          <CodeBlock>{ TASK_AUTO_TAG.goldenExample.expectedOutput }</CodeBlock>

          {/* Raw API response (debug) */}
          { raw && (
            <Box sx={ { mt: 3 } }>
              <SectionTitle title="Raw API Response" description="디버그용 — content blocks 전체" />
              <CodeBlock tone="dark" maxHeight={ 320 }>{ raw }</CodeBlock>
            </Box>
          ) }
        </PageContainer>
      </>
    );
  },
};
