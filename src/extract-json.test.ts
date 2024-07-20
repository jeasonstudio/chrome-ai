import { describe, it, expect } from "vitest";
import { extractJSON } from "./extract-json";

describe("extractJSON", () => {
  it("correctly extracts JSON part", () => {
    const text = '```json{"key": "value"}```';
    expect(extractJSON(text)).toBe(`{"key": "value"}`);
  });

  it("leaves the text as it was before if no json indicator found", () => {
    const text = "Just some text";
    expect(extractJSON(text)).toBe("Just some text");
  });
});
