import type { AdminUser } from "../types/admin";

/**
 * Hosts disagree about what a person is called: some return a composed `name`, some only
 * the parts. Falling through the options keeps the console readable on any of them.
 */
export function displayName(user: Partial<AdminUser> | null | undefined): string {
  if (!user) return "";
  const composed = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  return (
    (typeof user.name === "string" && user.name.trim()) ||
    composed ||
    (typeof user.username === "string" && user.username) ||
    user.email ||
    ""
  );
}
