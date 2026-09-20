import { defaultUserColumns, renderCell, type AdminUserColumn } from "../lib/columns";

export type { AdminUserColumn };

/**
 * A host whose user endpoint returns more than the package's own resource configures the
 * extra columns here rather than forking the page.
 */
export function useAdminUserColumns() {
  const configured = useRuntimeConfig().public.adminUserColumns;
  const columns =
    Array.isArray(configured) && configured.length
      ? (configured as AdminUserColumn[])
      : defaultUserColumns;

  const t = useAdminText();

  return {
    columns,
    render: (column: AdminUserColumn, value: unknown) => renderCell(column, value, t("Never")),
  };
}
