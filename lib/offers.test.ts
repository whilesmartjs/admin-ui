import { describe, expect, it } from "vitest";
import { blankDraft, filledAttributes, offerRow, readyToCreate, userSuggestions } from "./offers";
import type { Offer, OfferField } from "../types/admin";

const field = (over: Partial<OfferField> = {}): OfferField => ({
  name: "code",
  label: "Code",
  type: "text",
  required: false,
  help: null,
  options: {},
  ...over,
});

const offer = (over: Partial<Offer> = {}): Offer => ({
  id: "promo_1",
  code: "PILOT20",
  value: "20% off",
  expires_at: null,
  redemptions: null,
  max_redemptions: null,
  active: true,
  meta: {},
  ...over,
});

describe("blankDraft", () => {
  it("gives every declared field a control", () => {
    const draft = blankDraft([field({ name: "code" }), field({ name: "on", type: "boolean" })]);

    expect(draft).toEqual({ code: "", on: false });
  });
});

describe("filledAttributes", () => {
  it("leaves out a box nobody typed in", () => {
    expect(filledAttributes({ code: "PILOT20", percent_off: "" })).toEqual({ code: "PILOT20" });
  });

  it("keeps a switch that is off, because off is an answer", () => {
    expect(filledAttributes({ on: false })).toEqual({ on: false });
  });
});

describe("readyToCreate", () => {
  const fields = [field({ name: "code", required: true }), field({ name: "note" })];

  it("refuses while a required box is empty or only spaces", () => {
    expect(readyToCreate(fields, { code: "", note: "x" })).toBe(false);
    expect(readyToCreate(fields, { code: "   ", note: "" })).toBe(false);
  });

  it("allows once the required boxes are filled", () => {
    expect(readyToCreate(fields, { code: "PILOT20", note: "" })).toBe(true);
  });
});

describe("userSuggestions", () => {
  it("shows the address, with the name beside it", () => {
    const [first] = userSuggestions([
      { id: 1, email: "ada@example.test", name: "Ada", first_name: "Ada", last_name: null, created_at: null },
    ]);

    expect(first).toMatchObject({ label: "ada@example.test", description: "Ada" });
  });
});

describe("offerRow", () => {
  const labels = { never: "No end", forever: "No limit" };

  it("says what comes off and when it stops", () => {
    const row = offerRow(offer({ expires_at: "2026-12-31T23:59:59Z" }), labels);

    expect(row.value).toBe("20% off");
    expect(row.until).not.toBe("No end");
  });

  it("does not claim nobody used a code the provider never counted", () => {
    expect(offerRow(offer({ redemptions: null }), labels).used).toBe("\u2014");
  });

  it("counts a code nobody has used yet against its limit", () => {
    expect(offerRow(offer({ redemptions: 0, max_redemptions: 5 }), labels).used).toBe("0 / 5");
  });

  it("says so when a code never stops", () => {
    expect(offerRow(offer(), labels).until).toBe("No end");
  });
});
