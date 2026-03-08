/*
 * WHAT IS THIS FILE?
 *
 * Browser entry point for development mode (vite --mode ssr).
 * Qwik City's vite plugin uses this to bootstrap the app in the
 * browser during development with HMR support.
 */
import { render } from '@builder.io/qwik';
import Root from './root';

render(document, <Root />);
