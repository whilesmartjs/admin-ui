<template>
  <DsConsoleShell :nav-label="t('Administration')" :menu-label="t('Sections')" :rail-class="skin.railClass">
    <template #brand>
      <DsLogo
        :name="brand.name"
        :src="brand.logoSrc"
        :mark-src="brand.logoMarkSrc"
        :show-name="!logo && !brand.logoSrc && !brand.logoMarkSrc"
      >
        <template v-if="logo" #logo><component :is="logo" v-bind="brand.logoProps" /></template>
        <template #tag><DsAppTag :label="t(brand.tag)" :area="brand.tagArea" icon="solar:shield-check-bold-duotone" /></template>
      </DsLogo>
    </template>

    <template #nav>
      <DsSidebarItem
        v-for="item in items"
        :key="item.to"
        :label="t(item.label)"
        :icon="item.icon"
        :area="item.area"
        :to="item.to"
        :active="current?.to === item.to"
        tile
      />
    </template>

    <template #rail-footer>
      <div v-if="viewer" class="admin-console__viewer">
        <DsAvatar :name="viewer.name" size="md" />
        <span class="admin-console__viewer-text">
          <strong>{{ viewer.name }}</strong>
          <small>{{ viewer.email }}</small>
        </span>
      </div>
      <NuxtLink class="admin-console__exit" :to="appRoute">
        <DsIcon name="solar:alt-arrow-left-linear" />
        {{ t('Back to app') }}
      </NuxtLink>
    </template>

    <div :class="['admin-console__content', skin.contentClass]" :data-admin-skin="skin.name">
      <slot />
    </div>
  </DsConsoleShell>
</template>

<script setup lang="ts">
import {
  DsAppTag,
  DsLogo,
  DsConsoleShell,
  DsIcon,
  DsAvatar,
  DsSidebarItem,
} from "@whilesmart/design";

const t = useAdminText();
const { brand, logo, appRoute, skin } = useAdminBrand();
const { items, current } = useAdminNavigation();
const viewer = useAdminViewer();
</script>

<style scoped>
.admin-console__content {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-6);
}

.admin-console__viewer {
  display: flex;
  align-items: center;
  gap: var(--ds-space-2);
  padding: var(--ds-space-2);
  min-width: 0;
}

.admin-console__viewer-text {
  display: grid;
  min-width: 0;
}

.admin-console__viewer-text strong {
  overflow: hidden;
  color: var(--ds-text-primary);
  font-size: var(--ds-text-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-console__viewer-text small {
  overflow: hidden;
  color: var(--ds-text-muted);
  font-size: var(--ds-text-xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-console__exit {
  display: flex;
  align-items: center;
  gap: var(--ds-space-2);
  padding: var(--ds-space-2) var(--ds-space-3);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-control);
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-sm);
  font-weight: var(--ds-font-medium);
  text-decoration: none;
}

.admin-console__exit:hover {
  background: var(--ds-bg-hover);
  color: var(--ds-text-primary);
}
</style>
