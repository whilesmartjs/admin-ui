<template>
  <AdminPage
    :title="t('Discounts and offers')"
    :description="t('Create and target promotions from configured offer providers.')"
  >
    <DsStatePanel v-if="pending" state="loading" :title="t('Loading discounts')" />
    <DsStatePanel
      v-else-if="loadError"
      state="error"
      :title="t('Could not load discounts')"
      :description="loadError"
      :action-label="t('Try again')"
      @action="load"
    />
    <DsStatePanel
      v-else-if="!providers.length"
      art="empty"
      area="rose"
      :title="t('No offer provider is configured')"
      :description="t('Register an offer provider and its promotions become editable here, so a discount is never hard-coded into the product.')"
    />

    <div v-else-if="provider" class="offers">
      <DsTabs
        v-if="providers.length > 1"
        v-model="selected"
        :options="providerTabs"
        area="rose"
        :label="t('Offer providers')"
      />

      <div class="offers__bar">
        <p class="offers__count">
          {{ provider.offers.length ? t('{n} in circulation').replace('{n}', String(live)) : '' }}
        </p>
        <DsButton area="rose" @click="open">{{ t('New discount') }}</DsButton>
      </div>

      <DsStatePanel
        v-if="!provider.offers.length"
        art="empty"
        area="rose"
        :title="t('Nothing is on offer yet')"
        :description="t('A discount is live the moment it exists, so only make one you mean to hand out.')"
        :action-label="t('New discount')"
        @action="open"
      />

      <DsDataTable
        v-else
        :columns="columns"
        :rows="rows"
        row-key="id"
        :empty-text="t('Nothing is on offer yet')"
      >
        <template #cell-code="{ row }">
          <span class="offers__code">{{ row.code }}</span>
          <DsChip v-if="!row.active" size="sm">{{ t('Revoked') }}</DsChip>
        </template>

        <template #cell-actions="{ row }">
          <DsButton
            v-if="row.active"
            variant="ghost"
            size="sm"
            :disabled="revoking === row.id"
            @click="revoke(row.offer)"
          >
            {{ revoking === row.id ? t('Revoking') : t('Revoke') }}
          </DsButton>
        </template>
      </DsDataTable>
    </div>

    <DsModal
      v-model="creating"
      :title="t('New discount')"
      :description="provider?.label"
      size="lg"
    >
      <form id="new-discount" class="offers__form" @submit.prevent="create">
        <div class="offers__fields">
          <template v-for="field in provider?.fields ?? []" :key="field.name">
            <DsDropdown
              v-if="field.type === 'select'"
              :model-value="String(draft[field.name] ?? '')"
              :options="choices(field)"
              :label="field.label"
              :placeholder="t('Choose one')"
              @update:model-value="draft[field.name] = $event"
            />

            <div v-else-if="field.type === 'user'" class="ds-field">
              <label class="ds-field__label">{{ field.label }}</label>
              <DsAutocompleteInput
                :model-value="String(draft[field.name] ?? '')"
                :placeholder="t('Search people, or type an address')"
                :provider="findPeople"
                @update:model-value="draft[field.name] = $event"
                @select="draft[field.name] = $event.label"
              />
              <span v-if="field.help" class="offers__help">{{ field.help }}</span>
            </div>

            <!-- The design system ships no date control. -->
            <div v-else-if="field.type === 'date'" class="ds-field">
              <label class="ds-field__label" :for="`offer-${field.name}`">{{ field.label }}</label>
              <input
                :id="`offer-${field.name}`"
                v-model="draft[field.name]"
                class="ds-field__control"
                type="date"
              />
              <span v-if="field.help" class="offers__help">{{ field.help }}</span>
            </div>

            <DsSwitch
              v-else-if="field.type === 'boolean'"
              :model-value="draft[field.name] === true"
              :label="field.label"
              @update:model-value="draft[field.name] = $event"
            />

            <div v-else class="ds-field">
              <DsInput
                :model-value="String(draft[field.name] ?? '')"
                :type="field.type === 'number' ? 'number' : 'text'"
                :label="field.label"
                :required="field.required"
                @update:model-value="draft[field.name] = $event"
              />
              <span v-if="field.help" class="offers__help">{{ field.help }}</span>
            </div>
          </template>
        </div>

        <p v-if="createError" class="offers__error" role="alert">{{ createError }}</p>
      </form>

      <template #footer>
        <DsButton variant="ghost" @click="creating = false">{{ t('Cancel') }}</DsButton>
        <DsButton area="rose" type="submit" form="new-discount" :disabled="saving || !ready">
          {{ saving ? t('Creating') : t('Create discount') }}
        </DsButton>
      </template>
    </DsModal>

  </AdminPage>
</template>

<script setup lang="ts">
import {
  DsAutocompleteInput,
  DsButton,
  DsChip,
  DsDataTable,
  DsDropdown,
  DsInput,
  DsModal,
  DsStatePanel,
  DsSwitch,
  DsTabs,
} from "@whilesmart/design";
import { blankDraft, filledAttributes, offerRow, readyToCreate, userSuggestions } from "../../lib/offers";
import type { Offer, OfferField, OfferProvider } from "../../types/admin";

definePageMeta({ layout: "admin", middleware: ["auth", "admin"] as never[] });

const t = useAdminText();
const admin = useAdminConsole();

const providers = ref<OfferProvider[]>([]);
const selected = ref("");
const pending = ref(true);
const loadError = ref("");
const createError = ref("");
const saving = ref(false);
const revoking = ref("");
const draft = ref<Record<string, string | boolean>>({});
const creating = ref(false);

const provider = computed(
  () => providers.value.find((one) => one.key === selected.value) ?? providers.value[0],
);

const providerTabs = computed(() =>
  providers.value.map((one) => ({ key: one.key, label: one.label })),
);

const live = computed(() => provider.value?.offers.filter((offer) => offer.active).length ?? 0);

const ready = computed(() => readyToCreate(provider.value?.fields ?? [], draft.value));

const columns = computed(() => [
  { key: "code", label: t("Code") },
  { key: "value", label: t("Takes off") },
  { key: "lasts", label: t("Lasts") },
  { key: "used", label: t("Used") },
  { key: "until", label: t("Until") },
  { key: "actions", label: "", align: "right" as const, width: "8rem" },
]);

const rows = computed(() => (provider.value?.offers ?? []).map((offer) => ({
  ...offerRow(offer, { never: t("No limit"), forever: t("No end") }),
  offer,
})));

function choices(field: OfferField) {
  return Object.entries(field.options).map(([value, label]) => ({ value, label }));
}

async function findPeople(query: string) {
  if (query.trim().length < 2) return [];

  const { data } = await admin.users({ q: query });
  return userSuggestions(data);
}

function open() {
  draft.value = blankDraft(provider.value?.fields ?? []);
  createError.value = "";
  creating.value = true;
}

async function load() {
  pending.value = true;
  loadError.value = "";
  try {
    providers.value = await admin.offerProviders();
    if (!selected.value && providers.value.length) selected.value = providers.value[0]!.key;
  } catch {
    loadError.value = t("The admin service did not answer. Nothing has changed.");
  } finally {
    pending.value = false;
  }
}

async function create() {
  if (!provider.value) return;
  saving.value = true;
  createError.value = "";
  try {
    await admin.createOffer(provider.value.key, filledAttributes(draft.value));
    creating.value = false;
    await load();
  } catch (error) {
    createError.value =
      (error as { data?: { message?: string } })?.data?.message ??
      t("That discount could not be created.");
  } finally {
    saving.value = false;
  }
}

async function revoke(offer: Offer) {
  if (!provider.value) return;
  revoking.value = offer.id;
  try {
    await admin.revokeOffer(provider.value.key, offer.id);
    await load();
  } finally {
    revoking.value = "";
  }
}

onMounted(load);
</script>

<style scoped>
.offers {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-4);
}

.offers__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-space-3);
}

.offers__count {
  margin: 0;
  font-size: var(--ds-text-sm);
  color: var(--ds-text-muted);
}

.offers__code {
  font-family: var(--ds-font-mono, monospace);
  font-weight: var(--ds-font-semibold);
  color: var(--ds-text-primary);
}

.offers__form {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-4);
}

.offers__fields {
  display: grid;
  gap: var(--ds-space-3);
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
}

.offers__help {
  font-size: var(--ds-text-xs);
  color: var(--ds-text-muted);
}

.offers__error {
  margin: 0;
  font-size: var(--ds-text-sm);
  color: var(--ds-color-error-600);
}

@media (max-width: 40rem) {
  .offers__item {
    flex-direction: column;
    align-items: flex-start;
  }

  .offers__actions {
    flex-direction: column-reverse;
  }

  .offers__actions > * {
    width: 100%;
  }
}
</style>
