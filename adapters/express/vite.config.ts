import { nodeServerAdapter } from '@builder.io/qwik-city/adapters/node-server/vite';
import { extendConfig } from '@builder.io/qwik-city/vite';
import baseConfig from '../../vite.config';

// SSR build: extends the base Vite config with the Node.js server
// adapter. Compiles src/entry.express.tsx → server/entry.express.js.
export default extendConfig(baseConfig, () => {
  return {
    build: {
      ssr: true,
      rollupOptions: {
        // The adapter requires both the server entry and the
        // @qwik-city-plan virtual module as rollup inputs.
        input: ['src/entry.express.tsx', '@qwik-city-plan'],
      },
    },
    plugins: [nodeServerAdapter({ name: 'express' })],
  };
});
