<script>

    import Stat1 from '$lib/components/stat_1/InteractiveDotPlotStat1.svelte'
    import Stat2 from '$lib/components/stat_2/InteractiveDotPlotStat2.svelte'
    import Stat3 from '$lib/components/stat_3/InteractiveDotPlotStat3.svelte'


    const charts = [
        {
          title: 'Stat 1',
          chart: Stat1
        },
        {
          title: 'Stat 2',
          chart: Stat2
        },
        {
          title: 'Stat 3',
          chart: Stat3
        }
    ];

    let activeChartIndex = $state(0);

    const activeChart = $derived(
        charts[activeChartIndex]
    );

</script>

<main>
    <header class="page-heading">
        <h1>Talent Trends Report</h1>
        <p>
        Below are the charts for you to preview and
        provide feedback. Select a stat to view the
        corresponding chart.
        </p>

        <div
            class="chart-tabs"
            role="tablist"
            aria-label="Select chart"
            >
                {#each charts as item, index}
                    <button
                        type="button"
                        role="tab"
                        class:active={
                            activeChartIndex === index
                        }
                        aria-selected={
                            activeChartIndex === index
                        }
                        onclick={() => {
                            activeChartIndex = index;
                        }}
                        >
                        {item.title}
                    </button>
                {/each}
            </div>
    </header>

    <section
        class="wide-chart"
        role="tabpanel"
    >
        <activeChart.chart />
    </section>
    


</main>

<style>
  main {
    width: 100%;

    box-sizing: border-box;

    padding-block:
      2rem
      5rem;

    font-family:
      'gotham',
      sans-serif;
  }

  .page-heading {
    width:
      min(
        100% - 2rem,
        1440px
      );

    margin:
      0 auto
      2rem;
  }

  h1 {
    margin:
      0
      0
      0.65rem;

    font-family:
      'gotham',
      sans-serif;
  }

  .page-heading p {
    max-width: 760px;

    margin:
      0
      0
      1.25rem;

    color: #626866;

    font-size: 0.9rem;
    line-height: 1.5;
  }

  .chart-tabs {
    display: flex;
    flex-wrap: wrap;

    gap: 0.45rem;
  }

  .chart-tabs button {
    border:
      1px solid
      #d5dad8;

    border-radius: 999px;

    padding:
      0.55rem
      0.85rem;

    background:
      #f3f5f4;

    color:
      #525856;

    font: inherit;
    font-size: 0.8rem;
    font-weight: 700;

    cursor: pointer;

    transition:
      background 150ms ease,
      border-color 150ms ease,
      color 150ms ease,
      transform 150ms ease;
  }

  .chart-tabs button:hover,
  .chart-tabs button:focus-visible {
    border-color:
      #8e9995;

    outline: none;
  }

  .chart-tabs button:active {
    transform:
      scale(0.97);
  }

  .chart-tabs button.active {
    border-color:
      #123f37;

    background:
      #123f37;

    color:
      white;
  }

  .wide-chart {
    width:
      min(
        100% - 2rem,
        1440px
      );

    margin:
      0 auto;
  }

  @media (
    max-width: 700px
  ) {
    main {
      padding-block:
        1rem
        3rem;
    }

    .page-heading,
    .wide-chart {
      width:
        min(
          100% - 1rem,
          1440px
        );
    }

    .chart-tabs {
      gap: 0.35rem;
    }

    .chart-tabs button {
      padding:
        0.48rem
        0.7rem;

      font-size:
        0.75rem;
    }
  }
</style>