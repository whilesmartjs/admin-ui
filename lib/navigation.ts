import type { AreaColor } from "@whilesmart/design";

export interface AdminNavItem {
  label: string;
  to: string;
  icon: `solar:${string}`;
  area: AreaColor;
}

const fallbackAreas: AreaColor[] = ["slate", "violet", "teal"];

/** Host entries are appended, and never replace a destination the package already owns. */
export function mergeNavigation(
  defaults: AdminNavItem[],
  configured: Partial<AdminNavItem>[],
): AdminNavItem[] {
  const extra = configured
    .filter((item): item is Partial<AdminNavItem> & { to: string } =>
      Boolean(item.to) && !defaults.some((entry) => entry.to === item.to))
    .map((item, index) => ({
      label: item.label ?? item.to,
      to: item.to,
      icon: item.icon ?? ("solar:widget-5-bold-duotone" as const),
      area: item.area ?? fallbackAreas[index % fallbackAreas.length],
    }));

  return [...defaults, ...extra];
}

/** Longest match wins: /admin is a prefix of every other destination. */
export function currentDestination<T extends { to: string }>(items: T[], path: string): T | undefined {
  return items
    .filter((item) => path === item.to || path.startsWith(`${item.to}/`))
    .sort((a, b) => b.to.length - a.to.length)[0];
}
