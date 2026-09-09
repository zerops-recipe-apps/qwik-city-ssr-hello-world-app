# qwik-city-ssr-hello-world-app

Qwik City SSR app using the Express adapter and PostgreSQL on Zerops nodejs@24, with a two-pass Vite build.

## Zerops service facts

- HTTP port: `3000`
- Siblings: `db` (PostgreSQL) — env: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME`
- Runtime base: `nodejs@24`

## Zerops dev

`setup: dev` idles on `zsc noop --silent`; the agent starts the dev server.

- Dev command: `npm run dev`
- In-container rebuild without deploy: `npm run build`

**All platform operations (start/stop/status/logs of the dev server, deploy, env / scaling / storage / domains) go through the Zerops development workflow via `zcp` MCP tools. Don't shell out to `zcli`.**

## Notes

- Build uses `os: ubuntu` — Vite/Rollup requires glibc binaries unavailable on Alpine at build time.
- Qwik City's Express adapter is NOT self-contained — `node_modules` is deployed alongside `dist/` and `server/` so externalized runtime deps resolve.
- Two-pass build: client assets emit to `dist/`, server bundle to `server/entry.express.js`.
- Favicon lives in `public/favicon.ico`.
