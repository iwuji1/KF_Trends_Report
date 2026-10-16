import rawData
  from '$lib/datasets/stat_1_pt.tsv?raw';


/* ---------------------------------
   Segments
   --------------------------------- */

export const segments = [
  'Setor',
  'Região'
];


export const segmentOptions = {
  Setor: [
    'Bens de consumo',
    'Energia',
    'Serviços Financeiros',
    'Saúde',
    'Indústria',
    'Ciências da Vida',
    'Organizações sem fins lucrativos',
    'Serviços Profissionais',
    'Tecnologia',
    'AVERAGE'
  ],

  Região: [
    'América do Norte',
    'LATAM',
    'EMEA',
    'APAC',
    'AVERAGE'
  ]
};


/* ---------------------------------
   TSV helpers
   --------------------------------- */

function splitTsvLine(line) {
  return line
    .split('\t')
    .map((value) =>
      value.trim()
    );
}


function toPercentage(value) {
  const cleanedValue = String(
    value ?? ''
  )
    .trim()
    .replace('%', '');

  if (
    cleanedValue === '' ||
    cleanedValue === '-'
  ) {
    return null;
  }

  const number =
    Number(cleanedValue);

  if (
    !Number.isFinite(number)
  ) {
    return null;
  }

  /*
   * Supports both:
   *
   * 85.88% → 85.88
   * 0.8588 → 85.88
   *
   * Unlike the previous parser,
   * don't round the values here.
   * The new dataset contains useful
   * decimal precision.
   */
  return number <= 1
    ? number * 100
    : number;
}


/* ---------------------------------
   Segment values
   --------------------------------- */

function createSegmentValues(
  rowByColumn
) {
  return Object.fromEntries(
    segments.map((segment) => {

      const values =
        Object.fromEntries(
          segmentOptions[segment]
            .map((cohort) => [
              cohort,

              toPercentage(
                rowByColumn[
                  cohort
                ]
              )
            ])

            .filter(
              ([, value]) =>
                Number.isFinite(
                  value
                )
            )
        );

      return [
        segment,
        values
      ];
    })
  );
}


/* ---------------------------------
   Labels
   --------------------------------- */

export function formatSubsegmentLabel(
  subsegment
) {
  if (subsegment === 'AVERAGE') {
    return 'Média Global';
  }
  return subsegment;
}


/* ---------------------------------
   Parser
   --------------------------------- */

export function parseStat1Data(
  tsv = rawData
) {
  const lines = tsv
    .split(/\r?\n/)
    .map((line) =>
      line.trimEnd()
    )
    .filter(Boolean);


  /*
   * The first TSV row contains broad
   * grouping labels:
   *
   * Global Average
   * Industry
   * Region
   *
   * The second row contains the actual
   * column names.
   *
   * Find that row rather than relying
   * on a fixed row number.
   */
  const columnHeaderIndex =
    lines.findIndex((line) => {

      const cells =
        splitTsvLine(line);

      return (
        cells.includes(
          'ReportSectionName'
        ) &&
        cells.includes(
          'Original Statement Text'
        ) &&
        cells.includes(
          'Modified Shortened Text - USE THIS'
        )
      );
    });


  if (
    columnHeaderIndex === -1
  ) {
    throw new Error(
      'Could not find the stat_1.tsv column header.'
    );
  }


  const columns =
    splitTsvLine(
      lines[
        columnHeaderIndex
      ]
    );


  /*
   * The broad grouping row tells us
   * where Global Average sits.
   *
   * Because the actual header cell for
   * that column is blank, we identify
   * it from the grouping row above.
   */
  const groupingRow =
    columnHeaderIndex > 0
      ? splitTsvLine(
          lines[
            columnHeaderIndex - 1
          ]
        )
      : [];


  const globalAverageIndex =
    groupingRow.findIndex(
      (value) =>
        value ===
        'Média Global'
    );


  if (
    globalAverageIndex === -1
  ) {
    throw new Error(
      'Could not find the Global Average column in stat_1.tsv.'
    );
  }


  return lines
    .slice(
      columnHeaderIndex + 1
    )

    .map(splitTsvLine)

    .map(
      (
        cells,
        rowIndex
      ) => {

        const rowByColumn =
          Object.fromEntries(
            columns.map(
              (
                column,
                columnIndex
              ) => [
                column,
                cells[
                  columnIndex
                ] ?? ''
              ]
            )
          );


        const globalAverage =
          toPercentage(
            cells[
              globalAverageIndex
            ]
          );


        return {
          id:
            `stat-1-${rowIndex}`,

          reportSection:
            rowByColumn[
              'ReportSectionName'
            ]?.trim() ?? '',

          order:
            Number(
              rowByColumn[
                'Order'
              ]
            ),

          /*
           * Keep the original wording
           * available in case it is useful
           * for tooltips/accessibility.
           */
          originalStatement:
            rowByColumn[
              'Original Statement Text'
            ]?.trim() ?? '',

          /*
           * This is explicitly marked
           * "USE THIS" in the dataset,
           * so this becomes the chart's
           * displayed measure.
           */
          measure:
            rowByColumn[
              'Modified Shortened Text - USE THIS'
            ]?.trim() ?? '',

          /*
           * Keep both names for convenience.
           *
           * `total` preserves compatibility
           * with the previous data structure.
           */
          total:
            globalAverage,

          globalAverage,

          segments:
            createSegmentValues(
              rowByColumn
            )
        };
      }
    )

    .filter(
      (row) =>
        row.measure &&
        Number.isFinite(
          row.globalAverage
        )
    )

    /*
     * Respect the supplied report order.
     */
    .sort(
      (a, b) =>
        (a.order || 0) -
        (b.order || 0)
    );
}


/* ---------------------------------
   Parsed source data
   --------------------------------- */

export const SourceData =
  parseStat1Data();


/* ---------------------------------
   Long-form chart data
   --------------------------------- */

export function createLongData(
  sourceData = SourceData,
  activeSegment = segments[0]
) {
  return sourceData.flatMap(
    (
      row,
      rowIndex
    ) => {

      const cohortValues =
        row.segments[
          activeSegment
        ] ?? {};


      return Object.entries(
        cohortValues
      )

        .map(
          (
            [cohort, value]
          ) => ({
            id:
              `${row.id}-${activeSegment}-${cohort}`,

            measure:
              row.measure,

            originalStatement:
              row.originalStatement,

            reportSection:
              row.reportSection,

            rowIndex,

            segment:
              activeSegment,

            cohort,

            value:
              Number(value)
          })
        )

        .filter(
          (point) =>
            Number.isFinite(
              point.value
            )
        );
    }
  );
}


/* ---------------------------------
   Global Average data
   --------------------------------- */

export function createGlobalAverageData(
  sourceData = SourceData
) {
  return sourceData
    .map(
      (
        row,
        rowIndex
      ) => ({
        id:
          `${row.id}-global-average`,

        measure:
          row.measure,

        originalStatement:
          row.originalStatement,

        reportSection:
          row.reportSection,

        rowIndex,

        segment:
          'Média Global',

        cohort:
          'Média Global',

        value:
          Number(
            row.globalAverage
          )
      })
    )

    .filter(
      (point) =>
        Number.isFinite(
          point.value
        )
    );
}


export default SourceData;