import dict from "./dictionary.json";
import type { Constraints } from "./types";

export function findResults(constraints: Constraints): string[] {
  const { green, yellow, yellowPositions, gray } = constraints;

  const hasConstraints =
    green.some((g) => g !== null) || yellow.size > 0 || gray.size > 0;

  if (!hasConstraints) {
    return [];
  }

  // Letters that are green should not be excluded by gray
  const greenLetters = new Set(green.filter((g): g is string => g !== null));

  return (dict as string[]).filter((word) => {
    // Check green: letter must match at each green position
    for (let i = 0; i < 5; i++) {
      if (green[i] !== null && word[i] !== green[i]) {
        return false;
      }
    }

    // Check gray: word must not contain gray letters
    // (unless the letter also appears as green in a specific position)
    for (const letter of gray) {
      if (greenLetters.has(letter)) {
        // Letter is green somewhere — only exclude from non-green positions
        for (let i = 0; i < 5; i++) {
          if (green[i] !== letter && word[i] === letter) {
            return false;
          }
        }
      } else if (word.includes(letter)) {
        return false;
      }
    }

    // Check yellow: word must contain each yellow letter
    // but NOT at the excluded positions
    for (const letter of yellow) {
      if (!word.includes(letter)) {
        return false;
      }
      const excluded = yellowPositions.get(letter);
      if (excluded) {
        for (const pos of excluded) {
          if (word[pos] === letter) {
            return false;
          }
        }
      }
    }

    return true;
  });
}
