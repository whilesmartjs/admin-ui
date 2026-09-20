export interface AdminUser {
  id: number | string;
  first_name: string | null;
  last_name: string | null;
  /** Composed by the package's resource; a host may send only the parts instead. */
  name?: string;
  username?: string;
  email: string;
  created_at: string | null;
  [key: string]: unknown;
}

/** The shape a host may return around a user, as Trakli's admin user endpoint does. */
export interface RawUserDetail {
  user: AdminUser;
  counts?: Record<string, number>;
  preferences?: Record<string, string | null>;
  last_transaction_at?: string | null;
}

export interface AdminUserDetail {
  user: AdminUser;
  counts: Record<string, number>;
  preferences: Record<string, string | null>;
  lastTransactionAt: string | null;
}

export interface MailTemplate {
  id: number;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  subject: string;
  body: string;
  cta_label: string | null;
  cta_url: string | null;
  tokens: string[];
}

export interface AdminFeedback {
  id: number | string;
  type: string;
  status: string;
  name: string | null;
  email: string | null;
  subject: string | null;
  message: string | null;
  created_at: string | null;
}

export type AdminMetricType = "count" | "sum" | "ratio" | "series" | "ranking";

export interface AdminMetricPoint {
  date: string;
  value: number;
}

export interface AdminMetricRow {
  label: string;
  value: number;
}

export interface AdminMetric {
  key: string;
  label: string;
  type: AdminMetricType;
  value: number | null;
  series: AdminMetricPoint[];
  rows: AdminMetricRow[];
  unit: string | null;
}

export interface AdminMetricGroup {
  key: string;
  label: string;
  /** Whether the client filter narrows this group's figures. Absent on older backends. */
  client_scoped?: boolean;
  metrics: AdminMetric[];
}

export interface AdminMetricReport {
  clients: Array<{ key: string; name: string }>;
  selected_client: string | null;
  period: { start: string; end: string; granularity: string };
  groups: AdminMetricGroup[];
}
