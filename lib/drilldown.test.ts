import { describe, expect, it } from "vitest";
import { drilldownTarget } from "./drilldown";

const targets = { new_users_series: "/admin/users?joined_on={date}" };

describe("drilldownTarget", () => {
  it("builds the host's path for a configured series", () => {
    expect(drilldownTarget(targets, "new_users_series", "2026-09-19"))
      .toBe("/admin/users?joined_on=2026-09-19");
  });

  it("returns nothing for a series the host did not configure", () => {
    expect(drilldownTarget(targets, "transactions_series", "2026-09-19")).toBeNull();
  });

  it("encodes the date so it cannot break out of the query string", () => {
    expect(drilldownTarget(targets, "new_users_series", "2026-09-19&admin=1"))
      .toBe("/admin/users?joined_on=2026-09-19%26admin%3D1");
  });
});
