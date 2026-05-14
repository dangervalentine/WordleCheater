import { useRef, useEffect } from "react";
import type { RowState, TileColor } from "../types";
import { theme } from "../theme";

interface GuessRowProps {
  row: RowState;
  autoFocus: boolean;
  onLettersComplete: (letters: string[]) => void;
  onColorChange: (index: number, color: TileColor) => void;
  onDelete: () => void;
}

const COLOR_CYCLE: TileColor[] = ["unset", "gray", "yellow", "green"];

function nextColor(current: TileColor): TileColor {
  const idx = COLOR_CYCLE.indexOf(current);
  return COLOR_CYCLE[(idx + 1) % COLOR_CYCLE.length];
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
        border: `2px dashed ${theme.tile.unsetBorder}`,
      };
  }
}

export default function GuessRow({
  row,
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

  if (row.mode === "input") {
    const writeLetters = (letters: string[]) => onLettersComplete(letters);

    const deletePrevious = (index: number) => {
      if (index <= 0) return;
      const newLetters = [...row.letters];
      newLetters[index - 1] = "";
      writeLetters(newLetters);
      inputRefs.current[index - 1]?.focus();
    };

    const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      // Native deletion (selecting + delete, or backspace when cell has a letter)
      if (raw === "") {
        const newLetters = [...row.letters];
        newLetters[index] = "";
        writeLetters(newLetters);
        return;
      }

      // Pull out only letter characters; take the most recently typed one. This
      // handles select-on-focus replacements, autosuggest insertions, and the
      // case where maxLength briefly allows two chars before truncation.
      const letters = raw.match(/[a-zA-Z]/g);
      if (!letters) return;
      const newChar = letters[letters.length - 1].toLowerCase();

      const newLetters = [...row.letters];
      newLetters[index] = newChar;
      writeLetters(newLetters);

      const allFilled = newLetters.every((l) => l !== "");
      if (!allFilled && index < 4) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    // Desktop fallback: when the cell is already empty, Backspace would do
    // nothing native, so we manually move focus and clear the previous cell.
    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && row.letters[index] === "") {
        e.preventDefault();
        deletePrevious(index);
      }
    };

    // Mobile fallback: Android soft keyboards often fire keydown with
    // key="Unidentified" but always set the correct inputType here.
    const handleBeforeInput = (
      index: number,
      e: React.FormEvent<HTMLInputElement>
    ) => {
      const inputType = (e.nativeEvent as InputEvent).inputType;
      if (inputType === "deleteContentBackward" && row.letters[index] === "") {
        e.preventDefault();
        deletePrevious(index);
      }
    };

    return (
      <div className="guess-row">
        {row.letters.map((letter, i) => {
          const isFilled = letter !== "";
          const borderColor = isFilled ? theme.input.filled : theme.input.empty;
          return (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              className="tile-input"
              type="text"
              inputMode="text"
              enterKeyHint="next"
              maxLength={1}
              value={letter}
              onChange={(e) => handleChange(i, e)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onBeforeInput={(e) => handleBeforeInput(i, e)}
              onFocus={(e) => e.currentTarget.select()}
              autoCapitalize="none"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
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
          className="tile-button"
          style={tileStyle(row.colors[i])}
          onClick={() => onColorChange(i, nextColor(row.colors[i]))}
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
