import type { RequestHandler } from '@builder.io/qwik-city';
import pkg from 'pg';

const { Pool } = pkg;

// onGet runs server-side for every GET /. It queries the database,
// sets HTTP status (200 OK or 503 if DB is unreachable), and returns
// a fully-rendered HTML page — no client-side JavaScript needed.
export const onGet: RequestHandler = async ({ send, env }) => {
  const pool = new Pool({
    host: env.get('DB_HOST'),
    port: Number(env.get('DB_PORT') || '5432'),
    database: env.get('DB_NAME') || 'db',
    user: env.get('DB_USER'),
    password: env.get('DB_PASS'),
    connectionTimeoutMillis: 5000,
  });

  let greeting = '';
  let dbStatus = 'connected';
  let dbStatusClass = 'status-ok';
  let httpStatus = 200;

  try {
    // Query the migrated data — proves schema exists and migration ran
    const result = await pool.query('SELECT message FROM greetings LIMIT 1');
    greeting = result.rows[0]?.message ?? 'Hello from Zerops!';
  } catch (err) {
    // DB unreachable: return 503 but still render the UI with error details
    dbStatus = `ERROR: ${err instanceof Error ? err.message : 'unknown error'}`;
    dbStatusClass = 'status-err';
    greeting = 'Hello from Zerops!';
    httpStatus = 503;
  } finally {
    await pool.end().catch(() => {});
  }

  const nodeEnv = env.get('NODE_ENV') || 'production';
  // __QWIK_VERSION__ and __BUILD_TIME__ are replaced at build time
  // by vite.config.ts define block — resolved to string literals.
  const qwikVersion = __QWIK_VERSION__;
  const buildTime = __BUILD_TIME__;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Qwik City · Zerops</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0a;
      color: #e4e4e7;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .container { max-width: 480px; width: 100%; }
    .logos {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .logo-sep { color: #3f3f46; font-size: 1.5rem; font-weight: 300; }
    h1 {
      text-align: center;
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      margin-bottom: 0.5rem;
      color: #fafafa;
    }
    .subtitle {
      text-align: center;
      color: #71717a;
      font-size: 0.875rem;
      margin-bottom: 2rem;
      line-height: 1.5;
    }
    .card {
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 12px;
      overflow: hidden;
    }
    .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.875rem 1.25rem;
      border-bottom: 1px solid #27272a;
    }
    .row:last-child { border-bottom: none; }
    .label { color: #71717a; font-size: 0.8125rem; }
    .value {
      font-size: 0.8125rem;
      font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
      color: #a1a1aa;
      max-width: 65%;
      text-align: right;
      word-break: break-all;
    }
    .status-ok { color: #4ade80 !important; }
    .status-err { color: #f87171 !important; }
  </style>
</head>
<body>
  <div class="container">
    <div class="logos">
      <!-- Qwik City logo: lightning bolt in Qwik purple -->
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="48" height="48" rx="12" fill="#150d27"/>
        <path d="M29 7L17 26h11L24 41l18-22H31L29 7z" fill="#AC7EF4"/>
      </svg>
      <span class="logo-sep">×</span>
      <!-- Zerops logo: Z wordmark -->
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="44" height="44" rx="10" fill="#1a1a1a" stroke="#27272a" stroke-width="1"/>
        <path d="M11 15h22L17 29h16" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <h1>${greeting}</h1>
    <p class="subtitle">Qwik City running on Zerops SSR – Node.js at runtime.</p>
    <div class="card">
      <div class="row">
        <span class="label">Framework</span>
        <span class="value">Qwik City v${qwikVersion}</span>
      </div>
      <div class="row">
        <span class="label">Environment</span>
        <span class="value">${nodeEnv}</span>
      </div>
      <div class="row">
        <span class="label">Build Time</span>
        <span class="value">${buildTime}</span>
      </div>
      <div class="row">
        <span class="label">Database</span>
        <span class="value ${dbStatusClass}">${dbStatus}</span>
      </div>
    </div>
  </div>
</body>
</html>`;

  // throw is required — send() returns an AbortMessage that halts
  // further Qwik City processing (no component rendering occurs)
  throw send(new Response(html, {
    status: httpStatus,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  }));
};
