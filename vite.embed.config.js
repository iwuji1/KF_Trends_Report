
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
 * Supported locales:
 *
 * en = English
 * pt = Portuguese
 * cn = Chinese
 * jp = Japanese
 */

const supportedLocales = [
  'en',
  'pt',
  'cn',
  'jp'
];

if (!supportedLocales.includes(locale)) {
  throw new Error(
    `Unsupported locale: ${locale}`
  );
}

/*
 * English:
 * src/embeds/stat1.js
 *
 * Portuguese:
 * src/embeds/stat1_pt.js
 *
 * Chinese:
 * src/embeds/stat1_cn.js
 *
 * Japanese:
 * src/embeds/stat1_jp.js
 */

const localeSuffix =
  locale === 'en'
    ? ''
    : `_${locale}`;

const localeName = {
  en: '',
  pt: 'Pt',
  cn: 'Cn',
  jp: 'Jp'
};

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
    outDir: 'static/charts',

    /*
     * Keep previously built charts.
     */
    emptyOutDir: false,

    minify: true,

    assetsInlineLimit: 100000,

    lib: {
      entry,

      name:
        `KFStat${stat}${localeName[locale]}`,

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
