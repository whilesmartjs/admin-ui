<template>
  <AdminPage
    :title="t('Email templates')"
    :description="t('Configure the automatic emails this product sends.')"
  >
    <DsStatePanel v-if="pending" state="loading" :title="t('Loading email templates')" />
    <DsStatePanel
      v-else-if="loadError"
      state="error"
      :title="t('Could not load email templates')"
      :description="loadError"
      :action-label="t('Try again')"
      @action="load"
    />
    <DsStatePanel
      v-else-if="!templates.length"
      art="mail"
      area="violet"
      :title="t('No email templates are registered')"
      :description="t('Templates the application registers become editable here, so the wording is never hard-coded.')"
    />

    <div v-else-if="form" class="templates">
      <nav class="templates__list" :aria-label="t('Email templates')">
        <button
          v-for="item in templates"
          :key="item.key"
          class="templates__item"
          :class="{ 'is-active': item.key === form.key }"
          type="button"
          @click="select(item)"
        >
          <span class="templates__item-name">
            {{ item.name }}
            <DsChip v-if="!item.enabled" size="sm">{{ t('Off') }}</DsChip>
          </span>
          <span class="templates__item-description">{{ item.description }}</span>
        </button>
      </nav>

      <div class="templates__pane">
        <DsTabs v-model="pane" :options="panes" area="violet" :label="t('Template views')" />

        <DsCard v-show="pane === 'edit'" padding="md">
          <form class="templates__form" @submit.prevent="save">
            <DsSwitch v-model="form.enabled" :label="t('Enabled')" />
            <DsInput v-model="form.subject" :label="t('Subject')" required />
            <DsTextarea v-model="form.body" :label="t('Message')" :rows="12" required />

            <div v-if="form.tokens.length" class="templates__tokens">
              <span class="templates__tokens-label">{{ t('Available tokens') }}</span>
              <DsChip v-for="token in form.tokens" :key="token" size="sm">{{ tokenLabel(token) }}</DsChip>
            </div>

            <div class="templates__row">
              <DsInput
                :model-value="form.cta_label ?? ''"
                :label="t('Button label')"
                @update:model-value="form.cta_label = $event || null"
              />
              <DsInput
                :model-value="form.cta_url ?? ''"
                :label="t('Button link')"
                type="url"
                @update:model-value="form.cta_url = $event || null"
              />
            </div>

            <div class="templates__actions">
              <DsButton type="submit" :loading="saving">
                {{ saving ? t('Saving…') : t('Save template') }}
              </DsButton>
              <span v-if="saved" class="templates__saved">{{ t('Saved') }}</span>
            </div>
          </form>
        </DsCard>

        <DsCard v-show="pane === 'preview'" padding="none" class="templates__preview">
          <header class="templates__preview-head">
            <div>
              <span>{{ t('Subject') }}</span>
              <strong>{{ rendered?.subject || form.subject }}</strong>
            </div>
            <DsButton variant="secondary" size="sm" :loading="previewing" @click="preview">
              {{ t('Refresh') }}
            </DsButton>
          </header>
          <DsStatePanel
            v-if="previewError"
            state="error"
            :title="t('Could not render the preview')"
            :description="previewError"
            :action-label="t('Try again')"
            @action="preview"
          />
          <p v-else-if="previewing && !rendered" class="templates__preview-note">
            {{ t('Rendering the preview…') }}
          </p>
          <iframe
            v-else-if="rendered?.html"
            class="templates__frame"
            :title="t('Email preview')"
            sandbox=""
            :srcdoc="rendered.html"
          />
        </DsCard>
      </div>
    </div>
  </AdminPage>
</template>

<script setup lang="ts">
import {
  DsButton,
  DsCard,
  DsChip,
  DsInput,
  DsStatePanel,
  DsSwitch,
  DsTabs,
  DsTextarea,
} from "@whilesmart/design";
import type { MailTemplate } from "../../types/admin";

definePageMeta({ layout: "admin", middleware: ["auth", "admin"] as never[] });

const t = useAdminText();
const admin = useAdminConsole();

const templates = ref<MailTemplate[]>([]);
const form = ref<MailTemplate | null>(null);
const pane = ref("edit");
const rendered = ref<{
  subject: string;
  body: string;
  cta_label: string | null;
  cta_url: string | null;
  html: string;
} | null>(null);
const saving = ref(false);
const saved = ref(false);
const previewing = ref(false);
const previewError = ref("");
const pending = ref(true);
const loadError = ref("");

const panes = computed(() => [
  { key: "edit", label: t("Edit") },
  { key: "preview", label: t("Preview") },
]);

// Written out rather than inlined: a mustache pair inside an interpolation ends the
// interpolation early and the template stops compiling.
const tokenLabel = (token: string) => `{${"{"}${token}}}`;

function select(item: MailTemplate) {
  form.value = structuredClone(toRaw(item));
  rendered.value = null;
}

async function preview() {
  if (!form.value) return;
  previewing.value = true;
  previewError.value = "";
  try {
    rendered.value = await admin.previewTemplate(form.value.key, form.value);
  } catch {
    previewError.value = t("Check the subject and message, then try again.");
  } finally {
    previewing.value = false;
  }
}

async function save() {
  if (!form.value) return;
  saving.value = true;
  saved.value = false;
  try {
    const updated = await admin.saveTemplate(form.value.key, form.value);
    form.value = updated;
    templates.value = templates.value.map((item) => (item.key === updated.key ? updated : item));
    saved.value = true;
    setTimeout(() => (saved.value = false), 2000);
  } finally {
    saving.value = false;
  }
}

let timer: ReturnType<typeof setTimeout>;
watch(
  form,
  () => {
    clearTimeout(timer);
    timer = setTimeout(preview, 300);
  },
  { deep: true },
);

onBeforeUnmount(() => clearTimeout(timer));

async function load() {
  pending.value = true;
  loadError.value = "";
  try {
    templates.value = await admin.templates();
    if (templates.value.length) select(templates.value[0]);
  } catch (error) {
    const response = (error as { data?: { message?: string } }).data;
    loadError.value = response?.message ?? t("Check the admin service and try again.");
  } finally {
    pending.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.templates {
  display: grid;
  grid-template-columns: 15rem minmax(0, 1fr);
  gap: var(--ds-space-5);
  align-items: start;
}

.templates__list {
  display: grid;
  gap: var(--ds-space-1);
  position: sticky;
  top: var(--ds-space-4);
}

.templates__item {
  display: grid;
  gap: 0.125rem;
  padding: var(--ds-space-3);
  border: 1px solid transparent;
  border-radius: var(--ds-radius-card);
  background: none;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}

.templates__item:hover {
  background: var(--ds-bg-hover);
}

.templates__item.is-active {
  border-color: var(--ds-area-violet-fill);
  background: var(--ds-area-violet-fill);
}

.templates__item-name {
  display: flex;
  align-items: center;
  gap: var(--ds-space-2);
  color: var(--ds-text-primary);
  font-size: var(--ds-text-sm);
  font-weight: var(--ds-font-semibold);
}

.templates__item.is-active .templates__item-name {
  color: var(--ds-area-violet-ink);
}

.templates__item-description {
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-xs);
  line-height: 1.4;
}

.templates__pane {
  display: grid;
  gap: var(--ds-space-4);
  min-width: 0;
}

.templates__form {
  display: grid;
  gap: var(--ds-space-4);
}

.templates__row {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: var(--ds-space-3);
}

.templates__tokens {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--ds-space-2);
}

.templates__tokens-label {
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-xs);
}

.templates__actions {
  display: flex;
  align-items: center;
  gap: var(--ds-space-3);
}

.templates__saved {
  color: var(--ds-status-success-text);
  font-size: var(--ds-text-sm);
}

.templates__preview {
  overflow: hidden;
}

.templates__preview-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-space-4);
  padding: var(--ds-space-4);
}

.templates__preview-head > div {
  display: grid;
  gap: 0.125rem;
  min-width: 0;
}

.templates__preview-head span {
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-xs);
}

.templates__preview-head strong {
  overflow: hidden;
  color: var(--ds-text-primary);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.templates__preview-note {
  padding: var(--ds-space-8);
  color: var(--ds-text-secondary);
  text-align: center;
}

.templates__frame {
  display: block;
  width: 100%;
  height: 34rem;
  border: 0;
  border-top: 1px solid var(--ds-border-base);
  background: #fff;
}

@media (max-width: 900px) {
  .templates {
    grid-template-columns: minmax(0, 1fr);
  }

  .templates__list {
    position: static;
    grid-auto-flow: column;
    grid-auto-columns: 13rem;
    overflow-x: auto;
    padding-bottom: var(--ds-space-2);
  }
}

@media (max-width: 640px) {
  .templates__row {
    grid-template-columns: minmax(0, 1fr);
  }

  .templates__actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
