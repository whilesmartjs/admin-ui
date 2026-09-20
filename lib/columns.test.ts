import { describe, expect, it } from "vitest";
import { defaultUserColumns, renderCell, type AdminUserColumn } from "./columns";

const column = (type?: AdminUserColumn["type"]): AdminUserColumn => ({ key: "x", label: "X", type });

describe("renderCell", () => {
  it("shows the never label for a value the host has not recorded", () => {
    for (const empty of [null, undefined, ""]) {
      expect(renderCell(column("datetime"), empty, "Never")).toBe("Never");
    }
  });

  it("keeps a zero rather than treating it as missing", () => {
    expect(renderCell(column("number"), 0, "Never")).toBe("0");
  });

  it("groups thousands on a number column", () => {
    expect(renderCell(column("number"), 12045, "Never")).toBe(
      new Intl.NumberFormat().format(12045),
    );
  });

  it("renders a date column as a date and a datetime column with the time", () => {
    const iso = "2026-09-19T08:30:00.000Z";
    expect(renderCell(column("date"), iso, "Never")).toBe(new Date(iso).toLocaleDateString());
    expect(renderCell(column("datetime"), iso, "Never")).toBe(new Date(iso).toLocaleString());
  });

  it("passes text through untouched", () => {
    expect(renderCell(column(), "nfebe@example.test", "Never")).toBe("nfebe@example.test");
  });
});

describe("defaultUserColumns", () => {
  it("covers what the package's own user resource returns", () => {
    expect(defaultUserColumns.map((c) => c.key)).toEqual(["name", "email", "created_at"]);
  });
});
