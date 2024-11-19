import { createSelector } from "@reduxjs/toolkit";
import _ from "underscore";

import { isCartesianChart } from "metabase/visualizations";
import type { DatasetData, RawSeries, RowValues } from "metabase-types/api";
import type { VisualizerState } from "metabase-types/store/visualizer";

import {
  createDataSource,
  extractReferencedColumns,
  getDataSourceIdFromNameRef,
  isDataSourceNameRef,
} from "./utils";

type State = { visualizer: VisualizerState };

// Private selectors

const getCurrentHistoryItem = (state: State) => state.visualizer.present;

const getCards = (state: State) => state.visualizer.cards;

const getRawSettings = (state: State) => getCurrentHistoryItem(state).settings;

const getVisualizationColumns = (state: State) =>
  getCurrentHistoryItem(state).columns;

const getVisualizerColumnValuesMapping = (state: State) =>
  getCurrentHistoryItem(state).columnValuesMapping;

// Public selectors

export const getVisualizationType = (state: State) =>
  getCurrentHistoryItem(state).display;

export const getDatasets = (state: State) => state.visualizer.datasets;

export const getExpandedDataSources = (state: State) =>
  state.visualizer.expandedDataSources;

export const getDraggedItem = (state: State) => state.visualizer.draggedItem;

export const getCanUndo = (state: State) => state.visualizer.past.length > 0;
export const getCanRedo = (state: State) => state.visualizer.future.length > 0;

export const getReferencedColumns = createSelector(
  [getVisualizerColumnValuesMapping],
  mappings => extractReferencedColumns(mappings),
);

export const getDataSources = createSelector([getCards], cards =>
  cards.map(card => createDataSource("card", card.id, card.name)),
);

export const getUsedDataSources = createSelector(
  [getDataSources, getReferencedColumns],
  (dataSources, referencedColumns) => {
    if (dataSources.length === 1) {
      return dataSources;
    }
    const usedDataSourceIds = new Set(
      referencedColumns.map(ref => ref.sourceId),
    );
    return dataSources.filter(dataSource =>
      usedDataSourceIds.has(dataSource.id),
    );
  },
);

const getVisualizerDatasetData = createSelector(
  [
    getUsedDataSources,
    getDatasets,
    getReferencedColumns,
    getVisualizationColumns,
    getVisualizerColumnValuesMapping,
  ],
  (
    usedDataSources,
    datasets,
    referencedColumns,
    cols,
    columnValuesMapping,
  ): DatasetData => {
    const referencedColumnValuesMap: Record<string, RowValues> = {};
    referencedColumns.forEach(ref => {
      const dataset = datasets[ref.sourceId];
      if (!dataset) {
        return;
      }
      const columnIndex = dataset.data.cols.findIndex(
        col => col.name === ref.originalName,
      );
      if (columnIndex >= 0) {
        const values = dataset.data.rows.map(row => row[columnIndex]);
        referencedColumnValuesMap[ref.name] = values;
      }
    });

    const hasPivotGrouping = cols.some(col => col.name === "pivot-grouping");
    if (hasPivotGrouping) {
      const rowLengths = Object.values(referencedColumnValuesMap).map(
        values => values.length,
      );
      const maxLength = rowLengths.length > 0 ? Math.max(...rowLengths) : 0;
      referencedColumnValuesMap["pivot-grouping"] = new Array(maxLength).fill(
        0,
      );
    }

    const unzippedRows = cols.map(column =>
      (columnValuesMapping[column.name] ?? [])
        .map(valueSource => {
          if (isDataSourceNameRef(valueSource)) {
            const id = getDataSourceIdFromNameRef(valueSource);
            const dataSource = usedDataSources.find(source => source.id === id);
            return dataSource?.name ? [dataSource.name] : [];
          }
          const values = referencedColumnValuesMap[valueSource.name];
          if (!values) {
            return [];
          }
          return values;
        })
        .flat(),
    );

    return {
      cols,
      rows: _.zip(...unzippedRows),
      results_metadata: { columns: cols },
    };
  },
);

export const getVisualizerDatasetColumns = createSelector(
  [getVisualizerDatasetData],
  data => data.cols,
);

export const getSettings = createSelector(
  [getVisualizationType, getRawSettings],
  (display, settings) => {
    if (display && isCartesianChart(display)) {
      // Visualizer wells display labels
      return {
        ...settings,
        "graph.x_axis.labels_enabled": false,
        "graph.y_axis.labels_enabled": false,
      };
    }
    return settings;
  },
);

export const getVisualizerRawSeries = createSelector(
  [getVisualizationType, getSettings, getVisualizerDatasetData],
  (display, settings, data): RawSeries => {
    if (!display) {
      return [];
    }
    return [
      {
        card: {
          display,
          visualization_settings: settings,
        },
        data,

        // Certain visualizations memoize settings computation based on series keys
        // This guarantees a visualization always rerenders on changes
        started_at: new Date().toISOString(),
      },
    ];
  },
);