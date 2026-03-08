/*
 * WHAT IS THIS FILE?
 *
 * SSR entry point. Qwik City uses this to render components server-side.
 * Imported by entry.express.tsx and passed to createQwikCity as the render
 * function. The health check at / bypasses rendering via send() in onGet,
 * but this file is required for Qwik City's SSR infrastructure.
 */
import { renderToStream, type RenderToStreamOptions } from '@builder.io/qwik/server';
import Root from './root';

export default function (opts: RenderToStreamOptions) {
  return renderToStream(<Root />, {
    ...opts,
    containerAttributes: {
      lang: 'en-us',
      ...opts.containerAttributes,
    },
  });
}
