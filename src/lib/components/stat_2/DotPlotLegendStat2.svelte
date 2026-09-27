<script>
  import {
    formatSubsegmentLabel
  } from './stat2Data.js';

  let {
    cohorts = [],
    getCohortTextColour,
    selectedCohorts = [],
    hoveredCohort = null,
    onSelect,
    onPreview,
    onClearPreview
  } = $props();


  function isSelected(
    cohort
  ) {
    return selectedCohorts.includes(
      cohort
    );
  }


  function isActive(
    cohort
  ) {
    return (
      isSelected(cohort) ||
      hoveredCohort === cohort
    );
  }


  function isMuted(
    cohort
  ) {
    return (
      selectedCohorts.length > 0 &&
      !isSelected(cohort) &&
      hoveredCohort !== cohort
    );
  }


  function getSelectionIndex(
    cohort
  ) {
    return selectedCohorts.indexOf(
      cohort
    );
  }


  function getLegendDotFill(
    cohort
  ) {
    const selectedIndex =
      getSelectionIndex(
        cohort
      );

    /*
     * Primary green selection.
     */
    if (
      selectedIndex === 0
    ) {
      return '#009b77';
    }

    /*
     * Blue comparison remains white.
     */
    if (
      selectedIndex === 1
    ) {
      return '#ffffff';
    }

    /*
     * Hover preview remains white.
     */
    return '#ffffff';
  }


  function getLegendDotStroke(
    cohort
  ) {
    const selectedIndex =
      getSelectionIndex(
        cohort
      );

    if (
      selectedIndex === 0
    ) {
      return '#00634f';
    }

    if (
      selectedIndex === 1
    ) {
      return '#007da4';
    }

    if (
      hoveredCohort === cohort
    ) {
      return '#00634f';
    }

    return '#8f9995';
  }


  function handleKeydown(
    event,
    cohort
  ) {
    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();

      onSelect(cohort);
    }
  }
</script>


<div
  class="legend"
  role="group"
  aria-label="Highlight one cohort and optionally compare it with another"
>
  {#each cohorts as cohort}
    <button
      type="button"
      class="legend-pill"
      class:active={
        isActive(cohort)
      }
      class:selected={
        isSelected(cohort)
      }
      class:muted={
        isMuted(cohort)
      }
      style={`--pill-colour: ${getCohortTextColour(cohort)}`}
      aria-pressed={
        isSelected(cohort)
      }
      onmouseenter={() =>
        onPreview(cohort)}
      onmouseleave={
        onClearPreview
      }
      onfocus={() =>
        onPreview(cohort)}
      onblur={
        onClearPreview
      }
      onclick={() =>
        onSelect(cohort)}
      onkeydown={(event) =>
        handleKeydown(
          event,
          cohort
        )}
    >
      <span
        class="legend-dot"
        style:background={
          getLegendDotFill(
            cohort
          )
        }
        style:border-color={
          getLegendDotStroke(
            cohort
          )
        }
      ></span>

      <span>
        {formatSubsegmentLabel(
          cohort
        )}
      </span>
    </button>
  {/each}
</div>


<style>
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;

    width: 100%;
  }

  button {
    display: inline-flex;
    gap: 0.42rem;
    align-items: center;

    border:
      1px solid
      transparent;

    border-radius: 999px;

    padding:
      0.45rem
      0.68rem;

    background:
      transparent;

    color:
      #272c2a;

    font: inherit;
    font-size: 14px;
    font-weight: 400;

    cursor: pointer;

    transition:
      opacity 150ms ease,
      background 150ms ease,
      border-color 150ms ease,
      color 150ms ease;
  }

  button:hover,
  button:focus-visible,
  button.active {
    background:
      #f2f4f3;

    outline: none;
  }

  button.selected {
    border-color:
      var(--pill-colour);

    color:
      var(--pill-colour);

    font-weight: 500;
  }

  button.muted {
    opacity: 0.45;
  }

  .legend-dot {
    width: 0.85rem;
    height: 0.85rem;
    flex: 0 0 auto;

    box-sizing:
      border-box;

    border:
      2px solid
      #8f9995;

    border-radius: 50%;

    background: white;

    transition:
      transform 150ms ease,
      background 150ms ease,
      border-color 150ms ease;
  }

  button.active
    .legend-dot,
  button.selected
    .legend-dot {
    transform:
      scale(1.2);
  }

  @media (
    max-width: 680px
  ) {
    button {
      font-size: 13px;
    }
  }
</style>