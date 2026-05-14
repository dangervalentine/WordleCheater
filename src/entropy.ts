/**
 * Compute the Wordle color pattern for a guess against an answer.
 * Returns an integer 0-242 encoding the pattern in base 3.
 * gray=0, yellow=1, green=2; pattern = sum(color[i] * 3^i)
 */
export function computePattern(guess: string, answer: string): number {
  const result = [0, 0, 0, 0, 0];
  const answerCounts = new Map<string, number>();

  // First pass: mark greens, count unmatched answer letters
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) {
      result[i] = 2;
    } else {
      answerCounts.set(answer[i], (answerCounts.get(answer[i]) ?? 0) + 1);
    }
  }

  // Second pass: mark yellows, consuming available letter counts
  for (let i = 0; i < 5; i++) {
    if (result[i] === 2) continue;
    const count = answerCounts.get(guess[i]);
    if (count && count > 0) {
      result[i] = 1;
      answerCounts.set(guess[i], count - 1);
    }
  }

  return result[0] + result[1] * 3 + result[2] * 9 + result[3] * 27 + result[4] * 81;
}

/**
 * Compute the Shannon entropy of a guess word against a set of candidates.
 * Higher entropy = the guess splits candidates into more even groups = more information gained.
 */
export function computeEntropy(guess: string, candidates: string[]): number {
  const buckets = new Map<number, number>();
  for (const answer of candidates) {
    const pattern = computePattern(guess, answer);
    buckets.set(pattern, (buckets.get(pattern) ?? 0) + 1);
  }

  const total = candidates.length;
  let entropy = 0;
  for (const count of buckets.values()) {
    const p = count / total;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}
