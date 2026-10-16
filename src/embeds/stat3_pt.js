import { mount } from 'svelte';

import Chart
  from '$lib/components/stat_3_pt/InteractiveDotPlotStat3.svelte';

const selector =
  '[data-kf-trend="stat-3-pt"]';

function initialise() {
  document
    .querySelectorAll(selector)
    .forEach((target) => {

      /*
       * Avoid mounting the same
       * chart twice.
       */
      if (
        target.dataset
          .kfInitialised ===
        'true'
      ) {
        return;
      }

      mount(Chart, {
        target
      });

      target.dataset
        .kfInitialised =
        'true';
    });
}

if (
  document.readyState ===
  'loading'
) {
  document.addEventListener(
    'DOMContentLoaded',
    initialise,
    {
      once: true
    }
  );
} else {
  initialise();
}