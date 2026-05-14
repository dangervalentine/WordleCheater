import { useState, useMemo, useEffect, useRef } from "react";
import type { RowState } from "./types";
import { deriveConstraints } from "./constraints";
import { findResults } from "./helper";
import GuessGrid, { createEmptyRow } from "./components/GuessGrid";
import ConstraintSummary from "./components/ConstraintSummary";
import Results from "./components/Results";
import { GithubAttribution } from "./components/GithubAttribution";
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

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          <svg className="title-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="8" fill="#011627"/>
            <rect x="5" y="5" width="16" height="16" rx="2.5" fill="#FFFFFF" stroke="#000" strokeWidth="1.2"/>
            <rect x="24" y="5" width="16" height="16" rx="2.5" fill="#FFFFFF" stroke="#000" strokeWidth="1.2"/>
            <rect x="43" y="5" width="16" height="16" rx="2.5" fill="#C3E88D" stroke="#000" strokeWidth="1.2"/>
            <rect x="5" y="24" width="16" height="16" rx="2.5" fill="#FFFFFF" stroke="#000" strokeWidth="1.2"/>
            <rect x="24" y="24" width="16" height="16" rx="2.5" fill="#FFCB6B" stroke="#000" strokeWidth="1.2"/>
            <rect x="43" y="24" width="16" height="16" rx="2.5" fill="#C3E88D" stroke="#000" strokeWidth="1.2"/>
            <rect x="5" y="43" width="16" height="16" rx="2.5" fill="#C3E88D" stroke="#000" strokeWidth="1.2"/>
            <rect x="24" y="43" width="16" height="16" rx="2.5" fill="#C3E88D" stroke="#000" strokeWidth="1.2"/>
            <rect x="43" y="43" width="16" height="16" rx="2.5" fill="#C3E88D" stroke="#000" strokeWidth="1.2"/>
            <polyline points="16,34 27,46 50,18" stroke="#011627" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="16,34 27,46 50,18" stroke="var(--color-accent-pink)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="title-word">WORDLE</span>{" "}
          <span className="title-accent">HELPER</span>
        </h1>
        <p className="app-subtitle">Type guesses, set colors, find answers</p>
      </header>

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
