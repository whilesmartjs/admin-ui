/** Turns a host's target template into a path. Returns null when no target is configured. */
export function drilldownTarget(
  targets: Record<string, string>,
  key: string,
  date: string,
): string | null {
  const template = targets[key];
  return template ? template.replace("{date}", encodeURIComponent(date)) : null;
}
