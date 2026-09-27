import {
  defineConfig
} from 'vite';

import {
  svelte
} from '@sveltejs/vite-plugin-svelte';

import cssInjectedByJsPlugin
  from 'vite-plugin-css-injected-by-js';

import path
  from 'node:path';

const stat =
  process.env.KF_STAT ?? '1';

const locale =
  process.env.KF_LOCALE ?? 'en';

/*
 * English:
 * src/embeds/stat1.js
 *
 * Portuguese:
 * src/embeds/stat1_pt.js
 */
const localeSuffix =
  locale === 'pt'
    ? '_pt'
    : '';

const entry =
  path.resolve(
    process.cwd(),
    `src/embeds/stat${stat}${localeSuffix}.js`
  );

export default defineConfig({
  plugins: [
    svelte(),

    cssInjectedByJsPlugin()
  ],

  resolve: {
    alias: {
      $lib: path.resolve(
        process.cwd(),
        'src/lib'
      )
    }
  },

  build: {
    outDir:
      'static/charts',

    /*
     * Keep previously built charts.
     */
    emptyOutDir: false,

    minify: true,

    assetsInlineLimit: 100000,

    lib: {
      entry,

      name:
        `KFStat${stat}${
          locale === 'pt'
            ? 'Pt'
            : ''
        }`,

      formats: [
        'iife'
      ],

      fileName: () =>
        `stat-${stat}${localeSuffix}.js`
    },

    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  }
});