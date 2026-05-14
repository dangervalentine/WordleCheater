import { describe, it, expect } from "vitest";
import { deriveConstraints } from "../constraints";
import type { RowState } from "../types";

function makeRow(
  letters: string,
  colors: string,
  mode: "input" | "color" = "color"
): RowState {
  return {
    letters: letters.split(""),
    colors: colors.split(",") as RowState["colors"],
    mode,
  };
}

describe("deriveConstraints", () => {
  it("returns empty constraints when no rows", () => {
    const result = deriveConstraints([]);
    expect(result.green).toEqual([null, null, null, null, null]);
    expect(result.yellow.size).toBe(0);
    expect(result.gray.size).toBe(0);
  });

  it("ignores rows in input mode", () => {
    const rows = [makeRow("crane", "green,gray,gray,gray,gray", "input")];
    const result = deriveConstraints(rows);
    expect(result.green).toEqual([null, null, null, null, null]);
  });

  it("ignores unset tiles", () => {
    const rows = [makeRow("crane", "unset,unset,unset,unset,unset")];
    const result = deriveConstraints(rows);
    expect(result.green).toEqual([null, null, null, null, null]);
    expect(result.gray.size).toBe(0);
  });

  it("extracts green letters into correct positions", () => {
    const rows = [makeRow("crane", "green,unset,unset,unset,green")];
    const result = deriveConstraints(rows);
    expect(result.green).toEqual(["c", null, null, null, "e"]);
  });

  it("extracts yellow letters and their excluded positions", () => {
    const rows = [makeRow("crane", "unset,yellow,unset,unset,yellow")];
    const result = deriveConstraints(rows);
    expect(result.yellow).toEqual(new Set(["r", "e"]));
    expect(result.yellowPositions.get("r")).toEqual(new Set([1]));
    expect(result.yellowPositions.get("e")).toEqual(new Set([4]));
  });

  it("extracts gray letters", () => {
    const rows = [makeRow("crane", "unset,unset,gray,gray,unset")];
    const result = deriveConstraints(rows);
    expect(result.gray).toEqual(new Set(["a", "n"]));
  });

  it("aggregates across multiple rows", () => {
    const rows = [
      makeRow("crane", "green,yellow,gray,gray,yellow"),
      makeRow("clump", "green,gray,green,unset,unset"),
    ];
    const result = deriveConstraints(rows);
    expect(result.green).toEqual(["c", null, "u", null, null]);
    expect(result.yellow).toEqual(new Set(["r", "e"]));
    expect(result.gray).toEqual(new Set(["a", "n", "l"]));
  });

  it("deduplicates yellow and gray letters across rows", () => {
    const rows = [
      makeRow("crane", "unset,yellow,gray,unset,unset"),
      makeRow("crate", "unset,yellow,gray,unset,unset"),
    ];
    const result = deriveConstraints(rows);
    expect(result.yellow).toEqual(new Set(["r"]));
    expect(result.gray).toEqual(new Set(["a"]));
  });

  it("tracks multiple excluded positions for yellow letters", () => {
    const rows = [
      makeRow("crane", "unset,yellow,unset,unset,unset"),
      makeRow("stork", "unset,unset,unset,yellow,unset"),
    ];
    const result = deriveConstraints(rows);
    expect(result.yellowPositions.get("r")).toEqual(new Set([1, 3]));
  });
});
