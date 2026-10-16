<script>
  import * as d3 from 'd3';

  import {
    draw,
    fade
  } from 'svelte/transition';

  import DotPlotTooltip
    from '../DotPlotTooltip.svelte'

  import DotPlotLegend
    from './DotPlotLegendStat1.svelte';

  import {
    SourceData,
    createLongData,
    createGlobalAverageData,
    segments,
    segmentOptions
  } from './stat1Data.js';


  let {
    sourceData = SourceData,
    initialSegment = 'Job Level'
  } = $props();

  /* ---------------------------------
     View state
     --------------------------------- */

  let selectedView =
    $state('average');

  const isAverageView =
    $derived(
      selectedView === 'average'
    );

  let selectedSegment =
    $state(
      segments.includes(
        initialSegment
      )
        ? initialSegment
        : segments[0]
    );


  /*
   * Selection order:
   *
   * [0] = highlighted cohort, green
   * [1] = comparison cohort, blue
   */
  let selectedCohorts =
    $state([]);

  const highlightedCohort =
    $derived(
      selectedCohorts[0] ?? ''
    );

  const comparisonCohort =
    $derived(
      selectedCohorts[1] ?? ''
    );

  let hoveredCohort =
    $state(null);

  let hoveredPoint =
    $state(null);

  let tooltipX =
    $state(0);

  let tooltipY =
    $state(0);

  let containerWidth =
    $state(900);

  /* ---------------------------------
     Segment data
     --------------------------------- */

  /*
   * Using $derived.by here makes the dependency
   * on selectedSegment explicit.
   */
  const cohorts =
    $derived.by(() => {
      return (
        segmentOptions[
          selectedSegment
        ] ?? []
      );
    });


  const currentDots =
    $derived.by(() => {
      return createLongData(
        sourceData,
        selectedSegment
      );
    });


  /*
   * The average value is repeated in each segment.
   * Job Level is used as the source for the opening
   * Global Average view.
   */
  const globalAverageDots =
  $derived.by(() => {
    return createGlobalAverageData(
      sourceData
    );
  });


  /*
   * Selected cohorts render after unselected cohorts
   * so that their dots appear visually on top.
   */
  const orderedCohortPoints =
    $derived.by(() => {
      return [
        ...currentDots
      ].sort((a, b) => {
        function priority(
          cohort
        ) {
          if (
            cohort ===
            highlightedCohort
          ) {
            return 3;
          }

          if (
            cohort ===
            comparisonCohort
          ) {
            return 2;
          }

          if (
            cohort ===
            hoveredCohort
          ) {
            return 1;
          }

          return 0;
        }

        return (
          priority(a.cohort) -
          priority(b.cohort)
        );
      });
    });


  /* ---------------------------------
     Responsive dimensions
     --------------------------------- */

  const isMobile =
    $derived(
      containerWidth <= 680
    );

  const width =
    $derived(
      isMobile
        ? Math.max(
            280,
            containerWidth
          )
        : Math.max(
            760,
            Math.min(
              940,
              containerWidth
            )
          )
    );


  const margin =
    $derived(
      isMobile
        ? {
            top: 70,
            right: 18,
            bottom: 46,
            left: 18
          }
        : {
            top: 72,
            right: 32,
            bottom: 58,
            left: 32
          }
    );


  const rowHeight =
    $derived(
      isMobile
        ? 112
        : 92
    );

  const measureLabelHeight =
    $derived(
      isMobile
        ? 72
        : 56
    );

  const measureLabelOffset =
    $derived(
      isMobile
        ? 96
        : 78
    );

  const rowPlotOffset =
    $derived(
      isMobile
        ? 62
        : 52
    );


  function getRowY(
    rowIndex
  ) {
    return (
      margin.top +
      rowIndex *
        rowHeight +
      rowPlotOffset
    );
  }


  const plotBottom =
    $derived(
      sourceData.length > 0
        ? getRowY(
            sourceData.length -
              1
          ) + 24
        : margin.top
    );


  const height =
    $derived(
      plotBottom +
        margin.bottom
    );


  const xScale =
    $derived(
      d3
        .scaleLinear()
        .domain([
          0,
          100
        ])
        .range([
          margin.left,
          width -
            margin.right
        ])
    );


  const axisTicks =
    $derived(
      isMobile
        ? [
            0,
            25,
            50,
            75,
            100
          ]
        : [
            0,
            20,
            40,
            60,
            80,
            100
          ]
    );


  /* ---------------------------------
     Colours
     --------------------------------- */

  const highlightColour =
    '#009b77';

  const highlightBorderColour =
    '#00634f';

  const comparisonColour =
    '#007da4';

  const defaultDotFill =
    '#e3e6e5';

  const defaultDotStroke =
    '#8f9995';


  function getCohortColour(
    cohort
  ) {
    if (
      cohort ===
      highlightedCohort
    ) {
      return highlightColour;
    }

    if (
      cohort ===
      comparisonCohort
    ) {
      return comparisonColour;
    }

    if (
      cohort ===
      hoveredCohort
    ) {
      return highlightColour;
    }

    return defaultDotStroke;
  }


  /*
  * Used for selected value labels and
  * selected legend-pill borders.
  */
  function getCohortTextColour(
    cohort
  ) {
    if (
      cohort ===
      highlightedCohort
    ) {
      return highlightBorderColour;
    }

    if (
      cohort ===
      comparisonCohort
    ) {
      return comparisonColour;
    }

    if (
      cohort ===
      hoveredCohort
    ) {
      return highlightBorderColour;
    }

    return '#272c2a';
  }


  function getDotFill(
    cohort
  ) {
    /*
    * Primary selection:
    * green fill.
    */
    if (
      cohort ===
      highlightedCohort
    ) {
      return highlightColour;
    }

    /*
    * Comparison selection:
    * white fill with blue border.
    */
    if (
      cohort ===
      comparisonCohort
    ) {
      return '#ffffff';
    }

    /*
    * Hover preview:
    * white fill with dark-green border.
    */
    if (
      cohort ===
      hoveredCohort
    ) {
      return '#ffffff';
    }

    return defaultDotFill;
  }


  function getDotStroke(
    cohort
  ) {
    if (
      cohort ===
      highlightedCohort
    ) {
      return highlightBorderColour;
    }

    if (
      cohort ===
      comparisonCohort
    ) {
      return comparisonColour;
    }

    if (
      cohort ===
      hoveredCohort
    ) {
      return highlightBorderColour;
    }

    return defaultDotStroke;
  }


  /* ---------------------------------
     Comparison data
     --------------------------------- */

  const selectedSeries =
    $derived.by(() => {
      return selectedCohorts.map(
        (cohort) => ({
          cohort,

          points:
            currentDots
              .filter(
                (point) =>
                  point.cohort ===
                  cohort
              )
              .sort(
                (a, b) =>
                  a.rowIndex -
                  b.rowIndex
              )
        })
      );
    });


  const comparisonRows =
    $derived.by(() => {
      if (
        selectedSeries.length !==
        2
      ) {
        return [];
      }

      const [
        firstSeries,
        secondSeries
      ] =
        selectedSeries;

      return sourceData
        .map(
          (
            row,
            rowIndex
          ) => {
            const firstPoint =
              firstSeries.points.find(
                (point) =>
                  point.rowIndex ===
                  rowIndex
              );

            const secondPoint =
              secondSeries.points.find(
                (point) =>
                  point.rowIndex ===
                  rowIndex
              );

            if (
              !firstPoint ||
              !secondPoint
            ) {
              return null;
            }

            return {
              rowIndex,

              firstCohort:
                firstSeries.cohort,

              secondCohort:
                secondSeries.cohort,

              firstPoint,
              secondPoint
            };
          }
        )
        .filter(Boolean);
    });


  /* ---------------------------------
     View selection
     --------------------------------- */

  function selectAverageView() {
    selectedView =
      'average';

    selectedCohorts = [];
    hoveredCohort = null;
    hoveredPoint = null;
  }

  function getDefaultComparison(
    segment
  ) {
    const availableCohorts =
      segmentOptions[segment] ?? [];

    const comparableCohorts =
      availableCohorts.filter(
        (cohort) =>
          cohort !== 'AVERAGE'
      );

    if (
      comparableCohorts.length === 0
    ) {
      return [];
    }

    if (
      comparableCohorts.length === 1
    ) {
      return [
        comparableCohorts[0]
      ];
    }

    return [
      comparableCohorts[0],
      comparableCohorts[
        comparableCohorts.length - 1
      ]
    ];
  }


  function selectSegment(
    segment
  ) {
    if (
      !segments.includes(
        segment
      )
    ) {
      return;
    }

    selectedView =
      'explore';

    selectedSegment =
      segment;

    /*
     * Reset selections because cohorts differ
     * between employee segments.
     */
    selectedCohorts = getDefaultComparison(
      segment
    );
    hoveredCohort = null;
    hoveredPoint = null;
  }


  /* ---------------------------------
     Cohort selection
     --------------------------------- */

  function selectCohort(
    cohort
  ) {
    if (
      !cohorts.includes(
        cohort
      )
    ) {
      return;
    }

    const selectedIndex =
      selectedCohorts.indexOf(
        cohort
      );


    /*
     * Clicking the only selected cohort clears it.
     */
    if (
      selectedIndex >= 0
    ) {
      selectedCohorts = selectedCohorts.filter(
        (selected) =>
          selected !== cohort
      )

      hoveredCohort = null;
      hoveredPoint = null;
      return;
    }

    /*
   * No selection: make this the primary
   * green cohort.
   */
  if (
    selectedCohorts.length === 0
  ) {
    selectedCohorts = [
      cohort
    ];

    return;
  }

  /*
   * One selection: add the blue comparison.
   */
  if (
    selectedCohorts.length === 1
  ) {
    selectedCohorts = [
      ...selectedCohorts,
      cohort
    ];

    return;
  }

  /*
   * Two selections already exist:
   * keep the green cohort and replace blue.
   */
  selectedCohorts = [
    selectedCohorts[0],
    cohort
  ];
}


  function resetComparison() {
    selectedCohorts = getDefaultComparison(
      selectedSegment
    );
    hoveredCohort = null;
    hoveredPoint = null;
  }


  /* ---------------------------------
     Legend preview
     --------------------------------- */

  function previewCohort(
    cohort
  ) {
    hoveredCohort =
      cohort;
  }


  function clearPreview() {
    if (!hoveredPoint) {
      hoveredCohort = null;
    }
  }


  /* ---------------------------------
     Tooltip
     --------------------------------- */

  function showTooltip(
    event,
    point
  ) {
    hoveredPoint =
      point;

    hoveredCohort =
      point.cohort;

    updateTooltipPosition(
      event
    );
  }


  function updateTooltipPosition(
    event
  ) {
    tooltipX =
      event.clientX;

    tooltipY =
      event.clientY;
  }


  function hideTooltip() {
    hoveredPoint = null;
    hoveredCohort = null;
  }


  function handleDotKeydown(
    event,
    point
  ) {
    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();

      selectCohort(
        point.cohort
      );
    }

    if (
      event.key ===
      'Escape'
    ) {
      resetComparison();
    }
  }


  /* ---------------------------------
     Dot appearance
     --------------------------------- */

  function isSelected(
    cohort
  ) {
    return selectedCohorts.includes(
      cohort
    );
  }


  function isHovered(
    cohort
  ) {
    return (
      hoveredCohort ===
      cohort
    );
  }


  function isHighlighted(
    cohort
  ) {
    return (
      isSelected(cohort) ||
      isHovered(cohort)
    );
  }

  function getDotOpacity(
    cohort
  ) {
    /*
     * Nothing selected or previewed:
     * hide all exploratory dots.
     */
    if (
      selectedCohorts.length ===
        0 &&
      !hoveredCohort
    ) {
      return 0;
    }


    /*
     * Selected dots stay visible.
     */
    if (
      isSelected(cohort)
    ) {
      return 1;
    }


    /*
     * Legend hover temporarily reveals only the
     * hovered cohort.
     */
    if (
      isHovered(cohort)
    ) {
      return 1;
    }


    return 0;
  }


  function isDotHidden(
    cohort
  ) {
    return (
      getDotOpacity(cohort) ===
      0
    );
  }


  function getDotRadius(
    cohort
  ) {
    return isHighlighted(
      cohort
    )
      ? 12
      : 10;
  }


  function getGradientId(
    rowIndex
  ) {
    return (
      `stat-1-v3-gradient-${rowIndex}`
    );
  }


  /*
   * Ensure the gradient always runs in the correct
   * geometric direction, even when the green value
   * is greater than the blue value.
   */
  function getGradientDetails(
    comparison
  ) {
    const firstValue =
      comparison.firstPoint.value;

    const secondValue =
      comparison.secondPoint.value;

    if (
      firstValue <= secondValue
    ) {
      return {
        x1:
          xScale(firstValue),

        x2:
          xScale(secondValue),

        startColour:
          getCohortColour(
            comparison.firstCohort
          ),

        endColour:
          getCohortColour(
            comparison.secondCohort
          )
      };
    }

    return {
      x1:
        xScale(secondValue),

      x2:
        xScale(firstValue),

      startColour:
        getCohortColour(
          comparison.secondCohort
        ),

      endColour:
        getCohortColour(
          comparison.firstCohort
        )
    };
  }

  const valueLabelGap = 20;

  function getOtherSelectedPoint(
    point,
    cohort
  ) {
    const otherCohort =
      selectedCohorts.find(
        (selected) =>
          selected !== cohort
      );

    if (!otherCohort) {
      return null;
    }

    return (
      currentDots.find(
        (candidate) =>
          candidate.rowIndex ===
            point.rowIndex &&
          candidate.cohort ===
            otherCohort
      ) ?? null
    );
  }


  /*
  * Position labels outside the comparison:
  *
  * leftmost dot  → label on its left
  * rightmost dot → label on its right
  */
  function getLabelSide(
    point,
    cohort
  ) {
    const otherPoint =
      getOtherSelectedPoint(
        point,
        cohort
      );

    /*
    * Only one cohort is selected.
    * Prefer the right, unless the dot is close
    * to the chart's right-hand edge.
    */
    if (!otherPoint) {
      return point.value >= 88
        ? 'left'
        : 'right';
    }

    if (
      point.value <
      otherPoint.value
    ) {
      return 'left';
    }

    if (
      point.value >
      otherPoint.value
    ) {
      return 'right';
    }

    /*
    * If both values are identical, put one
    * label on either side of the shared dot.
    */
    return (
      selectedCohorts.indexOf(
        cohort
      ) === 0
        ? 'left'
        : 'right'
    );
  }


  function getLabelX(
    point,
    cohort
  ) {
    const side =
      getLabelSide(
        point,
        cohort
      );

    const dotX =
      xScale(
        point.value
      );

    if (side === 'left') {
      return Math.max(
        margin.left + 2,
        dotX - valueLabelGap
      );
    }

    return Math.min(
      width -
        margin.right -
        2,
      dotX +
        valueLabelGap
    );
  }


  function getLabelAnchor(
    point,
    cohort
  ) {
    return (
      getLabelSide(
        point,
        cohort
      ) === 'left'
        ? 'end'
        : 'start'
    );
  }


  function getLabelY(
    point,
    cohort
  ) {
    const otherPoint =
      getOtherSelectedPoint(
        point,
        cohort
      );

    /*
    * If the two values are exactly the same,
    * separate the labels vertically as well.
    */
    if (
      otherPoint &&
      point.value ===
        otherPoint.value
    ) {
      return (
        selectedCohorts.indexOf(
          cohort
        ) === 0
          ? getRowY(
              point.rowIndex
            ) - 25
          : getRowY(
              point.rowIndex
            ) + 25
      );
    }

    return (
      getRowY(
        point.rowIndex
      ) + 6
    );
  }

  function handleDotClick(
    event,
    point
  ) {
    event.stopPropagation();

    /*
    * On touch devices, tapping performs the
    * information-preview role of hover.
    */
    showTooltip(
      event,
      point
    );

    selectCohort(
      point.cohort
    );
  }

</script>


<section class="dot-plot-stat-1">

  <div class="chart-heading">
    <!-- <h2>
      Overwhelmed with the Wrong Work
    </h2> -->
  </div>


  <div class="sticky-controls">
    <div class="controls">

      <div class="segment-control">
        <p class="control-label">
          Selecione a Visualização
        </p>

        <div
          class="segment-selector"
          role="group"
          aria-label="Select chart view"
        >
          <button
            type="button"
            class:active={
              isAverageView
            }
            aria-pressed={
              isAverageView
            }
            onclick={
              selectAverageView
            }
          >
            Média Global
          </button>

          {#each
            segments
            as segment
          }
            <button
              type="button"
              class:active={
                !isAverageView &&
                selectedSegment ===
                  segment
              }
              aria-pressed={
                !isAverageView &&
                selectedSegment ===
                  segment
              }
              onclick={() =>
                selectSegment(
                  segment
                )}
            >
              {segment}
            </button>
          {/each}
        </div>
      </div>


      {#if !isAverageView}
        <!--
          Keying this block forces the legend to be
          recreated whenever the selected segment changes.
        -->
        {#key selectedSegment}
          <div class="cohort-control">
            <div class="cohort-control-heading">
              <p class="control-label">
                SELECIONE ATÉ 2 GRUPOS
              </p>
            </div>

            <DotPlotLegend
              {cohorts}
              {getCohortTextColour}
              {selectedCohorts}
              {hoveredCohort}
              onSelect={
                selectCohort
              }
              onPreview={
                previewCohort
              }
              onClearPreview={
                clearPreview
              }
            />
          </div>
        {/key}
      {/if}

    </div>
  </div>


  <div
    class="chart-wrapper"
    bind:clientWidth={
      containerWidth
    }
    onclick= {() => {
      hoveredPoint = null;
      hoveredCohort = null;
    }}
  >
    <svg
      {width}
      {height}
      viewBox={`
        0 0
        ${width}
        ${height}
      `}
      role="img"
      aria-labelledby="
        stat-1-dot-plot-title
        stat-1-dot-plot-description
      "
    >

      <title id="stat-1-dot-plot-title">
        {#if isAverageView}
          Global average agreement with selected
          workload and capability statements
        {:else}
          Agreement with workload and capability
          statements by {selectedSegment}
        {/if}
      </title>

      <desc id="stat-1-dot-plot-description">
        Each row represents a survey statement.
        Selecting an employee segment displays its
        available cohorts. The first selected cohort is
        green and a second comparison cohort is blue.
      </desc>


      <defs>
        {#each
          comparisonRows
          as comparison
        }
          {@const gradient =
            getGradientDetails(
              comparison
            )}

          <linearGradient
            id={getGradientId(
              comparison.rowIndex
            )}
            gradientUnits="userSpaceOnUse"
            x1={gradient.x1}
            x2={gradient.x2}
            y1="0"
            y2="0"
          >
            <stop
              offset="0%"
              stop-color={
                gradient.startColour
              }
            />

            <stop
              offset="100%"
              stop-color={
                gradient.endColour
              }
            />
          </linearGradient>
        {/each}
      </defs>


      <!-- Axis -->
      <g
        class="axis"
        aria-hidden="true"
      >
        <text
          class="axis-title"
          x={margin.left}
          y="14"
        >
          Percentual que concorda
        </text>

        <line
          class="axis-baseline"
          x1={margin.left}
          x2={
            width -
            margin.right
          }
          y1="34"
          y2="34"
        />

        {#each
          axisTicks
          as tick
        }
          <line
            class="axis-tick-line"
            x1={xScale(tick)}
            x2={xScale(tick)}
            y1="29"
            y2="39"
          />

          <text
            class="axis-tick-label"
            x={xScale(tick)}
            y="53"
            text-anchor="middle"
          >
            {tick}<tspan
              font-size="7"
              class="percent-sign"
              baseline-shift="super"
            >%</tspan>
          </text>

          <line
            class="axis-grid-line"
            x1={xScale(tick)}
            x2={xScale(tick)}
            y1="58"
            y2={plotBottom}
          />
        {/each}
      </g>


      <!-- Statement rows -->
      <g class="rows">
        {#each
          sourceData
          as row,
          rowIndex
        }
          {@const rowY =
            getRowY(
              rowIndex
            )}

          <g class="statement-row">
            <foreignObject
              x={margin.left}
              y={
                rowY -
                measureLabelOffset
              }
              width={
                width -
                margin.left -
                margin.right
              }
              height={
                measureLabelHeight
              }
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                class="measure-label"
              >
                {row.measure}
              </div>
            </foreignObject>

            <line
              class="row-guide"
              x1={margin.left}
              x2={
                width -
                margin.right
              }
              y1={rowY}
              y2={rowY}
            />
          </g>
        {/each}
      </g>


      <!-- Comparison gradients -->
      {#if
        !isAverageView &&
        comparisonRows.length >
          0
      }
        <g class="comparison-lines">
          {#each
            comparisonRows
            as comparison
          }
            <line
              class="comparison-line-outline"
              x1={xScale(
                comparison
                  .firstPoint
                  .value
              )}
              x2={xScale(
                comparison
                  .secondPoint
                  .value
              )}
              y1={getRowY(
                comparison.rowIndex
              )}
              y2={getRowY(
                comparison.rowIndex
              )}
            />

            <line
              class="comparison-line"
              x1={xScale(
                comparison
                  .firstPoint
                  .value
              )}
              x2={xScale(
                comparison
                  .secondPoint
                  .value
              )}
              y1={getRowY(
                comparison.rowIndex
              )}
              y2={getRowY(
                comparison.rowIndex
              )}
              stroke={`url(#${getGradientId(
                comparison.rowIndex
              )})`}
              in:draw={{
                duration: 300
              }}
              out:fade={{
                duration: 100
              }}
            />
          {/each}
        </g>
      {/if}


      <!-- Global average opening view -->
      {#if isAverageView}
        <g class="global-average-dots">
          {#each
            globalAverageDots
            as point
          }            
          
          
            <rect
                class="bar"
                x={margin.left}
                y={getRowY(
                  point.rowIndex
                ) - 2}
                width={xScale(point.value) - margin.left}
                height={5}
                fill="#00634f"
              />

            <circle
              class="average-dot"
              cx={xScale(
                point.value
              )}
              cy={getRowY(
                point.rowIndex
              )}
              r="9"
              fill="#009b77"
              stroke="#00634f"
              stroke-width="2"
            >
            </circle>



            <text
              class="average-value-label"
              x={xScale(
                point.value
              ) + 35}
              y={
                getRowY(
                  point.rowIndex
                ) + 5
              }
              text-anchor="middle"
            >
              {Math.round(point.value)}<tspan
                font-size="7"
                class="percent-sign"
                baseline-shift="super"
              >%</tspan>
            </text>
          {/each}
        </g>
      {/if}


      <!-- Exploratory cohort dots -->
      {#if !isAverageView}
        {#key selectedSegment}
          <g class="cohort-dots">
            {#each
              orderedCohortPoints
              as point
            }
              {@const hidden =
                isDotHidden(
                  point.cohort
                )}

              <circle
                class="dot"
                class:active-dot={
                  isHighlighted(
                    point.cohort
                  )
                }
                class:hidden-dot={
                  hidden
                }
                cx={xScale(
                  point.value
                )}
                cy={getRowY(
                  point.rowIndex
                )}
                r={getDotRadius(
                  point.cohort
                )}
                fill={getDotFill(
                  point.cohort
                )}
                stroke={getDotStroke(point.cohort)}
                opacity={getDotOpacity(
                  point.cohort
                )}
                role="button"
                tabindex={
                  hidden
                    ? -1
                    : 0
                }
                aria-hidden={
                  hidden
                }
                aria-pressed={
                  isSelected(
                    point.cohort
                  )
                }
                onmouseenter={(event) =>
                  showTooltip(
                    event,
                    point
                  )}
                onmousemove={
                  updateTooltipPosition
                }
                onmouseleave={
                  hideTooltip
                }
                onfocus={(event) => {
                  const bounds =
                    event.currentTarget
                      .getBoundingClientRect();

                  showTooltip(
                    {
                      clientX:
                        bounds.left +
                        bounds.width / 2,

                      clientY:
                        bounds.top +
                        bounds.height / 2
                    },
                    point
                  );
                }}
                onblur={
                  hideTooltip
                }
                onclick={(event) =>
                  handleDotClick(
                    event,
                    point
                  )}
                onkeydown={(event) =>
                  handleDotKeydown(
                    event,
                    point
                  )}
              >
              </circle>
            {/each}
          </g>
        {/key}
      {/if}


      <!-- Selected values -->
      {#if
        !isAverageView &&
        selectedSeries.length >
          0
      }
        <g
          class="selected-values"
          in:fade={{
            duration: 160
          }}
          out:fade={{
            duration: 80
          }}
        >
          {#each
            selectedSeries
            as series
          }
            {#each
              series.points
              as point
            }
              <text
                class="value-label"
                x={getLabelX(
                  point,
                  series.cohort
                )}
                y={getRowY(
                  point.rowIndex
                ) + 3}
                text-anchor={getLabelAnchor(point, series.cohort)}
                dominant-baseline="middle"
                fill={getCohortTextColour(
                  series.cohort
                )}
              >
                {Math.round(point.value)}<tspan
                  font-size="7"
                  class="percent-sign"
                  baseline-shift="super"
                >%</tspan>
              </text>
            {/each}
          {/each}
        </g>
      {/if}

    </svg>
  </div>


  {#if !isAverageView}
    <DotPlotTooltip
      point={hoveredPoint}
      x={tooltipX}
      y={tooltipY}
      colour={
        hoveredPoint
          ? getCohortColour(
              hoveredPoint.cohort
            )
          : highlightColour
      }
    />
  {/if}

</section>


<style>
  .dot-plot-stat-1 {
    --kf-green: #009b77;
    --kf-green-dark: #00634f;
    --kf-eyebrow: #053328;
    --kf-blue: #007da4;
    --kf-black: #000000;
    --kf-grey: #8f9995;
    --kf-light-grey: #e3e6e5;

    width: 100%;
    max-width: 940px;
    margin-inline: auto;

    overflow: visible;

    color: var(--kf-black);

    font-family:
      'Gotham',
      Arial,
      sans-serif;
  }

  /* Main page heading */
  .page-title,
  h1 {
    margin: 0;

    color: var(--kf-green);

    font-size: 64px;
    font-weight: 700;
    line-height: 1.05;
  }

  /* Chart and section headings */
  .chart-heading h2,
  h2 {
    margin: 0;

    color: var(--kf-green);

    font-size: 32px;
    font-weight: 500;
    line-height: 1.15;

    text-transform: uppercase;
  }

  /* Pull quotes */
  .quote {
    margin: 0;

    color: var(--kf-green);

    font-size: 24px;
    font-weight: 500;
    line-height: 1.35;
  }

  /* Standard body copy */
  .body-copy {
    color: var(--kf-black);

    font-size: 18px;
    font-weight: 400;
    line-height: 1.5;
  }

  /* Small uppercase labels */

  @media (max-width: 680px) {
    .chart-heading h2 {
      font-size: 28px;
    }

    .chart-explanation {
      font-size: 16px;
    }

    .control-label,
    .axis-title {
      font-size: 13px;
    }

    .axis-tick-label {
      font-size: 12px;
    }

    .measure-label {
      font-size: 16px;
      line-height: 1.35;
    }

    .value-label,
    .average-value-label {
      font-size: 18px;
    }

    .percent-sign {
      font-size: 10px;
    }
  }

  h2 {
    font-size: 32px;
  }

  p {
    font-family:
      'gotham',
      Arial,
      sans-serif;
    font-size: 18px;
  }


  .chart-heading {
    margin-bottom: 1rem;
  }

  .chart-explanation {
    max-width: 940px;

    margin:
      0.75rem
      0
      0;

    color: var(--kf-black);

    font-size: 18px;
    font-weight: 400;
    line-height: 1.55;
  }


  /* Controls */

  .sticky-controls {
    position: sticky;
    top: 12px;
    z-index: 20;

    margin-bottom: 1.25rem;
    padding: 1rem;

    border:
      1px solid
      #dfe3e1;

    border-radius: 0.9rem;

    background:
      rgb(
        255 255 255 /
        96%
      );

    box-shadow:
      0 7px 24px
      rgb(
        0 0 0 /
        8%
      );

    backdrop-filter:
      blur(8px);

    -webkit-backdrop-filter:
      blur(8px);
  }

  .controls {
    display: grid;
    grid-template-columns:
      minmax(0, 1fr);

    gap: 1rem;

    width: 100%;
  }

  .segment-control,
  .cohort-control {
    width: 100%;
    min-width: 0;
  }

  .control-label, .axis-title {
    margin:
      0
      0
      0.55rem;

    color: #053328;

    font-size: 0.68rem;
    font-weight: 800;

    letter-spacing:
      0.06em;

    text-transform:
      uppercase;
  }


  /* View pills */

  .segment-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    width: 100%;
  }

  .segment-selector button {
    min-height: 48px;

    border:
      1.5px solid
      var(--kf-green-dark);

    border-radius: 2px;

    padding:
      0.7rem
      1.4rem;

    background: #ffffff;
    color: var(--kf-green-dark);

    font: inherit;
    font-size: 16px;
    font-weight: 500;

    cursor: pointer;

    transition:
      border-color 150ms ease,
      background 150ms ease,
      color 150ms ease,
      transform 150ms ease;
  }

  .segment-selector button:hover,
  .segment-selector button:focus-visible {
    background: #f2f8f6;
    outline: none;
  }

  .segment-selector button.active {
    background: var(--kf-green-dark);
    color: #ffffff;
  }


  /* Cohort controls */

  .cohort-control-heading {
    display: flex;
    gap: 0.75rem;

    align-items: center;
    justify-content:
      space-between;

    margin-bottom: 0.55rem;
  }

  .cohort-control-heading {
    margin: 0;
  }




  /* Chart */

  .chart-wrapper {
    width: 100%;
    min-width: 0;

    overflow-x: auto;

    overscroll-behavior-inline:
      contain;
  }

  svg {
    display: block;

    width: 100%;
    height: auto;

    overflow: visible;

    background: white;
  }


  /* Axis */

  .axis-title {
    fill: #053328;
  }

  .axis-baseline,
  .axis-tick-line {
    stroke: #89918e;
    stroke-width: 1;
  }

  .axis-tick-label {
    fill: #000000;

    font-family:
      'Gotham',
      Arial,
      sans-serif;

    font-size: 14px;
    font-weight: 400;
  }

  .axis-grid-line {
    stroke: #d8dddb;
    stroke-width: 1;
    stroke-dasharray: 3 5;

    pointer-events: none;
  }


  /* Rows */

  .measure-label {
    display: flex;
    align-items: flex-end;

    width: 100%;
    height: 100%;

    color: #000000;

    font-family:
      'Gotham',
      Arial,
      sans-serif;

    font-size: 18px;
    font-weight: 400;
    line-height: 1.35;
  }

  .row-guide {
    stroke: #dfe3e1;
    stroke-width: 1;
  }


  /* Comparison */

  .comparison-line-outline {
    stroke: white;

    stroke-width: 19;

    stroke-linecap: round;
  }

  .comparison-line {
    stroke-width: 14;

    stroke-linecap: round;

    pointer-events: none;
  }


  /* Dots */

  .dot,
  .average-dot {
    box-sizing: border-box;

    stroke-width: 2;

    transition:
      r 180ms ease,
      fill 180ms ease,
      opacity 240ms ease,
      stroke 180ms ease,
      stroke-width 180ms ease;
  }

  .dot {
    cursor: pointer;
  }

  .dot:hover,
  .dot:focus-visible,
  .dot.active-dot {
    stroke-width: 2.5;

    outline: none;

    filter:
      drop-shadow(
        0 2px 3px
        rgb(0 0 0 / 12%)
      );
  }

  .hidden-dot {
    pointer-events: none;
  }


  /* Labels */

  .value-label,
  .average-value-label {
    font-family:
      'Gotham',
      Arial,
      sans-serif;

    font-size: 20px;
    font-weight: 400;

    pointer-events: none;

    paint-order: stroke;
    stroke: #ffffff;
    stroke-width: 4px;
    stroke-linejoin: round;
  }

  .percent-sign {
    font-size: 11px;
    font-weight: 400;
  }


  /* Mobile */

  @media (
    min-width: 681px
  ) {
    svg {
      min-width: 760px;
    }
  }

  @media (
    max-width: 680px
  ) {
    .dot-plot-stat-1 {
      width: 100%;
    }

    .sticky-controls {
      position: static;

      margin-bottom: 1rem;
      padding: 0.8rem;

      border-radius: 0.75rem;

      backdrop-filter: none;

      -webkit-backdrop-filter:
        none;
    }

    .controls {
      gap: 0.85rem;
    }

    .segment-selector {
      flex-wrap: nowrap;

      overflow-x: auto;
      overflow-y: hidden;

      padding-bottom: 0.25rem;

      scrollbar-width: none;

      -webkit-overflow-scrolling:
        touch;
    }

    .segment-selector::-webkit-scrollbar {
      display: none;
    }

    .segment-selector button {
      flex: 0 0 auto;

      white-space: nowrap;
    }

    .cohort-control-heading {
      align-items: flex-start;
    }

    .chart-wrapper {
      overflow-x: visible;
    }

    svg {
      width: 100%;
      min-width: 0;
    }

    .measure-label {
      font-size: 11px;
      line-height: 1.3;
    }
  }
</style>