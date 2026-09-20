<template>
  <AdminPage :title="t('Feedback')" :description="t('Read and triage messages from your users.')">
    <template #actions>
      <div class="feedback__filters">
        <DsSearchInput v-model="query" :placeholder="t('Search feedback')" />
        <DsDropdown v-model="status" :options="statusOptions" :label="t('Status')" inline />
      </div>
    </template>

    <DsStatePanel v-if="pending" state="loading" :title="t('Loading feedback')" />
    <DsStatePanel
      v-else-if="failed"
      state="error"
      :title="t('Could not load feedback')"
      :description="t('The admin service did not answer. Nothing has changed.')"
      :action-label="t('Try again')"
      @action="load"
    />
    <DsStatePanel
      v-else-if="!items.length"
      art="mail"
      area="amber"
      :title="query || status ? t('No feedback matches this filter') : t('No feedback yet')"
      :description="query || status ? t('Widen the filter to see everything received.') : t('Messages your users send appear here, newest first.')"
      :action-label="query || status ? t('Clear filters') : ''"
      @action="clear"
    />

    <div v-else class="feedback__items">
      <DsCard v-for="item in items" :key="item.id" padding="md" class="feedback__item">
        <header class="feedback__head">
          <div class="feedback__who">
            <strong>{{ item.subject || t(label(item.type)) }}</strong>
            <small>{{ item.name || item.email || t('Anonymous') }}</small>
          </div>
          <DsChip size="sm">{{ t(label(item.type)) }}</DsChip>
        </header>

        <p class="feedback__message">{{ item.message }}</p>

        <footer class="feedback__foot">
          <time>{{ item.created_at ? new Date(item.created_at).toLocaleString() : '' }}</time>
          <DsMenu>
            <template #trigger>
              <DsChip :variant="tone(item.status)" size="sm" clickable>
                {{ t(label(item.status)) }}
              </DsChip>
            </template>
            <DsMenuItem
              v-for="option in statuses"
              :key="option"
              :disabled="option === item.status"
              @click="changeStatus(item, option)"
            >
              {{ t(label(option)) }}
            </DsMenuItem>
          </DsMenu>
        </footer>
      </DsCard>
    </div>
  </AdminPage>
</template>

<script setup lang="ts">
import {
  DsCard,
  DsChip,
  DsMenu,
  DsMenuItem,
  DsDropdown,
  DsSearchInput,
  DsStatePanel,
} from "@whilesmart/design";
import type { AdminFeedback } from "../../types/admin";

definePageMeta({ layout: "admin", middleware: ["auth", "admin"] as never[] });

const t = useAdminText();
const admin = useAdminConsole();

const statuses = ["new", "triaged", "planned", "in_progress", "resolved", "declined", "archived"];

// Status is the one thing on this page that carries colour: it is state on a record.
const tones: Record<string, "default" | "primary" | "success" | "warning" | "danger"> = {
  new: "primary",
  in_progress: "warning",
  resolved: "success",
  declined: "danger",
};

const items = ref<AdminFeedback[]>([]);
const query = ref("");
const status = ref("");
const pending = ref(true);
const failed = ref(false);

const label = (value: string) => value.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
const tone = (value: string) => tones[value] ?? "default";

const statusOptions = computed(() => [
  { value: "", label: t("All statuses") },
  ...statuses.map((option) => ({ value: option, label: t(label(option)) })),
]);

function clear() {
  query.value = "";
  status.value = "";
}

async function load() {
  pending.value = true;
  failed.value = false;
  try {
    items.value = await admin.feedback({ q: query.value, status: status.value });
  } catch {
    failed.value = true;
  } finally {
    pending.value = false;
  }
}

async function changeStatus(item: AdminFeedback, value: string) {
  const updated = await admin.updateFeedbackStatus(item.id, value);
  Object.assign(item, updated);
}

let timer: ReturnType<typeof setTimeout>;
watch([query, status], () => {
  clearTimeout(timer);
  timer = setTimeout(load, 300);
});

onBeforeUnmount(() => clearTimeout(timer));
onMounted(load);
</script>

<style scoped>
.feedback__filters {
  display: flex;
  align-items: flex-end;
  gap: var(--ds-space-3);
}

.feedback__items {
  display: grid;
  gap: var(--ds-space-3);
}

.feedback__item {
  display: grid;
  gap: var(--ds-space-3);
}

.feedback__head,
.feedback__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-space-4);
}

.feedback__who {
  display: grid;
  gap: 0.125rem;
  min-width: 0;
}

.feedback__who strong {
  color: var(--ds-text-primary);
}

.feedback__who small,
.feedback__foot time {
  color: var(--ds-text-muted);
  font-size: var(--ds-text-xs);
}

.feedback__message {
  margin: 0;
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-sm);
  white-space: pre-wrap;
}

@media (max-width: 640px) {
  .feedback__filters {
    width: 100%;
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
