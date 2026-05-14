import { useState, useMemo } from "react";
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
          <Results results={results} />
        </div>
      </main>
      <GithubAttribution />
    </div>
  );
}
