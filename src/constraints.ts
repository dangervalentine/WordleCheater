import type { RowState, Constraints } from "./types";

export function deriveConstraints(rows: RowState[]): Constraints {
  const green: (string | null)[] = [null, null, null, null, null];
  const yellow = new Set<string>();
  const yellowPositions = new Map<string, Set<number>>();
  const gray = new Set<string>();

  for (const row of rows) {
    if (row.mode !== "color") continue;

    for (let i = 0; i < 5; i++) {
      const letter = row.letters[i]?.toLowerCase();
      const color = row.colors[i];

      if (!letter || color === "unset") continue;

      if (color === "green") {
        green[i] = letter;
      } else if (color === "yellow") {
        yellow.add(letter);
        if (!yellowPositions.has(letter)) {
          yellowPositions.set(letter, new Set());
        }
        yellowPositions.get(letter)!.add(i);
      } else if (color === "gray") {
        gray.add(letter);
      }
    }
  }

  return { green, yellow, yellowPositions, gray };
}
