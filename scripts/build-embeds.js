import {
  build
} from 'vite';

import {
  svelte
} from '@sveltejs/vite-plugin-svelte';

import {
  mkdir,
  rm
} from 'node:fs/promises';

import {
  resolve
} from 'node:path';


const projectRoot =
  process.cwd();

const outputDirectory =
  resolve(
    projectRoot,
    'static/embeds'
  );

const charts = [
  // -------------------------
  // English
  // -------------------------

  {
    name: 'stat1',
    entry:
      'src/embeds/stat1.js'
  },
  {
    name: 'stat2',
    entry:
      'src/embeds/stat2.js'
  },
  {
    name: 'stat3',
    entry:
      'src/embeds/stat3.js'
  },
  // -------------------------
  // Portuguese
  // -------------------------

  {
    name: 'stat1_pt',
    entry:
      'src/embeds/stat1_pt.js'
  },
  {
    name: 'stat2_pt',
    entry:
      'src/embeds/stat2_pt.js'
  },
  {
    name: 'stat3_pt',
    entry:
      'src/embeds/stat3_pt.js'
  }

];


/*
 * Vite normally writes component CSS into a
 * separate CSS file.
 *
 * This plugin places that CSS inside the chart's
 * JavaScript bundle so Webflow needs only one file.
 */
function inlineCssPlugin(
  chartName
) {
  return {
    name:
      `inline-css-${chartName}`,

    enforce: 'post',

    generateBundle(
      _options,
      bundle
    ) {
      const cssAssets =
        Object.entries(bundle)
          .filter(
            ([
              filename,
              output
            ]) => {
              return (
                output.type ===
                  'asset' &&
                filename.endsWith(
                  '.css'
                )
              );
            });

      if (
        cssAssets.length === 0
      ) {
        return;
      }

      const css =
        cssAssets
          .map(
            ([
              ,
              output
            ]) => {
              return String(
                output.source
              );
            }
          )
          .join('\n');

      const entryChunk =
        Object.values(bundle)
          .find(
            (output) => {
              return (
                output.type ===
                  'chunk' &&
                output.isEntry
              );
            });

      if (!entryChunk) {
        throw new Error(
          `Could not find the JavaScript entry for ${chartName}.`
        );
      }

      const styleAttribute =
        `data-kf-chart-style-${chartName}`;

      const injectCss = `
(function () {
  if (
    document.querySelector(
      'style[${styleAttribute}]'
    )
  ) {
    return;
  }

  var style =
    document.createElement(
      'style'
    );

  style.setAttribute(
    '${styleAttribute}',
    ''
  );

  style.textContent =
    ${JSON.stringify(css)};

  document.head.appendChild(
    style
  );
})();
`;

      entryChunk.code =
        injectCss +
        entryChunk.code;

      /*
       * Remove the separate CSS files because their
       * content is now inside the JS bundle.
       */
      cssAssets.forEach(
        ([filename]) => {
          delete bundle[
            filename
          ];
        }
      );
    }
  };
}


async function buildChart(
  chart
) {
  console.log(
    `Building ${chart.name}…`
  );

  await build({
    configFile: false,

    resolve: {
      alias: {
        $lib:
          resolve(
            projectRoot,
            'src/lib'
          )
      }
    },

    plugins: [
      svelte(),
      inlineCssPlugin(
        chart.name
      )
    ],

    build: {
      outDir:
        outputDirectory,

      emptyOutDir: false,

      /*
       * Ensures imported SVGs and other small assets
       * are included in the JavaScript bundle.
       */
      assetsInlineLimit:
        Infinity,

      cssCodeSplit: false,

      minify: 'esbuild',

      sourcemap: false,

      lib: {
        entry:
          resolve(
            projectRoot,
            chart.entry
          ),

        name:
          `KornFerry_${chart.name}`,

        formats: [
          'iife'
        ],

        fileName: () =>
          `${chart.name}.js`
      },

      rollupOptions: {
        output: {
          inlineDynamicImports:
            true
        }
      }
    }
  });

  console.log(
    `Created static/embeds/${chart.name}.js`
  );
}


async function main() {
  /*
   * Remove old bundles so deleted or renamed files
   * are not accidentally deployed.
   */
  await rm(
    outputDirectory,
    {
      recursive: true,
      force: true
    }
  );

  await mkdir(
    outputDirectory,
    {
      recursive: true
    }
  );

  for (
    const chart of charts
  ) {
    await buildChart(
      chart
    );
  }

  console.log(
    '\nAll chart embeds built successfully.'
  );
}


main().catch(
  (error) => {
    console.error(
      '\nChart embed build failed.'
    );

    console.error(
      error
    );

    process.exit(1);
  }
);