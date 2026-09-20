import { describe, expect, it } from "vitest";
import { interpolate } from "./text";

describe("interpolate", () => {
  it("fills a placeholder", () => {
    expect(interpolate("{days} days", { days: 30 })).toBe("30 days");
  });

  it("fills several, including repeats", () => {
    expect(interpolate("{a} of {b} · {a}", { a: 2, b: 9 })).toBe("2 of 9 · 2");
  });

  it("leaves an unknown placeholder alone rather than blanking it", () => {
    expect(interpolate("{days} of {total}", { days: 7 })).toBe("7 of {total}");
  });

  it("returns the text unchanged when there are no parameters", () => {
    expect(interpolate("Overview")).toBe("Overview");
  });
});
