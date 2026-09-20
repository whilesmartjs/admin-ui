<template>
  <DsCard padding="md" class="metric-card">
    <template v-if="metric.type === 'series'">
      <DsTrendChart
        :title="metric.label"
        :points="metric.series"
        :unit="metric.unit"
        :area="area"
        :date-label="t('Date')"
        :empty-text="t('No data for this period.')"
      />
    </template>

    <template v-else-if="metric.type === 'ranking'">
      <h3 class="metric-card__title">{{ metric.label }}</h3>
      <DsRankingList v-if="metric.rows.length" :rows="metric.rows" :area="area" />
      <p v-else class="metric-card__empty">{{ t('No data for this period.') }}</p>
    </template>

    <template v-else>
      <h3 class="metric-card__title">{{ metric.label }}</h3>
      <strong class="metric-card__value">{{ format.value(metric) }}</strong>
    </template>
  </DsCard>
</template>

<script setup lang="ts">
import { DsCard, DsRankingList, DsTrendChart, type AreaColor } from "@whilesmart/design";
import type { AdminMetric } from "../types/admin";

defineProps<{ metric: AdminMetric; area: AreaColor }>();

const t = useAdminText();
const format = useMetricFormat();
</script>

<style scoped>
.metric-card {
  display: flex;
  min-height: 10rem;
  flex-direction: column;
  gap: var(--ds-space-3);
}

.metric-card__title {
  margin: 0;
  color: var(--ds-text-primary);
  font-size: var(--ds-text-base);
  font-weight: var(--ds-font-semibold);
}

.metric-card__value {
  margin: auto 0;
  color: var(--ds-text-primary);
  font-size: var(--ds-text-3xl);
  font-weight: var(--ds-font-semibold);
  font-variant-numeric: tabular-nums;
}

.metric-card__empty {
  display: grid;
  flex: 1;
  place-items: center;
  margin: 0;
  color: var(--ds-text-muted);
  font-size: var(--ds-text-sm);
}
</style>
