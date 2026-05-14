import { useState, useRef, useLayoutEffect } from "react";
import { theme } from "../theme";

interface ResultsProps {
    results: string[];
    isComputing: boolean;
    stable: boolean;
}

const INITIAL_DISPLAY = 50;

export default function Results({
    results,
    isComputing,
    stable,
}: ResultsProps) {
    const [showAll, setShowAll] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const prevPositions = useRef<Map<string, DOMRect>>(new Map());
    const prevWordSet = useRef<Set<string>>(new Set());

    const displayedResults = showAll
        ? results
        : results.slice(0, INITIAL_DISPLAY);
    const remaining = results.length - INITIAL_DISPLAY;

    // FLIP animation: only animate when results are stable and the same words are
    // re-sorting (entropy batches). Skip when colors are mid-edit or results change entirely.
    useLayoutEffect(() => {
        if (!stable) {
            prevPositions.current.clear();
            prevWordSet.current.clear();
            return;
        }

        const container = containerRef.current;
        if (!container) return;

        const chips = container.querySelectorAll<HTMLElement>("[data-word]");
        const newPositions = new Map<string, DOMRect>();

        // Check if this is a re-sort (same word set) vs new results
        const currentWords = new Set(displayedResults);
        const prev = prevWordSet.current;
        const isSameSet =
            currentWords.size === prev.size &&
            displayedResults.every((w) => prev.has(w));

        if (isSameSet) {
            const animations: { el: HTMLElement; dx: number; dy: number }[] = [];

            for (const el of chips) {
                const word = el.dataset.word!;
                const newRect = el.getBoundingClientRect();
                newPositions.set(word, newRect);

                const oldRect = prevPositions.current.get(word);
                if (!oldRect) continue;

                const dx = oldRect.left - newRect.left;
                const dy = oldRect.top - newRect.top;
                if (dx === 0 && dy === 0) continue;

                animations.push({ el, dx, dy });
            }

            if (animations.length > 0) {
                // Invert: teleport all chips back to old positions
                for (const { el, dx, dy } of animations) {
                    el.style.transition = "none";
                    el.style.transform = `translate(${dx}px, ${dy}px)`;
                }

                // Force reflow so browser registers the inverted state
                void container.offsetHeight;

                // Play: animate all chips to their new positions
                for (const { el } of animations) {
                    el.style.transition = "transform 350ms ease-out";
                    el.style.transform = "";
                }
            }
        } else {
            // New result set — just snapshot positions, no animation
            for (const el of chips) {
                newPositions.set(el.dataset.word!, el.getBoundingClientRect());
            }
        }

        prevPositions.current = newPositions;
        prevWordSet.current = currentWords;
    }, [displayedResults, stable]);

    if (results.length === 0) {
        return (
            <div className="results-panel">
                <div className="results-empty">
                    Enter a guess to see possible words
                </div>
            </div>
        );
    }

    const isSingleResult = results.length === 1;

    return (
        <div className="results-panel">
            <div className="results-header">
                <span style={{ color: theme.accent.pink }}>
                    {results.length} possible word{results.length !== 1 ? "s" : ""}
                </span>
                {isComputing && <span className="computing-spinner" />}
            </div>
            <div className="results-chips" ref={containerRef}>
                {displayedResults.map((word) => (
                    <span
                        key={word}
                        data-word={word}
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
