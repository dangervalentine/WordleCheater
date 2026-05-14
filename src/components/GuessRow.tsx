import { useState, useRef, useEffect } from "react";
import type { RowState, TileColor } from "../types";
import { theme } from "../theme";

interface GuessRowProps {
  row: RowState;
  allowGray: boolean[];
  autoFocus: boolean;
  onLettersComplete: (letters: string[]) => void;
  onColorChange: (index: number, color: TileColor) => void;
  onDelete: () => void;
}

function nextColor(current: TileColor, allowGray: boolean): TileColor {
  if (current === "unset") return "green";
  if (current === "green") return "yellow";
  if (current === "yellow") return allowGray ? "gray" : "green";
  return "green"; // gray wraps to green, skipping unset
}

function tileStyle(color: TileColor): React.CSSProperties {
  switch (color) {
    case "green":
      return { backgroundColor: theme.tile.green, color: theme.tile.darkText };
    case "yellow":
      return { backgroundColor: theme.tile.yellow, color: theme.tile.darkText };
    case "gray":
      return {
        backgroundColor: theme.tile.gray,
        color: theme.tile.grayText,
        border: `2px solid ${theme.chip.border}`,
      };
    case "unset":
    default:
      return {
        backgroundColor: theme.tile.gray,
        color: theme.text.primary,
        border: `2px solid ${theme.text.primary}`,
      };
  }
}

export default function GuessRow({
  row,
  allowGray,
  autoFocus,
  onLettersComplete,
  onColorChange,
  onDelete,
}: GuessRowProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (row.mode === "input" && autoFocus) {
      const firstEmpty = row.letters.findIndex((l) => l === "");
      const focusIdx = firstEmpty === -1 ? 0 : firstEmpty;
      inputRefs.current[focusIdx]?.focus();
    }
  }, [row.mode, autoFocus]);

  // Local letter state so partial input doesn't propagate to App and trigger result recalcs
  const [localLetters, setLocalLetters] = useState(row.letters);

  // Sync local state if parent resets the row (e.g. app reset)
  useEffect(() => {
    setLocalLetters(row.letters);
  }, [row.letters]);

  if (row.mode === "input") {
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      const key = e.key;

      if (key === "Backspace") {
        e.preventDefault();
        const newLetters = [...localLetters];
        if (newLetters[index] !== "") {
          newLetters[index] = "";
        } else if (index > 0) {
          newLetters[index - 1] = "";
          inputRefs.current[index - 1]?.focus();
        }
        setLocalLetters(newLetters);
        return;
      }

      if (/^[a-zA-Z]$/.test(key)) {
        e.preventDefault();
        const newLetters = [...localLetters];
        newLetters[index] = key.toLowerCase();
        setLocalLetters(newLetters);

        const allFilled = newLetters.every((l) => l !== "");
        if (allFilled) {
          onLettersComplete(newLetters);
        } else if (index < 4) {
          inputRefs.current[index + 1]?.focus();
        }
      }
    };

    return (
      <div className="guess-row">
        {localLetters.map((letter, i) => {
          const isFilled = letter !== "";
          const borderColor = isFilled ? theme.input.filled : theme.input.empty;
          return (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              className="tile-input"
              type="text"
              maxLength={1}
              value={letter}
              readOnly
              onKeyDown={(e) => handleKeyDown(i, e)}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              style={{ borderColor }}
            />
          );
        })}
        <div className="row-spacer" />
      </div>
    );
  }

  // Color mode
  return (
    <div className="guess-row">
      {row.letters.map((letter, i) => (
        <button
          key={i}
          className={`tile-button${row.colors[i] === "unset" ? " unset-color" : ""}`}
          style={tileStyle(row.colors[i])}
          onClick={() => onColorChange(i, nextColor(row.colors[i], allowGray[i]))}
        >
          {letter}
        </button>
      ))}
      <button className="delete-button" onClick={onDelete} title="Delete row">
        ✕
      </button>
    </div>
  );
}
