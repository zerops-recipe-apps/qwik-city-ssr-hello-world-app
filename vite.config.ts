import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { qwikCity } from '@builder.io/qwik-city/vite';
import { readFileSync } from 'fs';

// Read the installed Qwik version for the health check UI
const qwikVersion = (() => {
  try {
    return JSON.parse(
      readFileSync('./node_modules/@builder.io/qwik/package.json', 'utf-8')
    ).version;
  } catch {
    const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));
    return pkg.dependencies['@builder.io/qwik']?.replace(/[^0-9.]/g, '') ?? 'unknown';
  }
})();

export default defineConfig(() => {
  return {
    plugins: [
      qwikCity(),
      qwikVite(),
    ],
    // Inject build-time constants: Qwik version and build timestamp.
    // Accessible in server-side route handlers as global constants.
    define: {
      __QWIK_VERSION__: JSON.stringify(qwikVersion),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    // pg is a Node.js-only module used in the server-side onGet handler.
    // Marking it as an SSR external prevents it from being bundled into
    // the client build, avoiding browser compatibility warnings.
    ssr: {
      noExternal: [],
      external: ['pg', 'pg-pool', 'pg-connection-string', 'pgpass'],
    },
    preview: {
      headers: {
        'Cache-Control': 'public, max-age=600',
      },
    },
  };
});
