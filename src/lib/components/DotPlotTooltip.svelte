<script>
  let {
    point = null,
    x = 0,
    y = 0,
    colour = '#76bf3d'
  } = $props();

  const tooltipWidth = 300;
  const estimatedTooltipHeight = 180;
  const offset = 16;
  const viewportPadding = 12;

  /*
   * Move the tooltip into document.body so that
   * transformed chart ancestors cannot affect its
   * fixed positioning.
   */
  function portal(node) {
    document.body.appendChild(node);

    return {
      destroy() {
        node.remove();
      }
    };
  }

  const tooltipX = $derived.by(() => {
    if (typeof window === 'undefined') {
      return x + offset;
    }

    const fitsOnRight =
      x +
        offset +
        tooltipWidth +
        viewportPadding <=
      window.innerWidth;

    if (fitsOnRight) {
      return x + offset;
    }

    return Math.max(
      viewportPadding,
      x - tooltipWidth - offset
    );
  });

  const tooltipY = $derived.by(() => {
    if (typeof window === 'undefined') {
      return y + offset;
    }

    const fitsBelow =
      y +
        offset +
        estimatedTooltipHeight +
        viewportPadding <=
      window.innerHeight;

    if (fitsBelow) {
      return y + offset;
    }

    return Math.max(
      viewportPadding,
      y -
        estimatedTooltipHeight -
        offset
    );
  });
</script>

{#if point}
  <aside
    use:portal
    class="tooltip"
    style:left={`${tooltipX}px`}
    style:top={`${tooltipY}px`}
    role="tooltip"
  >
    <div class="tooltip-heading">
      <span
        class="tooltip-dot"
        style:background={colour}
      ></span>

      <span class="cohort">
        {point.cohort}
      </span>
    </div>

    <p class="measure">
      {point.measure}
    </p>

    <div class="value-row">
      <span class="value">
        {point.value}<sup>%</sup>
      </span>

      <span class="value-label">
        Agree
      </span>
    </div>
  </aside>
{/if}

<style>
  .tooltip {
    position: fixed;
    z-index: 9999;
    font-family: Gotham, sans-serif;

    width: 300px;
    max-width: calc(100vw - 24px);
    box-sizing: border-box;
    margin: 0;
    padding: 1rem;

    border: 1px solid #d8dcda;
    border-radius: 12px;

    background: white;
    color: #171a19;

    box-shadow:
      0 10px 30px
      rgb(0 0 0 / 12%);

    pointer-events: none;
  }

  .tooltip-heading {
    display: flex;
    align-items: center;
    gap: 0.55rem;
  }

  .tooltip-dot {
    width: 10px;
    height: 10px;
    flex: 0 0 auto;
    border-radius: 50%;
  }

  .cohort {
    font-size: 0.82rem;
    font-weight: 700;
    line-height: 1.25;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .measure {
    margin: 0.85rem 0 1rem;
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .value-row {
    display: flex;
    align-items: baseline;
    gap: 0.45rem;
  }

  .value {
    font-size: 2rem;
    font-weight: 700;
    line-height: 1;
  }

  .value-label {
    color: #6b716e;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  sup {
    font-weight: 300;
    font-size: 1rem;
  }
</style>