import { describe, it, expect } from "vitest";
import { findResults } from "../helper";
import type { Constraints } from "../types";

function emptyConstraints(): Constraints {
  return {
    green: [null, null, null, null, null],
    yellow: new Set(),
    yellowPositions: new Map(),
    gray: new Set(),
  };
}

describe("findResults", () => {
  it("returns empty array when no constraints are set", () => {
    const result = findResults(emptyConstraints());
    expect(result).toEqual([]);
  });

  it("filters by green letters in correct positions", () => {
    const constraints = emptyConstraints();
    constraints.green = ["c", null, null, null, null];
    const result = findResults(constraints);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((w) => w[0] === "c")).toBe(true);
  });

  it("excludes gray letters", () => {
    const constraints = emptyConstraints();
    constraints.green = ["c", null, null, null, null];
    constraints.gray = new Set(["r", "a", "n", "e"]);
    const result = findResults(constraints);
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every(
        (w) => !w.includes("r") && !w.includes("a") && !w.includes("n") && !w.includes("e")
      )
    ).toBe(true);
  });

  it("requires yellow letters to be present", () => {
    const constraints = emptyConstraints();
    constraints.yellow = new Set(["r"]);
    constraints.yellowPositions = new Map([["r", new Set([1])]]);
    const result = findResults(constraints);
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((w) => w.includes("r"))).toBe(true);
  });

  it("excludes yellow letters from their marked positions", () => {
    const constraints = emptyConstraints();
    constraints.yellow = new Set(["r"]);
    constraints.yellowPositions = new Map([["r", new Set([0])]]);
    const result = findResults(constraints);
    expect(result.every((w) => w[0] !== "r")).toBe(true);
  });

  it("handles combined constraints", () => {
    const constraints = emptyConstraints();
    constraints.green = ["c", null, null, null, null];
    constraints.yellow = new Set(["u"]);
    constraints.yellowPositions = new Map([["u", new Set([1])]]);
    constraints.gray = new Set(["r", "a", "n", "e"]);
    const result = findResults(constraints);
    expect(result.length).toBeGreaterThan(0);
    expect(
      result.every(
        (w) =>
          w[0] === "c" &&
          w.includes("u") &&
          w[1] !== "u" &&
          !w.includes("r") &&
          !w.includes("a") &&
          !w.includes("n") &&
          !w.includes("e")
      )
    ).toBe(true);
  });

  it("does not exclude gray letters that also appear as green", () => {
    const constraints = emptyConstraints();
    constraints.green = ["s", null, null, null, "s"];
    constraints.gray = new Set(["s"]);
    const result = findResults(constraints);
    expect(result.every((w) => w[0] === "s" && w[4] === "s")).toBe(true);
  });
});
