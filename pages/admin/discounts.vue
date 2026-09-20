<template>
  <AdminPage
    :title="t('Discounts and offers')"
    :description="t('Create and target promotions from configured offer providers.')"
  >
    <DsStatePanel
      art="empty"
      area="rose"
      :title="t('No offer provider is configured')"
      :description="t('Register an offer provider and its promotions become editable here, so a discount is never hard-coded into the product.')"
    />
  </AdminPage>
</template>

<script setup lang="ts">
import { DsStatePanel } from "@whilesmart/design";

definePageMeta({ layout: "admin", middleware: ["auth", "admin"] as never[] });

const t = useAdminText();
</script>
