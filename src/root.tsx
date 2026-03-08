import { component$ } from '@builder.io/qwik';
import { QwikCityProvider, RouterOutlet } from '@builder.io/qwik-city';

// Root layout: required by Qwik City's build infrastructure.
// The health check at / uses onGet with throw send() which returns raw
// HTML and bypasses component rendering entirely — this component is
// included for Qwik City completeness, not rendered at runtime.
export default component$(() => {
  return (
    <QwikCityProvider>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
