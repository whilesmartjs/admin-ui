import type { AdminUser, Offer, OfferField } from "../types/admin";

/**
 * A control for every field the host declared, empty rather than absent.
 *
 * A field left out of the draft has no control bound to it, so the form would
 * silently drop whatever the host asked for.
 */
export function blankDraft(fields: OfferField[]): Record<string, string | boolean> {
  const draft: Record<string, string | boolean> = {};

  for (const field of fields) {
    draft[field.name] = field.type === "boolean" ? false : "";
  }

  return draft;
}

/**
 * What to send: only what somebody filled in.
 *
 * An empty box is a field left alone. Sending it as an empty string invites a
 * host to read it as a zero and make a discount nobody asked for.
 */
export function filledAttributes(
  draft: Record<string, string | boolean>,
): Record<string, string | boolean> {
  return Object.fromEntries(
    Object.entries(draft).filter(([, value]) => value !== "" && value !== null && value !== undefined),
  );
}

export function readyToCreate(
  fields: OfferField[],
  draft: Record<string, string | boolean>,
): boolean {
  return fields
    .filter((field) => field.required)
    .every((field) => {
      const value = draft[field.name];
      return field.type === "boolean" ? value !== undefined : String(value ?? "").trim() !== "";
    });
}

export function userSuggestions(users: AdminUser[]) {
  return users.map((user) => ({
    id: String(user.email ?? user.id),
    label: String(user.email ?? ""),
    description: String(user.name ?? ""),
    type: "user",
  }));
}

/**
 * One code as a table row.
 *
 * A provider that does not count redemptions should not be made to look as
 * though nobody has used its codes, so an absent figure says so rather than
 * reading as zero.
 */
export function offerRow(offer: Offer, labels: { never: string; forever: string }) {
  const used =
    offer.redemptions === null || offer.redemptions === undefined
      ? "\u2014"
      : `${offer.redemptions}${offer.max_redemptions ? ` / ${offer.max_redemptions}` : ""}`;

  return {
    id: offer.id,
    code: offer.code,
    active: offer.active,
    value: offer.value,
    lasts: typeof offer.meta?.lasts === "string" ? offer.meta.lasts : labels.forever,
    used,
    until: offer.expires_at ? new Date(offer.expires_at).toLocaleDateString() : labels.never,
  };
}
