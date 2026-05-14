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

  const matches = (dict as string[]).filter((word) => {
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

  return rankByLikelihood(matches);
}

function rankByLikelihood(words: string[]): string[] {
  if (words.length <= 1) return words;

  // Build positional letter frequencies from the candidate set
  const posFreq: Map<string, number>[] = Array.from({ length: 5 }, () => new Map());
  for (const word of words) {
    for (let i = 0; i < 5; i++) {
      const key = word[i];
      posFreq[i].set(key, (posFreq[i].get(key) ?? 0) + 1);
    }
  }

  // Normalize frequencies to [0, 1] by dividing by candidate count
  const total = words.length;

  // Score each word
  const scores = new Map<string, number>();
  for (const word of words) {
    let score = 0;

    // Positional frequency: how common is each letter at its position?
    for (let i = 0; i < 5; i++) {
      score += (posFreq[i].get(word[i]) ?? 0) / total;
    }

    // Unique letter bonus: reward distinct letters (max +1 for all unique)
    const unique = new Set(word).size;
    score += unique / 5;

    scores.set(word, score);
  }

  return words.sort((a, b) => scores.get(b)! - scores.get(a)!);
}
