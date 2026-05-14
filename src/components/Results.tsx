import { useState } from "react";
import { theme } from "../theme";

interface ResultsProps {
  results: string[];
}

const INITIAL_DISPLAY = 50;

export default function Results({ results }: ResultsProps) {
  const [showAll, setShowAll] = useState(false);

  if (results.length === 0) {
    return (
      <div className="results-panel">
        <div className="results-empty">
          Enter a guess to see possible words
        </div>
      </div>
    );
  }

  const displayedResults = showAll
    ? results
    : results.slice(0, INITIAL_DISPLAY);
  const remaining = results.length - INITIAL_DISPLAY;

  const isSingleResult = results.length === 1;

  return (
    <div className="results-panel">
      <div className="results-header">
        <span style={{ color: theme.accent.cyan }}>
          {results.length} possible word{results.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="results-chips">
        {displayedResults.map((word) => (
          <span
            key={word}
            className={`result-chip ${isSingleResult ? "single-result" : ""}`}
          >
            {word}
          </span>
        ))}
      </div>
      {!showAll && remaining > 0 && (
        <button className="show-more" onClick={() => setShowAll(true)}>
          + {remaining} more
        </button>
      )}
    </div>
  );
}
