<template>
  <AdminMetricsView
    :title="t('Demographics')"
    :description="t('Where your users are and what they prefer.')"
    :group-keys="['demographics']"
    :empty-title="t('No demographic measurements')"
    :empty-description="t('Register a demographics measurement provider to populate this page.')"
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: ["auth", "admin"] as never[] });

const t = useAdminText();
</script>
