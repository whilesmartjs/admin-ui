import { describe, expect, it } from "vitest";
import { displayName } from "./users";
import type { AdminUser } from "../types/admin";

// The two shapes in play: the package's own resource composes `name`; Trakli's admin user
// endpoint returns the parts and no `name` at all.
const composed = { id: 1, name: "Ada Lovelace", first_name: "Ada", last_name: "Lovelace", email: "ada@example.test" };
// Captured from Trakli's GET /api/v1/admin/users, which returns the model and no `name`.
const parts = {
  "id": 5,
  "email": "user5@trakli.app",
  "email_verified_at": "2026-07-11T19:46:57.000000Z",
  "created_at": "2026-07-11T19:46:57.000000Z",
  "updated_at": "2026-07-11T19:46:57.000000Z",
  "last_name": "Padberg",
  "username": "user5",
  "phone": "814-861-3199",
  "first_name": "Carrie",
  "tokens_used": null,
  "last_seen_at": null,
  "last_transaction_at": "2026-07-21 19:47:05",
  "avatar_url": null,
  "is_admin": false
};

describe("displayName", () => {
  it("prefers a composed name when the host sends one", () => {
    expect(displayName(composed as AdminUser)).toBe("Ada Lovelace");
  });

  it("builds one from the parts when the host sends no name", () => {
    expect(displayName(parts as unknown as AdminUser)).toBe("Carrie Padberg");
  });

  it("falls back to the username, then the email", () => {
    expect(displayName({ username: "user1", email: "a@b.test" } as unknown as AdminUser)).toBe("user1");
    expect(displayName({ email: "a@b.test" } as unknown as AdminUser)).toBe("a@b.test");
  });

  it("ignores a blank name rather than rendering nothing", () => {
    expect(displayName({ name: "   ", first_name: "Ada" } as unknown as AdminUser)).toBe("Ada");
  });

  it("returns an empty string for no user at all", () => {
    expect(displayName(null)).toBe("");
    expect(displayName(undefined)).toBe("");
  });
});
