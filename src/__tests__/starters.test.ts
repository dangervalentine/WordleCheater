import { describe, it, expect } from "vitest";
import { STARTERS } from "../components/StarterWords";

describe("STARTERS", () => {
  it("offers at least one opener", () => {
    expect(STARTERS.length).toBeGreaterThan(0);
  });

  it("uses five-letter lowercase words", () => {
    for (const { word } of STARTERS) {
      expect(word).toMatch(/^[a-z]{5}$/);
    }
  });

  it("contains no duplicate words", () => {
    const words = STARTERS.map((s) => s.word);
    expect(new Set(words).size).toBe(words.length);
  });

  it("gives every opener a non-empty note", () => {
    for (const { note } of STARTERS) {
      expect(note.trim()).not.toBe("");
    }
  });
});
