interface Starter {
  word: string;
  note: string;
}

// Well-known openers. Each note names something the others don't — ADIEU and
// AUDIO both hold four vowels, so AUDIO's note points at the real difference
// rather than repeating the count.
export const STARTERS: Starter[] = [
  { word: "slate", note: "common letters" },
  { word: "crane", note: "entropy favorite" },
  { word: "raise", note: "top ranked" },
  { word: "adieu", note: "the classic" },
  { word: "audio", note: "4 vowels, no E" },
];

interface StarterWordsProps {
  onPick: (word: string) => void;
}

export default function StarterWords({ onPick }: StarterWordsProps) {
  return (
    <div className="starter-panel">
      <p className="starter-lead">
        Not sure where to start? A strong opener knocks out the most letters at
        once.
      </p>
      <span className="starter-label">TRY</span>
      <div className="starter-chips">
        {STARTERS.map(({ word, note }) => (
          <button
            key={word}
            type="button"
            className="starter-chip"
            onClick={() => onPick(word)}
          >
            <span className="starter-word">{word}</span>
            <span className="starter-note">{note}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
