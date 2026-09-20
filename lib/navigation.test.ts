import { describe, expect, it } from "vitest";
import { currentDestination, mergeNavigation, type AdminNavItem } from "./navigation";

const defaults: AdminNavItem[] = [
  { label: "Overview", to: "/admin", icon: "solar:widget-5-bold-duotone", area: "indigo" },
  { label: "Users", to: "/admin/users", icon: "solar:users-group-rounded-bold-duotone", area: "green" },
];

describe("mergeNavigation", () => {
  it("appends a host destination after the package's own", () => {
    const items = mergeNavigation(defaults, [{ label: "Outreach", to: "/admin/outreach" }]);
    expect(items.map((item) => item.to)).toEqual(["/admin", "/admin/users", "/admin/outreach"]);
  });

  it("never lets a host replace a destination the package owns", () => {
    const items = mergeNavigation(defaults, [{ label: "Hijacked", to: "/admin/users" }]);
    expect(items).toHaveLength(2);
    expect(items[1].label).toBe("Users");
  });

  it("drops an entry with no destination", () => {
    expect(mergeNavigation(defaults, [{ label: "Nowhere" }])).toHaveLength(2);
  });

  it("gives a host entry an icon and a colour when it supplies none", () => {
    const [, , added] = mergeNavigation(defaults, [{ to: "/admin/outreach" }]);
    expect(added.icon).toMatch(/^solar:/);
    expect(added.area).toBeTruthy();
    expect(added.label).toBe("/admin/outreach");
  });
});

describe("currentDestination", () => {
  it("prefers the longest match, so /admin does not win everywhere", () => {
    expect(currentDestination(defaults, "/admin/users")?.to).toBe("/admin/users");
  });

  it("keeps a child route on its parent destination", () => {
    expect(currentDestination(defaults, "/admin/users/42")?.to).toBe("/admin/users");
  });

  it("matches the overview exactly", () => {
    expect(currentDestination(defaults, "/admin")?.to).toBe("/admin");
  });

  it("returns nothing outside the console", () => {
    expect(currentDestination(defaults, "/dashboard")).toBeUndefined();
  });

  it("does not match a sibling that merely shares a prefix", () => {
    expect(currentDestination(defaults, "/admin/users-export")?.to).toBe("/admin");
  });
});
