<script setup lang="ts">
import { getAdminPosthog } from "../lib/posthog";

const route = useRoute();
const config = useRuntimeConfig();
let stopTracking: (() => void) | undefined;
let active = true;

onMounted(async () => {
  const { token, host } = config.public.adminPosthog;
  if (!token || !host) return;

  try {
    const posthog = await getAdminPosthog(token, host);
    if (!active) return;
    stopTracking = watch(
      () => route.path,
      (path) => posthog.capture("$pageview", {
        $current_url: window.location.origin + path,
        $pathname: path,
        $search: "",
        $referrer: "",
      }),
      { immediate: true },
    );
  } catch (error) {
    console.warn("Admin analytics could not be initialized", error);
  }
});

onBeforeUnmount(() => {
  active = false;
  stopTracking?.();
});
</script>

<template>
  <div class="admin-layout"><slot /></div>
</template>

<style scoped>
.admin-layout {
  min-height: 100vh;
  background: var(--ds-bg-surface);
}
</style>
