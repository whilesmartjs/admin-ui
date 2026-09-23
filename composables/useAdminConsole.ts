import type {
  AdminFeedback,
  AdminMetricReport,
  AdminUser,
  AdminUserDetail,
  MailTemplate,
  Offer,
  OfferProvider,
  RawUserDetail,
} from "../types/admin";

export function useAdminConsole() {
  const api = useApi();
  const prefix = useRuntimeConfig().public.adminApiPrefix as string;

  async function users(params: { q?: string; page?: number; joinedOn?: string } = {}) {
    const query = new URLSearchParams();
    if (params.q) {
      query.set("q", params.q);
      query.set("search", params.q);
    }
    if (params.joinedOn) query.set("joined_on", params.joinedOn);
    if (params.page) query.set("page", String(params.page));
    const suffix = query.size ? `?${query}` : "";
    const response = await api<{ data: { data: AdminUser[]; meta?: { total: number; last_page: number }; total?: number; last_page?: number } }>(`${prefix}/users${suffix}`);
    return {
      data: response.data.data,
      meta: response.data.meta ?? {
        total: response.data.total ?? response.data.data.length,
        last_page: response.data.last_page ?? 1,
      },
    };
  }

  async function user(id: number | string): Promise<AdminUserDetail> {
    const response = await api<{ data: AdminUser | RawUserDetail }>(`${prefix}/users/${id}`);
    const body = response.data;

    // A host that knows more about a person returns it around the user rather than on it,
    // so counts and preferences stay separable and can be shown as what they are. AdminUser
    // carries an index signature, so "user" in body cannot narrow the union on its own.
    const wrapped = body as Partial<RawUserDetail>;
    if (typeof wrapped.user !== "object" || wrapped.user === null) {
      return { user: body as AdminUser, counts: {}, preferences: {}, lastTransactionAt: null };
    }

    return {
      user: wrapped.user,
      counts: wrapped.counts ?? {},
      preferences: wrapped.preferences ?? {},
      lastTransactionAt: wrapped.last_transaction_at ?? null,
    };
  }

  async function metrics(
    params: {
      days?: number;
      granularity?: "day" | "week" | "month";
      client?: string;
    } = {},
  ): Promise<AdminMetricReport> {
    const query = new URLSearchParams();
    if (params.days) query.set("days", String(params.days));
    if (params.granularity) query.set("granularity", params.granularity);
    if (params.client) query.set("client", params.client);
    const suffix = query.size ? `?${query}` : "";
    const response = await api<{ data: AdminMetricReport }>(
      `${prefix}/metrics${suffix}`,
    );
    return response.data;
  }

  async function templates(): Promise<MailTemplate[]> {
    const response = await api<{ data: MailTemplate[] }>(
      `${prefix}/mail-templates`,
    );
    return response.data;
  }

  async function saveTemplate(
    key: string,
    payload: MailTemplate,
  ): Promise<MailTemplate> {
    const response = await api<{ data: MailTemplate }>(
      `${prefix}/mail-templates/${key}`,
      { method: "PUT", body: payload },
    );
    return response.data;
  }

  async function previewTemplate(key: string, payload: MailTemplate) {
    const response = await api<{
      data: {
        subject: string;
        body: string;
        cta_label: string | null;
        cta_url: string | null;
        html: string;
      };
    }>(`${prefix}/mail-templates/${key}/preview`, {
      method: "POST",
      body: payload,
    });
    return response.data;
  }

  async function feedback(
    params: { status?: string; type?: string; q?: string } = {},
  ): Promise<AdminFeedback[]> {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.type) query.set("type", params.type);
    if (params.q) query.set("q", params.q);
    const suffix = query.size ? `?${query}` : "";
    const response = await api<{
      data: AdminFeedback[] | { data: AdminFeedback[] };
    }>(`${prefix}/feedback${suffix}`);
    return Array.isArray(response.data) ? response.data : response.data.data;
  }

  async function updateFeedbackStatus(
    id: number | string,
    status: string,
  ): Promise<AdminFeedback> {
    const response = await api<{ data: AdminFeedback }>(
      `${prefix}/feedback/${id}`,
      {
        method: "PATCH",
        body: { status },
      },
    );
    return response.data;
  }

  async function offerProviders(): Promise<OfferProvider[]> {
    const response = await api<{ data: OfferProvider[] }>(`${prefix}/offers`);
    return response.data;
  }

  async function createOffer(
    provider: string,
    attributes: Record<string, unknown>,
  ): Promise<Offer> {
    const response = await api<{ data: Offer }>(`${prefix}/offers/${provider}`, {
      method: "POST",
      body: { attributes },
    });
    return response.data;
  }

  async function revokeOffer(provider: string, id: string): Promise<void> {
    await api(`${prefix}/offers/${provider}/${id}`, { method: "DELETE" });
  }

  return {
    metrics,
    users,
    user,
    templates,
    saveTemplate,
    previewTemplate,
    feedback,
    updateFeedbackStatus,
    offerProviders,
    createOffer,
    revokeOffer,
  };
}
