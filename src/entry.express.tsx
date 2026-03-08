/*
 * WHAT IS THIS FILE?
 *
 * Express HTTP server entry point compiled to server/entry.express.js.
 * Imports the Qwik City Node middleware to handle SSR rendering and
 * routing, then serves static assets from the client build in dist/.
 *
 * Start command: node server/entry.express.js
 */
import {
  createQwikCity,
  type PlatformNode,
} from '@builder.io/qwik-city/middleware/node';
import qwikCityPlan from '@qwik-city-plan';
import render from './entry.ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

declare global {
  type QwikCityPlatform = PlatformNode;
}

// entry.express.js is at /var/www/server/, so two levels up → /var/www/
const distDir = join(fileURLToPath(import.meta.url), '..', '..', 'dist');
const buildDir = join(distDir, 'build');
const assetsDir = join(distDir, 'assets');

const PORT = process.env.PORT ?? 3000;

// Qwik City middleware: handles all SSR rendering and onGet/onPost
// route handlers. env.get() in handlers reads from process.env.
const { router, notFound } = createQwikCity({
  render,
  qwikCityPlan,
});

const app = express();

// /build assets are content-hashed → immutable cache headers
app.use('/build', express.static(buildDir, { immutable: true, maxAge: '1y' }));
// /assets are also immutable (fonts, icons)
app.use('/assets', express.static(assetsDir, { immutable: true, maxAge: '1y' }));
// Other static files from dist/ (favicon, manifest, etc.)
app.use(express.static(distDir, { redirect: false }));

// Qwik City handles all page/endpoint routing
app.use(router);
// 404 fallback for unmatched routes
app.use(notFound);

app.listen(PORT, () => {
  console.log(`Server started: http://localhost:${PORT}/`);
});
