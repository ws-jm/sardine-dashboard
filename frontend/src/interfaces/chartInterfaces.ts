export type ChartType = "small" | "medium" | "large";

type ApexChartType =
  | "area"
  | "line"
  | "bar"
  | "histogram"
  | "pie"
  | "donut"
  | "radialBar"
  | "scatter"
  | "bubble"
  | "heatmap"
  | "candlestick"
  | "boxPlot"
  | "radar"
  | "polarArea"
  | "rangeBar"
  | "treemap"
  | undefined;

export interface ChartData {
  type: ApexChartType;
  tableData: string[][];
  xaxisData: number[];
  yaxisData: number[];
  xAxisTitle: string;
  yAxisTitle: string;
}
