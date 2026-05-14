import type { Constraints } from "../types";
import { theme } from "../theme";

interface ConstraintSummaryProps {
  constraints: Constraints;
}

export default function ConstraintSummary({
  constraints,
}: ConstraintSummaryProps) {
  const { green, yellow, gray } = constraints;

  const hasGreen = green.some((g) => g !== null);
  const hasYellow = yellow.size > 0;
  const hasGray = gray.size > 0;

  if (!hasGreen && !hasYellow && !hasGray) {
    return null;
  }

  return (
    <div className="constraint-summary">
      <div className="constraint-label">CONSTRAINTS</div>
      <div className="constraint-sections">
        {hasGreen && (
          <div className="constraint-section">
            <div
              className="constraint-section-label"
              style={{ color: theme.tile.green }}
            >
              CORRECT
            </div>
            <div className="constraint-green-slots">
              {green.map((letter, i) => (
                <span
                  key={i}
                  className={`green-slot ${letter ? "filled" : "empty"}`}
                  style={
                    letter
                      ? {
                          backgroundColor: theme.tile.green,
                          color: theme.tile.darkText,
                        }
                      : {}
                  }
                >
                  {letter ?? ""}
                </span>
              ))}
            </div>
          </div>
        )}

        {hasYellow && (
          <div className="constraint-section">
            <div
              className="constraint-section-label"
              style={{ color: theme.tile.yellow }}
            >
              PRESENT
            </div>
            <div className="constraint-chips">
              {[...yellow].sort().map((letter) => (
                <span key={letter} className="chip yellow-chip">
                  {letter}
                </span>
              ))}
            </div>
          </div>
        )}

        {hasGray && (
          <div className="constraint-section">
            <div
              className="constraint-section-label"
              style={{ color: theme.tile.grayText }}
            >
              EXCLUDED
            </div>
            <div className="constraint-chips">
              {[...gray].sort().map((letter) => (
                <span key={letter} className="chip gray-chip">
                  {letter}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
