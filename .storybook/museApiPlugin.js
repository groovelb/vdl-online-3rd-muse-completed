/**
 * MUSE — Anthropic API 프록시 플러그인 (Vite)
 *
 * Storybook dev 서버에 `/api/anthropic/*` 엔드포인트를 추가한다.
 * 브라우저는 이 로컬 엔드포인트만 호출하고, 실제 Anthropic 호출과 API 키는
 * Node 프로세스 안에 머문다.
 *
 * 엔드포인트:
 *   GET  /api/anthropic/health       — 헬스 체크
 *   POST /api/anthropic/messages     — Anthropic messages.create 릴레이
 */

import { loadEnv } from 'vite';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const DEFAULT_MAX_TOKENS = 4096;

const sendJson = (res, status, payload) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); }
      catch (e) { reject(new Error(`Invalid JSON body: ${e.message}`)); }
    });
    req.on('error', reject);
  });

export function museApiPlugin() {
  const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '');
  const apiKey = env.ANTHROPIC_API_KEY;

  // eslint-disable-next-line no-console
  console.log(
    `[museApiPlugin] loaded. ANTHROPIC_API_KEY=${apiKey ? `${apiKey.slice(0, 12)}…` : '(MISSING)'}`,
  );

  const handler = async (req, res, next) => {
    const url = req.originalUrl || req.url || '';
    const path = url.split('?')[0];

    // /api/anthropic로 시작하는 요청만 로그 + 처리
    if (!path.startsWith('/api/anthropic')) return next();

    // eslint-disable-next-line no-console
    console.log(`[museApiPlugin] ${req.method} ${path}`);

    // GET /api/anthropic/health
    if (req.method === 'GET' && path === '/api/anthropic/health') {
      return sendJson(res, 200, {
        ok: true,
        hasKey: Boolean(apiKey),
        keyPrefix: apiKey ? apiKey.slice(0, 12) + '…' : null,
        endpoint: ANTHROPIC_API_URL,
      });
    }

    // POST /api/anthropic/messages
    if (req.method === 'POST' && path === '/api/anthropic/messages') {
      if (!apiKey) {
        return sendJson(res, 500, {
          error: 'ANTHROPIC_API_KEY not set',
          hint: '.env.local에 ANTHROPIC_API_KEY=sk-ant-... 추가 후 Storybook 재시작',
        });
      }

      let body;
      try {
        body = await readBody(req);
      } catch (e) {
        return sendJson(res, 400, { error: e.message });
      }

      if (!body.model || !Array.isArray(body.messages)) {
        return sendJson(res, 400, {
          error: 'body must include { model, messages[] }',
          received: Object.keys(body),
        });
      }

      try {
        const upstream = await fetch(ANTHROPIC_API_URL, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': ANTHROPIC_VERSION,
          },
          body: JSON.stringify({
            max_tokens: DEFAULT_MAX_TOKENS,
            ...body,
          }),
        });

        const text = await upstream.text();
        res.statusCode = upstream.status;
        res.setHeader('Content-Type', 'application/json');
        res.end(text);
      } catch (e) {
        return sendJson(res, 502, {
          error: 'Upstream fetch failed',
          detail: e?.message || String(e),
        });
      }
      return;
    }

    // /api/anthropic로 시작하지만 매칭 안 되는 경로
    return sendJson(res, 404, {
      error: 'Unknown endpoint',
      path,
      knownEndpoints: ['/api/anthropic/health', '/api/anthropic/messages'],
    });
  };

  return {
    name: 'muse-api-plugin',

    configureServer(server) {
      // 반환 함수(post-middlewares hook)를 사용해 Storybook/Vite 내장 middleware 뒤에
      // 우리 handler가 추가되지만, /api/anthropic 경로는 Storybook이 소유하지 않아
      // 우리 handler에서 처리 → sendJson으로 명시적 응답하면 404 기본 응답 대체됨.
      return () => {
        server.middlewares.use(handler);
      };
    },
  };
}
