<template>
  <AdminPage :title="t('User details')" :description="t('What this product knows about this person.')">
    <template #actions>
      <DsButton variant="secondary" size="sm" @click="navigateTo('/admin/users')">
        {{ t('Back to users') }}
      </DsButton>
    </template>

    <DsStatePanel v-if="pending" state="loading" :title="t('Loading this user')" />
    <DsStatePanel
      v-else-if="failed"
      state="error"
      :title="t('Could not load this user')"
      :description="t('The admin service did not answer. Nothing has changed.')"
      :action-label="t('Try again')"
      @action="load"
    />

    <template v-else-if="detail">
      <DsCard padding="md">
        <div class="user__identity">
          <DsAvatar :name="name" size="lg" />
          <div class="user__names">
            <h2>{{ name }}</h2>
            <p>{{ detail.user.email }}</p>
          </div>
          <DsChip v-if="detail.user.is_admin" variant="primary" size="sm">{{ t('Admin') }}</DsChip>
        </div>
      </DsCard>

      <DsCard padding="md">
        <h3 class="user__section">{{ t('Profile') }}</h3>
        <dl class="user__facts">
          <div v-for="fact in facts" :key="fact.label">
            <dt>{{ fact.label }}</dt>
            <dd>{{ fact.value }}</dd>
          </div>
        </dl>
      </DsCard>

      <div v-if="counts.length" class="user__counts">
        <DsStatTile
          v-for="(count, index) in counts"
          :key="count.key"
          :label="count.label"
          :value="count.value"
          v-bind="{ area: areas[index % areas.length] }"
        />
      </div>
    </template>
  </AdminPage>
</template>

<script setup lang="ts">
import {
  DsButton,
  DsCard,
  DsChip,
  DsAvatar,
  DsStatePanel,
  DsStatTile,
  type AreaColor,
} from "@whilesmart/design";
import type { AdminUserDetail } from "../../../types/admin";
import { displayName } from "../../../lib/users";

definePageMeta({ layout: "admin", middleware: ["auth", "admin"] as never[] });

const t = useAdminText();
const admin = useAdminConsole();
const route = useRoute();

const detail = ref<AdminUserDetail | null>(null);
const pending = ref(true);
const failed = ref(false);

const name = computed(() => displayName(detail.value?.user));

const areas: AreaColor[] = ["indigo", "cyan", "green", "violet", "teal", "amber"];

const humanise = (key: string) =>
  key.replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());

const never = () => t("Never");
const date = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleDateString() : never();

const facts = computed(() => {
  if (!detail.value) return [];
  const { user, preferences, lastTransactionAt } = detail.value;
  const rows = [{ label: t("Joined"), value: date(user.created_at) }];

  for (const [key, value] of Object.entries(preferences)) {
    rows.push({ label: t(humanise(key)), value: value ?? never() });
  }

  rows.push({ label: t("Last transaction"), value: date(lastTransactionAt) });

  // Anything else scalar the host chose to return, so a new field shows up without a change here.
  const shown = new Set(["id", "name", "email", "first_name", "last_name", "created_at", "is_admin"]);
  for (const [key, value] of Object.entries(user)) {
    if (shown.has(key) || value === null || typeof value === "object") continue;
    rows.push({
      label: t(humanise(key)),
      value: key.endsWith("_at") ? new Date(String(value)).toLocaleString() : String(value),
    });
  }

  return rows;
});

const counts = computed(() =>
  Object.entries(detail.value?.counts ?? {}).map(([key, value]) => ({
    key,
    label: t(humanise(key)),
    value: new Intl.NumberFormat().format(value),
  })),
);

async function load() {
  pending.value = true;
  failed.value = false;
  try {
    detail.value = await admin.user(String(route.params.id));
  } catch {
    failed.value = true;
  } finally {
    pending.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.user__identity {
  display: flex;
  align-items: center;
  gap: var(--ds-space-4);
}

.user__names {
  flex: 1;
  min-width: 0;
}

.user__names h2,
.user__names p {
  margin: 0;
}

.user__names h2 {
  color: var(--ds-text-primary);
  font-size: var(--ds-text-xl);
}

.user__names p {
  color: var(--ds-text-secondary);
}

.user__section {
  margin: 0 0 var(--ds-space-4);
  color: var(--ds-text-primary);
  font-size: var(--ds-text-base);
  font-weight: var(--ds-font-semibold);
}

.user__facts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: var(--ds-space-5);
  margin: 0;
}

.user__facts div {
  display: grid;
  gap: var(--ds-space-1);
}

.user__facts dt {
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-xs);
}

.user__facts dd {
  margin: 0;
  color: var(--ds-text-primary);
  font-weight: var(--ds-font-medium);
}

.user__counts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: var(--ds-space-4);
}
</style>
