import { describe, expect, it } from "vitest";
import { analyticsPerson, posthogOptions } from "./analytics";

describe("posthogOptions", () => {
  it("records replays only when the host turns them on", () => {
    expect(posthogOptions(false).disable_session_recording).toBe(true);
    expect(posthogOptions(true).disable_session_recording).toBe(false);
  });

  it("masks every text, attribute and input in a replay", () => {
    const options = posthogOptions(true);
    expect(options.mask_all_text).toBe(true);
    expect(options.mask_all_element_attributes).toBe(true);
    expect(options.session_recording).toEqual({ maskAllInputs: true, maskTextSelector: "*" });
  });
});

describe("analyticsPerson", () => {
  it("names a person from their first and last names when no name is given", () => {
    expect(analyticsPerson({ id: 7, email: "ada@example.test", first_name: "Ada", last_name: "Lovelace" })).toEqual({
      id: "7",
      properties: { email: "ada@example.test", name: "Ada Lovelace" },
    });
  });

  it("leaves out a name nobody gave", () => {
    expect(analyticsPerson({ id: 7 }).properties).toEqual({});
  });
});
