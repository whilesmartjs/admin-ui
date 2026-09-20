<template>
  <AdminConsole>
    <DsPageHeader :title="title" :description="description" :eyebrow="t('Administration')">
      <template v-if="$slots.actions" #actions><slot name="actions" /></template>
    </DsPageHeader>
    <slot />
  </AdminConsole>
</template>

<script setup lang="ts">
import { DsPageHeader } from "@whilesmart/design";

defineProps<{ title: string; description?: string }>();

const t = useAdminText();
</script>
