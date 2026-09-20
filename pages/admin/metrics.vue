<template>
  <AdminMetricsView
    :title="t('Measurements')"
    :description="t('Everything this product measures, grouped by what it measures.')"
  />
</template>

<script setup lang="ts">
definePageMeta({ layout: "admin", middleware: ["auth", "admin"] as never[] });

const t = useAdminText();
</script>
