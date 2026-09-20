<template>
  <AdminPage :title="t('Users')" :description="t('People registered with this product.')">
    <template #actions>
      <DsSearchInput v-model="query" :placeholder="t('Search users')" />
    </template>

    <div v-if="joinedOn" class="users__filters">
      <DsChip closable clickable size="sm" @close="clearJoinedOn" @click="clearJoinedOn">
        {{ t('Joined on {date}', { date: new Date(joinedOn).toLocaleDateString() }) }}
      </DsChip>
    </div>

    <DsStatePanel
      v-if="failed"
      state="error"
      :title="t('Could not load users')"
      :description="t('The admin service did not answer. Nothing has changed.')"
      :action-label="t('Try again')"
      @action="load"
    />

    <DsStatePanel
      v-else-if="!pending && !items.length"
      art="search"
      area="green"
      :title="emptyTitle"
      :description="emptyDescription"
      :action-label="filtered ? t('Clear filters') : ''"
      @action="clearFilters"
    />

    <template v-else>
      <DsDataTable
        :columns="tableColumns"
        :rows="items"
        :loading="pending"
        :empty-text="t('No users found')"
        clickable
        @row-click="open"
      >
        <template #cell-name="{ row }">
          <span class="users__identity">
            <DsAvatar :name="displayName(row)" size="md" />
            <strong>{{ displayName(row) }}</strong>
            <DsChip v-if="row.is_admin" size="sm" variant="primary">{{ t('Admin') }}</DsChip>
          </span>
        </template>

        <template v-for="column in valueColumns" #[`cell-${column.key}`]="{ value }" :key="column.key">
          {{ render(column, value) }}
        </template>

        <template #cell-actions="{ row }">
          <span @click.stop>
            <DsMenu>
              <template #trigger>
                <DsIconButton :aria-label="t('Actions')" icon="solar:menu-dots-bold" />
              </template>
              <DsMenuItem icon="solar:eye-linear" @click="open(row)">{{ t('View profile') }}</DsMenuItem>
            </DsMenu>
          </span>
        </template>
      </DsDataTable>

      <DsPagination
        :page="page"
        :pages="pages"
        :disabled="pending"
        :label="t('Pagination')"
        :previous-label="t('Previous')"
        :next-label="t('Next')"
        @change="changePage"
      >
        {{ t('Page {page} of {pages} · {total} users', { page, pages, total: total.toLocaleString() }) }}
      </DsPagination>
    </template>
  </AdminPage>
</template>

<script setup lang="ts">
import {
  DsChip,
  DsDataTable,
  DsIconButton,
  DsAvatar,
  DsMenu,
  DsMenuItem,
  DsPagination,
  DsSearchInput,
  DsStatePanel,
  type DataTableColumn,
} from "@whilesmart/design";
import type { AdminUser } from "../../../types/admin";
import { displayName } from "../../../lib/users";

definePageMeta({ layout: "admin", middleware: ["auth", "admin"] as never[] });

const t = useAdminText();
const admin = useAdminConsole();
const route = useRoute();
const router = useRouter();
const { columns, render } = useAdminUserColumns();

const items = ref<AdminUser[]>([]);
const query = ref("");
const pending = ref(true);
const failed = ref(false);
const page = ref(1);
const pages = ref(1);
const total = ref(0);

// The overview links here with a date, so the list has to read it from the URL and say so.
const joinedOn = computed(() => (route.query.joined_on ? String(route.query.joined_on) : ""));
const filtered = computed(() => Boolean(query.value || joinedOn.value));

const tableColumns = computed<DataTableColumn[]>(() => [
  ...columns.map((column) => ({ key: column.key, label: t(column.label), align: column.align })),
  { key: "actions", label: t("Actions"), align: "right" as const, width: "1%" },
]);
const valueColumns = computed(() => columns.filter((column) => column.key !== "name"));

const emptyTitle = computed(() =>
  filtered.value ? t("No user matches this filter") : t("No users yet"),
);
const emptyDescription = computed(() =>
  filtered.value
    ? t("Widen the search, or clear the filter to see everyone.")
    : t("People who register appear here."),
);

async function load() {
  pending.value = true;
  failed.value = false;
  try {
    const response = await admin.users({
      q: query.value,
      page: page.value,
      joinedOn: joinedOn.value || undefined,
    });
    items.value = response.data;
    pages.value = response.meta.last_page;
    total.value = response.meta.total;
  } catch {
    failed.value = true;
  } finally {
    pending.value = false;
  }
}

function clearJoinedOn() {
  router.replace({ query: { ...route.query, joined_on: undefined } });
}

function clearFilters() {
  query.value = "";
  clearJoinedOn();
}

let timer: ReturnType<typeof setTimeout>;
watch(query, () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    page.value = 1;
    load();
  }, 300);
});

watch(joinedOn, () => {
  page.value = 1;
  load();
});

onBeforeUnmount(() => clearTimeout(timer));

function changePage(value: number) {
  page.value = value;
  load();
}

function open(user: AdminUser) {
  navigateTo(`/admin/users/${user.id}`);
}

onMounted(load);
</script>

<style scoped>
.users__identity {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-space-2);
}

.users__filters {
  display: flex;
  gap: var(--ds-space-2);
}
</style>
