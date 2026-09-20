import { interpolate, type MessageParams } from "../lib/text";

/**
 * Admin strings are written as their English text, so a host with no translation layer
 * renders them unchanged. A host that has merged messages/en.json into its own locale
 * sets adminI18n and the strings route through its translator instead.
 */
export function useAdminText() {
  const enabled = useRuntimeConfig().public.adminI18n === true;
  const translate = enabled
    ? (useNuxtApp() as { $t?: (key: string, params?: MessageParams) => string }).$t
    : undefined;

  return (text: string, params?: MessageParams) =>
    typeof translate === "function" ? translate(text, params) : interpolate(text, params);
}
