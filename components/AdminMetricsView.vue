<template>
  <AdminPage :title="title" :description="description">
    <template #actions>
      <div class="measurements__filters">
        <DsDropdown
          v-if="clientOptions.length > 1"
          v-model="client"
          :options="clientOptions"
          :label="t('Client')"
          inline
          @update:model-value="load"
        />
        <DsTabs
          v-model="range"
          :options="ranges"
          variant="solid"
          role="group"
          :label="t('Period')"
          @update:model-value="load"
        />
      </div>
    </template>

    <DsTabs
      v-if="tabs.length > 1"
      v-model="section"
      :options="tabs"
      :area="area"
      :label="t('Measurement sections')"
    />

    <p v-if="client && hiddenByClient.length" class="measurements__note">
      {{ t('{groups} are measured for the whole product, so they are not shown while one client is selected.', { groups: hiddenByClient.join(', ') }) }}
    </p>

    <DsStatePanel v-if="pending" state="loading" :title="t('Loading {name}', { name: title.toLowerCase() })" />
    <DsStatePanel
      v-else-if="failed"
      state="error"
      :title="t('Could not load {name}', { name: title.toLowerCase() })"
      :description="t('The measurement service did not answer. Nothing has changed.')"
      :action-label="t('Try again')"
      @action="load"
    />
    <DsStatePanel
      v-else-if="!shown.length"
      art="measure"
      :area="area"
      :title="emptyTitle"
      :description="emptyDescription"
    />

    <div v-else class="measurements__groups">
      <section v-for="group in shown" :key="group.key">
        <h2 v-if="shown.length > 1" class="measurements__group-title">{{ group.label }}</h2>
        <div class="measurements__metrics">
          <AdminMetricCard
            v-for="metric in group.metrics"
            :key="metric.key"
            :metric="metric"
            :area="area"
          />
        </div>
      </section>
    </div>
  </AdminPage>
</template>

<script setup lang="ts">
import { DsDropdown, DsStatePanel, DsTabs } from "@whilesmart/design";
import type { AdminMetricReport } from "../types/admin";

const props = withDefaults(
  defineProps<{
    title: string;
    description: string;
    groupKeys?: string[];
    emptyTitle?: string;
    emptyDescription?: string;
  }>(),
  {
    groupKeys: () => [],
    emptyTitle: "No measurements are registered",
    emptyDescription: "Registered measurement providers appear here automatically.",
  },
);

const t = useAdminText();
const admin = useAdminConsole();
const { area } = useAdminNavigation();

const range = ref("30");
const days = computed(() => Number(range.value));
const client = ref("");
const section = ref("");
const pending = ref(true);
const failed = ref(false);
const report = ref<AdminMetricReport | null>(null);

const ranges = computed(() =>
  [7, 30, 90].map((option) => ({ key: String(option), label: t("{days} days", { days: option }) })),
);

// A group that owns a destination of its own is not repeated here; the reader reaches it
// from the rail instead of finding the same numbers under two names.
const ownDestinations = ["users", "demographics", "agent_usage"];
const groups = computed(() =>
  (report.value?.groups ?? []).filter((group) =>
    props.groupKeys.length ? props.groupKeys.includes(group.key) : !ownDestinations.includes(group.key),
  ),
);

// Only some providers read the client. Offering the filter over figures it cannot narrow
// would make selecting a client look like it did nothing.
const clientScoped = computed(() => groups.value.filter((group) => group.client_scoped));
const clientOptions = computed(() =>
  clientScoped.value.length
    ? [
        { value: "", label: t("All clients") },
        ...(report.value?.clients ?? []).map((option) => ({ value: option.key, label: option.name })),
      ]
    : [],
);

const visible = computed(() => (client.value ? clientScoped.value : groups.value));
const hiddenByClient = computed(() =>
  client.value ? groups.value.filter((group) => !group.client_scoped).map((group) => group.label) : [],
);

const tabs = computed(() =>
  props.groupKeys.length ? [] : visible.value.map((group) => ({ key: group.key, label: group.label })),
);
const shown = computed(() =>
  section.value ? visible.value.filter((group) => group.key === section.value) : visible.value,
);

async function load() {
  pending.value = true;
  failed.value = false;
  try {
    report.value = await admin.metrics({
      days: days.value,
      granularity: "day",
      client: client.value || undefined,
    });
    if (tabs.value.length && !tabs.value.some((tab) => tab.key === section.value)) {
      section.value = tabs.value[0]?.key ?? "";
    }
  } catch {
    failed.value = true;
  } finally {
    pending.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.measurements__filters {
  display: flex;
  align-items: center;
  gap: var(--ds-space-3);
}

.measurements__note {
  margin: 0;
  color: var(--ds-text-muted);
  font-size: var(--ds-text-sm);
}

.measurements__groups {
  display: grid;
  gap: var(--ds-space-6);
}

.measurements__group-title {
  margin: 0 0 var(--ds-space-4);
  color: var(--ds-text-primary);
  font-size: var(--ds-text-base);
  font-weight: var(--ds-font-semibold);
}

.measurements__metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  gap: var(--ds-space-4);
}

@media (max-width: 640px) {
  .measurements__filters {
    width: 100%;
    align-items: stretch;
    flex-direction: column;
  }

  .measurements__metrics {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
