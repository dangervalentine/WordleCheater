import { useState, useMemo, useEffect, useRef } from "react";
import type { RowState } from "./types";
import { deriveConstraints } from "./constraints";
import { findResults } from "./helper";
import GuessGrid, { createEmptyRow } from "./components/GuessGrid";
import ConstraintSummary from "./components/ConstraintSummary";
import Results from "./components/Results";
import StarterWords from "./components/StarterWords";
import { GithubAttribution } from "./components/GithubAttribution";
import Header from "./components/Header";
import "./App.css";

export default function App() {
  const [rows, setRows] = useState<RowState[]>([createEmptyRow()]);

  const constraints = useMemo(() => deriveConstraints(rows), [rows]);
  const results = useMemo(() => findResults(constraints), [constraints]);

  const [entropyScores, setEntropyScores] = useState<Map<string, number>>(
    new Map()
  );
  const [isComputing, setIsComputing] = useState(false);

  const colorRows = rows.filter((r) => r.mode === "color");
  const completedGuesses = colorRows.length;
  const useEntropy = completedGuesses >= 1;

  const solved = colorRows.some((r) => r.colors.every((c) => c === "green"));

  // Only update displayed results when all color-mode rows are fully set (no "unset" tiles).
  // Avoids shuffling words on every individual tile color click.
  const allColorsSet = colorRows.every((r) =>
    r.colors.every((c) => c !== "unset")
  );

  const stableResultsRef = useRef<string[]>([]);
  if (allColorsSet) {
    stableResultsRef.current = results;
  }
  const stableResults = stableResultsRef.current;

  // Entropy worker lifecycle — automatically runs when conditions are met
  useEffect(() => {
    if (!useEntropy || stableResults.length <= 1 || !allColorsSet) {
      setEntropyScores(new Map());
      setIsComputing(false);
      return;
    }

    setEntropyScores(new Map());
    setIsComputing(true);

    const worker = new Worker(
      new URL("./entropy-worker.ts", import.meta.url),
      { type: "module" }
    );

    worker.onmessage = (e: MessageEvent) => {
      if (e.data.type === "batch") {
        setEntropyScores((prev) => {
          const next = new Map(prev);
          for (const [word, score] of e.data.scores as [string, number][]) {
            next.set(word, score);
          }
          return next;
        });
      } else if (e.data.type === "done") {
        setIsComputing(false);
      }
    };

    worker.postMessage({ type: "compute", words: stableResults });

    return () => worker.terminate();
  }, [useEntropy, stableResults, allColorsSet]);

  // Sort results: entropy-scored words first (desc), then frequency-ranked remainder
  const sortedResults = useMemo(() => {
    if (entropyScores.size === 0) {
      return stableResults;
    }
    return [...stableResults].sort((a, b) => {
      const scoreA = entropyScores.get(a);
      const scoreB = entropyScores.get(b);
      if (scoreA !== undefined && scoreB !== undefined) return scoreB - scoreA;
      if (scoreA !== undefined) return -1;
      if (scoreB !== undefined) return 1;
      return 0;
    });
  }, [stableResults, entropyScores]);

  const handleReset = () => {
    setRows([createEmptyRow()]);
  };

  // True only before any guess is committed: on load, after RESET, and after
  // every row has been deleted. Deliberately not keyed off results — between
  // entering a guess and coloring it, constraints are empty and results are
  // too, which would make the starters reappear mid-solve.
  const showStarters = rows.length === 1 && rows[0].mode === "input";

  const handleStarterPick = (word: string) => {
    setRows([
      {
        letters: word.split(""),
        colors: ["unset", "unset", "unset", "unset", "unset"],
        mode: "color",
      },
    ]);
  };

  return (
    <div className="app">
      <Header />

      <main className="app-main">
        <div className="left-column">
          <GuessGrid rows={rows} onRowsChange={setRows} />
          <ConstraintSummary constraints={constraints} />
          <button className="reset-button" onClick={handleReset}>
            RESET
          </button>
        </div>
        <div className="right-column">
          {solved ? (
            <div className="victory-panel">
              <div className="victory-confetti" aria-hidden="true">
                {Array.from({ length: 40 }, (_, i) => (
                  <span
                    key={i}
                    className="confetti-piece"
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${2 + Math.random() * 2}s`,
                      backgroundColor: ["#C3E88D", "#FFCB6B", "#7fdbca", "#82AAFF", "#F07178"][i % 5],
                    }}
                  />
                ))}
              </div>
              <div className="victory-content">
                <div className="victory-icon">&#10003;</div>
                <h2 className="victory-title">YOU GOT IT!</h2>
                <p className="victory-subtitle">
                  Solved in {completedGuesses} guess{completedGuesses !== 1 ? "es" : ""}
                </p>
              </div>
            </div>
          ) : showStarters ? (
            <StarterWords onPick={handleStarterPick} />
          ) : (
            <Results
              results={sortedResults}
              isComputing={isComputing}
              stable={allColorsSet}
            />
          )}
        </div>
      </main>
      <GithubAttribution />
    </div>
  );
}
