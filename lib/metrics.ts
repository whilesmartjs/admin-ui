import type { AreaColor } from "@whilesmart/design";
import type { AdminMetric } from "../types/admin";

const byKey: Record<string, { icon: `solar:${string}`; area: AreaColor }> = {
  total_users: { icon: "solar:users-group-rounded-bold-duotone", area: "indigo" },
  registrations_today: { icon: "solar:user-plus-bold-duotone", area: "green" },
  registrations_month: { icon: "solar:calendar-bold-duotone", area: "cyan" },
  total_transactions: { icon: "solar:banknote-2-bold-duotone", area: "teal" },
  avg_transactions_per_user: { icon: "solar:pie-chart-2-bold-duotone", area: "violet" },
  ai_tokens_used: { icon: "solar:cpu-bolt-bold-duotone", area: "orange" },
};

const rotation: AreaColor[] = ["indigo", "cyan", "green", "violet", "teal", "amber", "rose", "orange"];

export const isSummaryMetric = (metric: AdminMetric) =>
  ["count", "sum", "ratio"].includes(metric.type);

export function formatNumber(value: number, unit: string | null = null): string {
  const formatted = new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value);
  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatMetricValue(metric: AdminMetric): string {
  if (metric.value === null) return "0";
  if (metric.type === "ratio") {
    return new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 1 }).format(metric.value);
  }
  return formatNumber(metric.value, metric.unit);
}

/** A known metric keeps its icon wherever it appears; anything else takes the next colour. */
export function decorateMetric(metric: AdminMetric, index: number) {
  return byKey[metric.key] ?? {
    icon: "solar:chart-square-bold-duotone" as const,
    area: rotation[index % rotation.length],
  };
}
