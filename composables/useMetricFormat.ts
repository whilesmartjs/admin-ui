import { decorateMetric, formatMetricValue, formatNumber, isSummaryMetric } from "../lib/metrics";

export function useMetricFormat() {
  return {
    value: formatMetricValue,
    number: formatNumber,
    decorate: decorateMetric,
    isSummary: isSummaryMetric,
  };
}
