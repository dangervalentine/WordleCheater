import type { RowState, TileColor } from "../types";
import GuessRow from "./GuessRow";

interface GuessGridProps {
  rows: RowState[];
  onRowsChange: (rows: RowState[]) => void;
}

const MAX_ROWS = 6;

function createEmptyRow(): RowState {
  return {
    letters: ["", "", "", "", ""],
    colors: ["unset", "unset", "unset", "unset", "unset"],
    mode: "input",
  };
}

export default function GuessGrid({ rows, onRowsChange }: GuessGridProps) {
  const handleLettersComplete = (rowIndex: number, letters: string[]) => {
    const newRows = rows.map((r, i) =>
      i === rowIndex ? { ...r, letters } : r
    );

    const allFilled = letters.every((l) => l !== "");

    if (allFilled && rows[rowIndex].mode === "input") {
      // Inherit colors from previous guesses for matching letter+position
      const inheritedColors: TileColor[] = ["unset", "unset", "unset", "unset", "unset"];
      const previousColorRows = newRows.filter((r, i) => i < rowIndex && r.mode === "color");
      for (let pos = 0; pos < 5; pos++) {
        const letter = letters[pos]?.toLowerCase();
        if (!letter) continue;
        for (let ri = previousColorRows.length - 1; ri >= 0; ri--) {
          const prev = previousColorRows[ri];
          if (prev.letters[pos]?.toLowerCase() === letter && prev.colors[pos] !== "unset") {
            inheritedColors[pos] = prev.colors[pos];
            break;
          }
        }
      }

      // Transition to color mode with inherited colors
      newRows[rowIndex] = { ...newRows[rowIndex], mode: "color", colors: inheritedColors };

      // Only add new input row if all colors are already set (e.g. fully inherited)
      // but NOT if all colors are green (puzzle solved)
      const allColorsSet = inheritedColors.every((c) => c !== "unset");
      const allGreen = inheritedColors.every((c) => c === "green");
      if (allColorsSet && !allGreen && newRows.length < MAX_ROWS) {
        newRows.push(createEmptyRow());
      }
    }

    onRowsChange(newRows);
  };

  const handleColorChange = (
    rowIndex: number,
    tileIndex: number,
    color: TileColor
  ) => {
    const newRows = rows.map((r, i) => {
      if (i !== rowIndex) return r;
      const newColors = [...r.colors];
      newColors[tileIndex] = color;
      return { ...r, colors: newColors };
    });

    // Add new input row once all colors in this row are assigned
    // but NOT if all colors are green (puzzle solved)
    const updatedRow = newRows[rowIndex];
    const allSet = updatedRow.colors.every((c) => c !== "unset");
    const allGreen = updatedRow.colors.every((c) => c === "green");
    const hasInputRow = newRows.some((r) => r.mode === "input");
    if (allSet && !allGreen && !hasInputRow && newRows.length < MAX_ROWS) {
      newRows.push(createEmptyRow());
    }

    onRowsChange(newRows);
  };

  const handleDeleteRow = (rowIndex: number) => {
    const newRows = rows.filter((_, i) => i !== rowIndex);

    // Ensure there's always an input row at the bottom
    const hasInputRow = newRows.some((r) => r.mode === "input");
    if (!hasInputRow && newRows.length < MAX_ROWS) {
      newRows.push(createEmptyRow());
    }

    // If all rows were deleted, start fresh
    if (newRows.length === 0) {
      newRows.push(createEmptyRow());
    }

    onRowsChange(newRows);
  };

  // For each color-mode row, determine which tiles allow gray.
  // A letter allows gray unless it was ONLY yellow (never green) in previous rows.
  const computeAllowGray = (rowIndex: number, row: RowState): boolean[] => {
    if (row.mode !== "color") return [true, true, true, true, true];
    const prevColorRows = rows.filter((r, i) => i < rowIndex && r.mode === "color");
    return row.letters.map((letter) => {
      const l = letter.toLowerCase();
      let seenYellow = false;
      let seenGreen = false;
      for (const prev of prevColorRows) {
        for (let p = 0; p < 5; p++) {
          if (prev.letters[p]?.toLowerCase() !== l) continue;
          if (prev.colors[p] === "green") seenGreen = true;
          if (prev.colors[p] === "yellow") seenYellow = true;
        }
      }
      // Only restrict if letter was yellow but never green
      if (seenYellow && !seenGreen) return false;
      return true;
    });
  };

  return (
    <div className="guess-grid">
      {rows.map((row, i) => (
        <GuessRow
          key={i}
          row={row}
          allowGray={computeAllowGray(i, row)}
          autoFocus={row.mode === "input"}
          onLettersComplete={(letters) => handleLettersComplete(i, letters)}
          onColorChange={(tileIdx, color) =>
            handleColorChange(i, tileIdx, color)
          }
          onDelete={() => handleDeleteRow(i)}
        />
      ))}
      <div className="grid-hint">
        Type a word, then click tiles to set color
      </div>
    </div>
  );
}

export { createEmptyRow };
