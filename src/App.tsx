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
        <h1 className="app-title">WORDLE HELPER</h1>
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
