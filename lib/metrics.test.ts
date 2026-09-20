import { describe, expect, it } from "vitest";
import { decorateMetric, formatMetricValue, isSummaryMetric } from "./metrics";
import type { AdminMetric } from "../types/admin";

// The shape the report endpoint returns, as Whilesmart\Engagement\Support\Metric::toArray
// emits it: every metric carries all five fields whatever its type.
const metric = (over: Partial<AdminMetric>): AdminMetric => ({
  key: "total_users",
  label: "Total users",
  type: "count",
  value: 0,
  series: [],
  rows: [],
  unit: null,
  ...over,
});

describe("formatMetricValue", () => {
  it("renders a count", () => {
    expect(formatMetricValue(metric({ value: 1284 }))).toBe(
      new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(1284),
    );
  });

  it("renders a ratio as a percentage", () => {
    expect(formatMetricValue(metric({ type: "ratio", value: 0.256 }))).toBe(
      new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 1 }).format(0.256),
    );
  });

  it("appends the unit when the metric carries one", () => {
    expect(formatMetricValue(metric({ value: 12, unit: "tokens" }))).toContain("tokens");
  });

  it("shows zero rather than nothing when a provider has no value", () => {
    expect(formatMetricValue(metric({ value: null }))).toBe("0");
  });
});

describe("isSummaryMetric", () => {
  it("accepts the types that render as a single figure", () => {
    for (const type of ["count", "sum", "ratio"] as const) {
      expect(isSummaryMetric(metric({ type }))).toBe(true);
    }
  });

  it("rejects the types that need a plot", () => {
    for (const type of ["series", "ranking"] as const) {
      expect(isSummaryMetric(metric({ type }))).toBe(false);
    }
  });
});

describe("decorateMetric", () => {
  it("gives a known metric the same icon wherever it appears", () => {
    expect(decorateMetric(metric({ key: "ai_tokens_used" }), 0)).toEqual(
      decorateMetric(metric({ key: "ai_tokens_used" }), 5),
    );
  });

  it("colours an unknown metric by position, and stays within the palette", () => {
    const first = decorateMetric(metric({ key: "custom" }), 0);
    const ninth = decorateMetric(metric({ key: "custom" }), 8);
    expect(first.area).toBe(ninth.area);
    expect(first.icon).toMatch(/^solar:/);
  });
});
