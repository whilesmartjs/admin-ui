export type AdminColumnType = "text" | "number" | "date" | "datetime";

export interface AdminUserColumn {
  key: string;
  label: string;
  type?: AdminColumnType;
  align?: "left" | "center" | "right";
}

export const defaultUserColumns: AdminUserColumn[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "created_at", label: "Joined", type: "date" },
];

export function renderCell(column: AdminUserColumn, value: unknown, neverLabel: string): string {
  if (value === null || value === undefined || value === "") return neverLabel;
  if (column.type === "date") return new Date(String(value)).toLocaleDateString();
  if (column.type === "datetime") return new Date(String(value)).toLocaleString();
  if (column.type === "number") return new Intl.NumberFormat().format(Number(value));
  return String(value);
}
