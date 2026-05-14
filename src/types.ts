export type TileColor = "unset" | "gray" | "yellow" | "green";

export type RowMode = "input" | "color";

export interface RowState {
  letters: string[];
  colors: TileColor[];
  mode: RowMode;
}

export interface Constraints {
  green: (string | null)[];
  yellow: Set<string>;
  yellowPositions: Map<string, Set<number>>;
  gray: Set<string>;
}
