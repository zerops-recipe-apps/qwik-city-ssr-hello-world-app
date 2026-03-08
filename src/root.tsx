import { component$ } from '@builder.io/qwik';
import {
  QwikCityProvider,
  RouterHead,
  RouterOutlet,
} from '@builder.io/qwik-city';

// Root layout: required by Qwik City. The health check route at /
// uses onGet with send() to return raw HTML, bypassing this
// component entirely. Root is kept for Qwik City completeness.
export default component$(() => {
  return (
    <QwikCityProvider>
      <head>
        <meta charset="utf-8" />
        <RouterHead />
      </head>
      <body>
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
