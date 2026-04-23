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
  extractAllToolInputs,
  extractText,
  toImageBlock,
  imageUrlToBase64DataUrl,
} from '../../utils/museAi';
import {
  references,
  TASK_AUTO_TAG,
  TASK_RECOMMEND,
  TASK_ANALYZE_TOKENS,
} from '../../data/muse';
import { ColorSwatchList } from '../../components/data-display/ColorSwatchList';
import { TypographyPreview } from '../../components/data-display/TypographyPreview';
import { LayoutTokenPreview } from '../../components/data-display/LayoutTokenPreview';
import { GradientPreview } from '../../components/data-display/GradientPreview';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import Checkbox from '@mui/material/Checkbox';
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

                  {/* 5 레이어별 태그 */}
                  <Box sx={ { mb: 2, display: 'flex', flexDirection: 'column', gap: 1 } }>
                    <Typography variant="overline" color="text.secondary">Layered Tags</Typography>
                    { ['color', 'typography', 'layout', 'gradient'].map((layer) => {
                      const list = result.tags?.[layer] || [];
                      if (!list.length) return null;
                      return (
                        <Box key={ layer } sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
                          <Typography variant="caption" color="text.secondary" sx={ { minWidth: 84, fontFamily: 'monospace' } }>
                            { layer }
                          </Typography>
                          <Box sx={ { display: 'flex', gap: 0.5, flexWrap: 'wrap' } }>
                            { list.map((t) => (
                              <Chip key={ t } label={ t } size="small" color="primary" variant="outlined" />
                            )) }
                          </Box>
                        </Box>
                      );
                    }) }
                    { result.tags?.visualDirection && Object.entries(result.tags.visualDirection).map(([cat, list]) => (
                      list?.length > 0 && (
                        <Box key={ cat } sx={ { display: 'flex', alignItems: 'center', gap: 1 } }>
                          <Typography variant="caption" color="text.secondary" sx={ { minWidth: 84, fontFamily: 'monospace' } }>
                            vd.{ cat }
                          </Typography>
                          <Box sx={ { display: 'flex', gap: 0.5, flexWrap: 'wrap' } }>
                            { list.map((t) => (
                              <Chip key={ t } label={ t } size="small" color="secondary" variant="outlined" />
                            )) }
                          </Box>
                        </Box>
                      )
                    )) }
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

/* ============================================
 * T2 · Recommend — 의도 문장 → top-N 레퍼런스 추천 (텍스트만, 저렴)
 * ============================================ */

/** 아카이브 Reference를 T2 input 메타 형태로 압축 (이미지 없음) */
const toRecommendMeta = (r) => ({
  id: r.id,
  title: r.title,
  tags: r.tags,
  dominantColors: r.dominantColors,
});

const PROJECT_TYPES = [
  { value: 'landing', label: '랜딩' },
  { value: 'dashboard', label: '대시보드' },
  { value: 'mobile', label: '모바일' },
  { value: 'brand', label: '브랜드' },
];

export const T2Recommend = {
  name: 'T2 · Recommend',
  render: () => {
    const [intent, setIntent] = useState('흑백 대비 매거진 톤, 라지 타이포 중심');
    const [type, setType] = useState('landing');
    const [n, setN] = useState(6);
    const [model, setModel] = useState(TASK_RECOMMEND.model);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [elapsed, setElapsed] = useState(null);

    const run = async () => {
      setIsLoading(true);
      setError(null);
      setResult(null);
      setElapsed(null);
      const start = performance.now();
      try {
        const archive = references.map(toRecommendMeta);
        const userText = TASK_RECOMMEND.userMessageTemplate
          .replace('{{intent}}', intent)
          .replace('{{type}}', type)
          .replace('{{n}}', String(n))
          .replace('{{archiveCount}}', String(archive.length))
          .replace('{{archiveJson}}', JSON.stringify(archive, null, 2));

        const response = await callAnthropic({
          model,
          max_tokens: 1024,
          system: TASK_RECOMMEND.systemPrompt,
          tools: [TASK_RECOMMEND.toolSchema],
          tool_choice: { type: 'tool', name: TASK_RECOMMEND.toolSchema.name },
          messages: [{ role: 'user', content: userText }],
        });

        const toolInput = extractToolInput(response, TASK_RECOMMEND.toolSchema.name);
        if (!toolInput) throw new Error(`Tool use 응답 없음. text: ${extractText(response) || '(empty)'}`);
        setResult(toolInput);
      } catch (e) {
        setError(e?.message || String(e));
      } finally {
        setElapsed(Math.round(performance.now() - start));
        setIsLoading(false);
      }
    };

    const reasonById = new Map((result?.reasons || []).map((r) => [r.id, r.reason]));

    return (
      <>
        <DocumentTitle
          title="T2 · Recommend"
          status="Playground"
          note="Live test: intent → top-N references (text only, no images)"
          brandName="MUSE"
          systemName="AI Playground"
          version="0.1"
        />
        <PageContainer>
          <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
            T2 · Recommend
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={ { mb: 3 } }>
            { TASK_RECOMMEND.purpose } · 이미지를 보내지 않아 가장 저렴
          </Typography>

          {/* Controls */}
          <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2, mb: 3 } }>
            <TextField
              label="프로젝트 의도"
              value={ intent }
              onChange={ (e) => setIntent(e.target.value) }
              fullWidth
              multiline
              rows={ 2 }
            />
            <Box sx={ { display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' } }>
              <FormControl size="small" sx={ { minWidth: 160 } }>
                <InputLabel>Type</InputLabel>
                <Select label="Type" value={ type } onChange={ (e) => setType(e.target.value) }>
                  { PROJECT_TYPES.map((t) => <MenuItem key={ t.value } value={ t.value }>{ t.label }</MenuItem>) }
                </Select>
              </FormControl>
              <Box sx={ { display: 'flex', alignItems: 'center', gap: 1, minWidth: 220 } }>
                <Typography variant="caption" color="text.secondary">N</Typography>
                <Slider value={ n } onChange={ (_, v) => setN(v) } min={ 5 } max={ 10 } step={ 1 } marks valueLabelDisplay="auto" sx={ { maxWidth: 160 } } />
                <Typography variant="body2" sx={ { fontFamily: 'monospace', minWidth: 16 } }>{ n }</Typography>
              </Box>
              <FormControl size="small" sx={ { minWidth: 220 } }>
                <InputLabel>Model</InputLabel>
                <Select label="Model" value={ model } onChange={ (e) => setModel(e.target.value) }>
                  { MODEL_OPTIONS.map((m) => <MenuItem key={ m.value } value={ m.value }>{ m.label }</MenuItem>) }
                </Select>
              </FormControl>
              <Button variant="contained" onClick={ run } disabled={ isLoading || !intent.trim() }>
                { isLoading ? <><CircularProgress size={ 16 } sx={ { mr: 1 } } /> 추천 중… </> : '추천 실행' }
              </Button>
              { elapsed != null && <Typography variant="caption" color="text.secondary">{ elapsed } ms</Typography> }
            </Box>
          </Box>

          { error && <Alert severity="error" sx={ { mb: 3 } }>{ error }</Alert> }

          {/* Results — 추천 썸네일 그리드 */}
          { result && (
            <>
              <SectionTitle title={ `Top ${result.recommendedIds?.length || 0} 추천` } description="ranked best-first" />
              <Box sx={ { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 2, mb: 3 } }>
                { (result.recommendedIds || []).map((id, rank) => {
                  const ref = references.find((r) => r.id === id);
                  if (!ref) return null;
                  const reason = reasonById.get(id);
                  return (
                    <Box key={ id }>
                      <Box sx={ { position: 'relative' } }>
                        <Box
                          component="img"
                          src={ ref.thumbnailUrl }
                          alt={ ref.title }
                          sx={ { width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 2, border: '1px solid', borderColor: 'divider' } }
                        />
                        <Chip label={ `#${rank + 1}` } size="small" color="primary" sx={ { position: 'absolute', top: 8, left: 8 } } />
                      </Box>
                      <Typography variant="caption" sx={ { display: 'block', mt: 1, fontFamily: 'monospace', color: 'text.secondary' } }>{ id }</Typography>
                      <Typography variant="body2" sx={ { fontWeight: 500 } }>{ ref.title }</Typography>
                      { reason && (
                        <Typography variant="caption" color="text.secondary" sx={ { display: 'block', mt: 0.5 } }>
                          { reason }
                        </Typography>
                      ) }
                    </Box>
                  );
                }) }
              </Box>

              <SectionTitle title="Raw JSON" />
              <CodeBlock maxHeight={ 280 }>{ result }</CodeBlock>
            </>
          ) }
        </PageContainer>
      </>
    );
  },
};

/* ============================================
 * T3 · Analyze Tokens + Visual Direction (2 tool 패턴)
 * ============================================ */

const resizeDataUrl = async (dataUrl, maxDim = 1024) => {
  // 간단 리사이즈 — payload 줄이기 위해 긴 변 1024px 제한
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
};

export const T3AnalyzeTokens = {
  name: 'T3 · Analyze Tokens + VD',
  render: () => {
    const [intent, setIntent] = useState('흑백 대비 매거진 톤, 라지 타이포 중심');
    const [type, setType] = useState('landing');
    const [model, setModel] = useState(TASK_ANALYZE_TOKENS.model);
    const [selectedIds, setSelectedIds] = useState(new Set([references[0]?.id, references[4]?.id, references[9]?.id]));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tokensResult, setTokensResult] = useState(null);
    const [vdResult, setVdResult] = useState(null);
    const [elapsed, setElapsed] = useState(null);
    const [raw, setRaw] = useState(null);

    const toggleSelect = (id) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else if (next.size < 4) next.add(id); // 최대 4장 제한
        return next;
      });
    };

    const run = async () => {
      setIsLoading(true);
      setError(null);
      setTokensResult(null);
      setVdResult(null);
      setElapsed(null);
      setRaw(null);
      const start = performance.now();
      try {
        const selectedRefs = references.filter((r) => selectedIds.has(r.id));
        if (!selectedRefs.length) throw new Error('최소 1장 이상 선택 필요');

        // 각 이미지 base64 변환 + 리사이즈
        const imageBlocks = [];
        for (const ref of selectedRefs) {
          const dataUrl = await imageUrlToBase64DataUrl(ref.thumbnailUrl);
          const resized = await resizeDataUrl(dataUrl);
          imageBlocks.push({ ref, block: toImageBlock(resized) });
        }

        // user message: [이미지+레이어태그힌트] 반복 + 최종 지시
        const content = [];
        imageBlocks.forEach(({ ref, block }) => {
          content.push(block);
          content.push({
            type: 'text',
            text: `id: ${ref.id} · T1 tags: ${JSON.stringify(ref.tags)} · dominantColors: ${(ref.dominantColors || []).join(', ')}`,
          });
        });
        content.push({
          type: 'text',
          text: TASK_ANALYZE_TOKENS.userMessageTemplate
            .replace('{{intent}}', intent)
            .replace('{{type}}', type)
            .replace('{{count}}', String(selectedRefs.length))
            .replace('{{ids}}', selectedRefs.map((r) => r.id).join(', ')),
        });

        const response = await callAnthropic({
          model,
          max_tokens: 4096,
          system: TASK_ANALYZE_TOKENS.systemPrompt,
          tools: TASK_ANALYZE_TOKENS.toolSchemas,
          tool_choice: { type: 'any' }, // 둘 중 하나 이상 호출 강제
          messages: [{ role: 'user', content }],
        });

        setRaw(response);
        const allTools = extractAllToolInputs(response);
        setTokensResult(allTools.submit_tokens || null);
        setVdResult(allTools.submit_visual_direction || null);

        if (!allTools.submit_tokens && !allTools.submit_visual_direction) {
          throw new Error(`Tool use 응답 없음. text: ${extractText(response) || '(empty)'}`);
        }
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
          title="T3 · Analyze Tokens + Visual Direction"
          status="Playground"
          note="Live test: images + intent → 4 token layers + MD"
          brandName="MUSE"
          systemName="AI Playground"
          version="0.1"
        />
        <PageContainer>
          <Typography variant="h4" sx={ { fontWeight: 700, mb: 1 } }>
            T3 · Analyze Tokens + VD
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={ { mb: 3 } }>
            { TASK_ANALYZE_TOKENS.purpose } · 최대 4장 이미지 + 2 tool 단일 호출
          </Typography>

          {/* Controls */}
          <Box sx={ { display: 'flex', flexDirection: 'column', gap: 2, mb: 3 } }>
            <TextField label="프로젝트 의도" value={ intent } onChange={ (e) => setIntent(e.target.value) } fullWidth multiline rows={ 2 } />
            <Box sx={ { display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' } }>
              <FormControl size="small" sx={ { minWidth: 160 } }>
                <InputLabel>Type</InputLabel>
                <Select label="Type" value={ type } onChange={ (e) => setType(e.target.value) }>
                  { PROJECT_TYPES.map((t) => <MenuItem key={ t.value } value={ t.value }>{ t.label }</MenuItem>) }
                </Select>
              </FormControl>
              <FormControl size="small" sx={ { minWidth: 220 } }>
                <InputLabel>Model</InputLabel>
                <Select label="Model" value={ model } onChange={ (e) => setModel(e.target.value) }>
                  { MODEL_OPTIONS.map((m) => <MenuItem key={ m.value } value={ m.value }>{ m.label }</MenuItem>) }
                </Select>
              </FormControl>
              <Button variant="contained" onClick={ run } disabled={ isLoading || selectedIds.size === 0 }>
                { isLoading ? <><CircularProgress size={ 16 } sx={ { mr: 1 } } /> 분석 중… </> : `분석 실행 · ${selectedIds.size}장` }
              </Button>
              { elapsed != null && <Typography variant="caption" color="text.secondary">{ elapsed } ms</Typography> }
            </Box>
          </Box>

          {/* Reference picker (최대 4장) */}
          <SectionTitle title="레퍼런스 선택" description="최대 4장까지 (비용 절감)" />
          <Box sx={ { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 1.5, mb: 3, maxHeight: 320, overflow: 'auto', p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 2 } }>
            { references.map((ref) => {
              const isSelected = selectedIds.has(ref.id);
              return (
                <Box
                  key={ ref.id }
                  onClick={ () => toggleSelect(ref.id) }
                  sx={ {
                    position: 'relative',
                    cursor: 'pointer',
                    borderRadius: 2,
                    overflow: 'hidden',
                    outline: isSelected ? '2px solid' : 'none',
                    outlineColor: 'primary.main',
                  } }
                >
                  <Box component="img" src={ ref.thumbnailUrl } alt={ ref.title }
                    sx={ { width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block', opacity: isSelected ? 1 : 0.7 } } />
                  <Checkbox checked={ isSelected } size="small" sx={ { position: 'absolute', top: 2, left: 2, bgcolor: 'background.paper', borderRadius: '50%', p: 0.25 } } />
                  <Typography variant="caption" sx={ { position: 'absolute', bottom: 4, left: 4, px: 0.5, bgcolor: 'rgba(20,19,43,0.7)', color: 'white', borderRadius: 0.5, fontSize: 10 } }>
                    { ref.id }
                  </Typography>
                </Box>
              );
            }) }
          </Box>

          { error && <Alert severity="error" sx={ { mb: 3 } }>{ error }</Alert> }

          {/* Results */}
          { (tokensResult || vdResult) && (
            <>
              {/* Tokens preview — 실제 프리뷰 컴포넌트로 */}
              { tokensResult && (
                <>
                  <SectionTitle title="Token Layers (submit_tokens)" description="4 레이어 즉시 프리뷰" />
                  <Box sx={ { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 3 } }>
                    { tokensResult.color?.length > 0 && (
                      <Box>
                        <Typography variant="overline">color</Typography>
                        <ColorSwatchList tokens={ tokensResult.color } onChange={ () => {} } />
                      </Box>
                    ) }
                    { tokensResult.typography?.length > 0 && (
                      <Box>
                        <Typography variant="overline">typography</Typography>
                        <TypographyPreview tokens={ tokensResult.typography } onChange={ () => {} } />
                      </Box>
                    ) }
                    { tokensResult.layout?.length > 0 && (
                      <Box>
                        <Typography variant="overline">layout</Typography>
                        <LayoutTokenPreview tokens={ tokensResult.layout } onChange={ () => {} } />
                      </Box>
                    ) }
                    { tokensResult.gradient?.length > 0 && (
                      <Box>
                        <Typography variant="overline">gradient</Typography>
                        <GradientPreview tokens={ tokensResult.gradient } onChange={ () => {} } />
                      </Box>
                    ) }
                  </Box>
                </>
              ) }

              {/* Visual Direction MD */}
              { vdResult && (
                <>
                  <SectionTitle title="Visual Direction (submit_visual_direction)" description="MD 문서 + 집계 태그" />
                  { vdResult.tags && (
                    <Box sx={ { display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 } }>
                      { Object.entries(vdResult.tags).flatMap(([cat, list]) =>
                        (list || []).map((t) => (
                          <Chip key={ `${cat}-${t}` } size="small" label={ `${cat}:${t}` } variant="outlined" />
                        )),
                      ) }
                    </Box>
                  ) }
                  <Box
                    component="pre"
                    sx={ {
                      m: 0, p: 2.5, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'divider',
                      fontSize: 13, lineHeight: 1.7, fontFamily: 'inherit', whiteSpace: 'pre-wrap', maxHeight: 480, overflow: 'auto', mb: 3,
                    } }
                  >
                    { vdResult.markdown }
                  </Box>
                </>
              ) }

              {/* Raw debug */}
              { raw && (
                <>
                  <SectionTitle title="Raw API Response" description="디버그 — 전체 content blocks" />
                  <CodeBlock tone="dark" maxHeight={ 320 }>{ raw }</CodeBlock>
                </>
              ) }
            </>
          ) }
        </PageContainer>
      </>
    );
  },
};
