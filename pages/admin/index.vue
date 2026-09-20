<template>
  <AdminPage :title="t('Overview')" :description="periodCaption || t('A current view of this product and its users.')">
    <template #actions>
      <DsTabs
        v-model="range"
        :options="ranges"
        variant="solid"
        role="group"
        :label="t('Period')"
        @update:model-value="load"
      />
    </template>

    <DsStatePanel v-if="pending" state="loading" :title="t('Loading the overview')" />
    <DsStatePanel
      v-else-if="failed"
      state="error"
      :title="t('Could not load the overview')"
      :description="t('The measurement service did not answer. Nothing has changed.')"
      :action-label="t('Try again')"
      @action="load"
    />
    <DsStatePanel
      v-else-if="!metrics.length"
      art="measure"
      :area="area"
      :title="t('No measurements are registered')"
      :description="t('Register a measurement provider and this page fills itself in.')"
    />

    <template v-else>
      <DsTabs v-model="view" :options="views" :label="t('Overview views')" />

      <template v-if="view === 'activity'">
        <div class="overview__tiles">
          <DsStatTile
            v-for="(metric, index) in tiles"
            :key="metric.key"
            :label="metric.label"
            :value="format.value(metric)"
            v-bind="format.decorate(metric, index)"
          />
        </div>

        <div v-if="series.length" class="overview__charts">
          <DsCard v-for="(metric, index) in series" :key="metric.key" padding="md">
            <DsTrendChart
              :title="metric.label"
              :points="metric.series"
              :unit="metric.unit"
              :area="format.decorate(metric, index).area"
              :date-label="t('Date')"
              :empty-text="t('No data for this period.')"
              v-on="drilldowns[metric.key] ? { pointClick: (point: TrendPoint) => drill(metric.key, point) } : {}"
            />
          </DsCard>
        </div>

        <div v-if="rankings.length" class="overview__rankings">
          <DsCard v-for="(metric, index) in rankings" :key="metric.key" padding="md">
            <h2 class="overview__card-title">{{ metric.label }}</h2>
            <DsRankingList :rows="metric.rows" :area="format.decorate(metric, index).area" />
          </DsCard>
        </div>
      </template>

      <DsCard v-else padding="md">
        <dl class="overview__numbers">
          <div v-for="figure in numbers" :key="figure.key" class="overview__figure">
            <dt>{{ figure.label }}</dt>
            <dd>{{ figure.value }}</dd>
            <small>{{ figure.group }}</small>
          </div>
        </dl>
      </DsCard>
    </template>
  </AdminPage>
</template>

<script setup lang="ts">
import {
  DsCard,
  DsRankingList,
  DsStatePanel,
  DsStatTile,
  DsTabs,
  DsTrendChart,
} from "@whilesmart/design";
import type { AdminMetricReport } from "../../types/admin";
import type { TrendPoint } from "@whilesmart/design";
import { drilldownTarget } from "../../lib/drilldown";

definePageMeta({ layout: "admin", middleware: ["auth", "admin"] as never[] });

const t = useAdminText();
const format = useMetricFormat();
const { area } = useAdminNavigation();
const admin = useAdminConsole();

const range = ref("30");
const days = computed(() => Number(range.value));
const view = ref("activity");
const report = ref<AdminMetricReport | null>(null);
const pending = ref(true);
const failed = ref(false);

// A host decides which series can be opened and where: the package does not know what a
// metric key means. Each target is a path with {date} in it.
const drilldowns = (useRuntimeConfig().public.adminMetricDrilldowns ?? {}) as Record<string, string>;

function drill(key: string, point: TrendPoint) {
  const target = drilldownTarget(drilldowns, key, point.date);
  if (target) navigateTo(target);
}

const ranges = computed(() =>
  [7, 30, 90].map((option) => ({ key: String(option), label: t("{days} days", { days: option }) })),
);

const views = computed(() => [
  { key: "activity", label: t("Activity") },
  { key: "numbers", label: t("Numbers") },
]);

// The dates the figures cover. Without them "30 days" is the only context a reader has.
const periodCaption = computed(() => {
  const period = report.value?.period;
  if (!period) return "";
  const dates = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" });
  return t("{start} to {end}", {
    start: dates.format(new Date(period.start)),
    end: dates.format(new Date(period.end)),
  });
});

const metrics = computed(() => report.value?.groups.flatMap((group) => group.metrics) ?? []);
const summary = computed(() => metrics.value.filter(format.isSummary));
const tiles = computed(() => summary.value.slice(0, 4));
const series = computed(() => metrics.value.filter((metric) => metric.type === "series").slice(0, 4));
const rankings = computed(() =>
  metrics.value.filter((metric) => metric.type === "ranking" && metric.rows.length),
);

// One grid across every group: a group holding a single figure should not own a whole row.
const numbers = computed(() =>
  (report.value?.groups ?? []).flatMap((group) =>
    group.metrics.filter(format.isSummary).map((metric) => ({
      key: `${group.key}.${metric.key}`,
      label: metric.label,
      value: format.value(metric),
      group: group.label,
    })),
  ),
);

async function load() {
  pending.value = true;
  failed.value = false;
  try {
    report.value = await admin.metrics({ days: days.value, granularity: "day" });
  } catch {
    failed.value = true;
  } finally {
    pending.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.overview__tiles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: var(--ds-space-4);
}

.overview__charts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--ds-space-4);
}

.overview__rankings {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  gap: var(--ds-space-4);
}

.overview__card-title {
  margin: 0 0 var(--ds-space-4);
  color: var(--ds-text-primary);
  font-size: var(--ds-text-base);
  font-weight: var(--ds-font-semibold);
}

.overview__numbers {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
  gap: var(--ds-space-5) var(--ds-space-6);
  margin: 0;
}

.overview__figure {
  display: grid;
  gap: 0.125rem;
  min-width: 0;
}

.overview__figure dt {
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-sm);
}

.overview__figure dd {
  margin: 0;
  color: var(--ds-text-primary);
  font-size: var(--ds-text-2xl);
  font-weight: var(--ds-font-semibold);
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}

.overview__figure small {
  color: var(--ds-text-muted);
  font-size: var(--ds-text-xs);
}

@media (max-width: 900px) {
  .overview__charts {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
