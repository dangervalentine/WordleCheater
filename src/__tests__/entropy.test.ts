import { describe, it, expect } from "vitest";
import { computePattern, computeEntropy } from "../entropy";

// Pattern encoding: color[0]*1 + color[1]*3 + color[2]*9 + color[3]*27 + color[4]*81
// gray=0, yellow=1, green=2

describe("computePattern", () => {
  it("returns 242 (all green) for exact match", () => {
    expect(computePattern("crane", "crane")).toBe(242);
  });

  it("returns 0 (all gray) for no letter overlap", () => {
    expect(computePattern("plumb", "sandy")).toBe(0);
  });

  it("marks greens at correct positions", () => {
    // guess: crane, answer: crate
    // c=green(2), r=green(2), a=green(2), n→gray(0), e=green(2)
    // 2 + 6 + 18 + 0 + 162 = 188
    expect(computePattern("crane", "crate")).toBe(188);
  });

  it("marks yellows for correct letter wrong position", () => {
    // guess: crane, answer: nacre
    // c: answer has c at pos 2, not 0 → yellow(1)
    // r: answer has r at pos 3, not 1 → yellow(1)
    // a: answer has a at pos 1, not 2 → yellow(1)
    // n: answer has n at pos 0, not 3 → yellow(1)
    // e: answer has e at pos 4 = pos 4 → green(2)
    // 1 + 3 + 9 + 27 + 162 = 202
    expect(computePattern("crane", "nacre")).toBe(202);
  });

  it("handles duplicate letters: one green, one gray", () => {
    // guess: hello, answer: heist
    // h(0)=green(2), e(1)=green(2), l(2)=gray(0), l(3)=gray(0), o(4)=gray(0)
    // 2 + 6 + 0 + 0 + 0 = 8
    expect(computePattern("hello", "heist")).toBe(8);
  });

  it("handles duplicate letters: limits yellows to available count", () => {
    // guess: speed, answer: abide
    // s(0)=gray, p(1)=gray, e(2)=yellow (e count=1→0), e(3)=gray (e count=0), d(4)=yellow (d count=1→0)
    // 0 + 0 + 9 + 0 + 81 = 90
    expect(computePattern("speed", "abide")).toBe(90);
  });

  it("handles duplicate letters: green consumes before yellow", () => {
    // guess: steel, answer: steal
    // s(0)=green(2), t(1)=green(2), e(2)=green(2), e(3)=gray(0), l(4)=green(2)
    // 2 + 6 + 18 + 0 + 162 = 188
    expect(computePattern("steel", "steal")).toBe(188);
  });
});

describe("computeEntropy", () => {
  it("returns 0 for a single candidate", () => {
    expect(computeEntropy("crane", ["crane"])).toBe(0);
  });

  it("returns log2(n) when every candidate produces a unique pattern", () => {
    const words = ["abcde", "fghij"];
    const e = computeEntropy("abcde", words);
    // Two buckets of size 1 → H = 1.0
    expect(e).toBeCloseTo(1.0);
  });

  it("returns 0 when all candidates produce the same pattern", () => {
    const words = ["fghij", "fghik", "fghil"];
    const e = computeEntropy("abcde", words);
    // All produce all-gray → one bucket → H = 0
    expect(e).toBe(0);
  });

  it("higher entropy for a guess that splits candidates more evenly", () => {
    const candidates = ["aback", "abash", "abate", "abbey", "abbot"];
    const eBad = computeEntropy("aback", candidates);
    const eGood = computeEntropy("light", candidates);
    expect(eGood).toBeGreaterThan(eBad);
  });
});
