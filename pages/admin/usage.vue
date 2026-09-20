<template>
  <AdminMetricsView
    :title="t('AI usage')"
    :description="t('Assistant token consumption for the selected period.')"
    :group-keys="['agent_usage']"
    :empty-title="t('No AI usage measurements')"
    :empty-description="t('Register an AI usage measurement provider to populate this page.')"
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: ["auth", "admin"] as never[] });

const t = useAdminText();
</script>
