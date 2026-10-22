<template>
  <AdminPage
    :title="t('PostHog')"
    :description="t('Visitors, pages and sessions from the shared PostHog dashboard.')"
  >
    <DsStatePanel v-if="pending" state="loading" :title="t('Loading PostHog')" />
    <DsStatePanel
      v-else-if="loadError"
      state="error"
      :title="t('Could not load PostHog')"
      :description="loadError"
      :action-label="t('Try again')"
      @action="load"
    />
    <DsStatePanel
      v-else-if="!url"
      art="empty"
      area="slate"
      :title="t('No dashboard is shared')"
      :description="t('In PostHog, open a dashboard, choose Share and turn on sharing, then set its embed address in the admin configuration. It appears here for the console owner only.')"
    />
    <iframe
      v-else
      :src="url"
      :title="t('PostHog')"
      class="posthog__frame"
      referrerpolicy="no-referrer"
      allowfullscreen
    />
  </AdminPage>
</template>

<script setup lang="ts">
import { DsStatePanel } from "@whilesmart/design";

definePageMeta({ layout: "admin", middleware: ["auth", "admin"] as never[] });

const t = useAdminText();
const admin = useAdminConsole();

const url = ref<string | null>(null);
const pending = ref(true);
const loadError = ref("");

async function load() {
  pending.value = true;
  loadError.value = "";
  try {
    url.value = await admin.posthogDashboard();
  } catch {
    url.value = null;
    loadError.value = t("The admin service did not answer. Nothing has changed.");
  } finally {
    pending.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.posthog__frame {
  display: block;
  width: 100%;
  min-height: 80vh;
  border: 0;
  border-radius: var(--ds-radius-card);
  background: var(--ds-bg-surface);
}
</style>
