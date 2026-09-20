export type MessageParams = Record<string, string | number>;

/** Replaces {name} placeholders. An unknown placeholder is left alone rather than blanked. */
export function interpolate(text: string, params?: MessageParams): string {
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}
