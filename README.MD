<p align="center">
  <img src="./public/favicon.svg" width="80" alt="Wordle Helper" />
</p>

<h1 align="center">Wordle Helper</h1>

<p align="center">
  <strong>An entropy-ranked solver that narrows down Wordle answers in real time and tells you which guesses eliminate the most possibilities.</strong>
</p>

<p align="center">
  <a href="https://dangervalentine.github.io/WordleCheater/">Live Demo</a>
</p>

<p align="center">
  <a href="https://dangervalentine.github.io/WordleCheater/">
    <img src="./wordle-helper.png" width="640" alt="Wordle Helper screenshot" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/react-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/vite-6-646CFF?logo=vite&logoColor=white" alt="Vite 6" />
  <img src="https://img.shields.io/badge/typescript-6-3178C6?logo=typescript&logoColor=white" alt="TypeScript 6" />
  <img src="https://img.shields.io/badge/vitest-4-6E9F18?logo=vitest&logoColor=white" alt="Vitest 4" />
  <img src="https://img.shields.io/github/deployments/dangervalentine/WordleCheater/github-pages?label=deploy&color=C3E88D" alt="Deploy" />
</p>

---

Type a five-letter word, then click each tile to cycle through green, yellow, and gray to match your Wordle feedback. The solver immediately filters a built-in dictionary down to only the words that fit, and after your first guess it starts ranking them by how much information each one would give you.

## Features

**Multi-row guesses** &mdash; Add up to six guess rows, just like the real game. Each row locks into color-picking mode once all five letters are entered.

**Tile color cycling** &mdash; Click a filled tile to cycle through green (correct position), yellow (wrong position), and gray (absent). Colors are applied instantly and constraints recalculate on every change.

**Smart color inheritance** &mdash; When you type a new guess, tiles automatically inherit colors from previous rows when a letter appears in the same position, saving you clicks.

**Entropy-ranked suggestions** &mdash; After your first guess, remaining words are ranked by how useful they'd be as your next guess. The best words to try float to the top. See [How the ranking works](#how-the-ranking-works) below.

**Live constraint summary** &mdash; A panel below the grid shows confirmed (green) positions, present-but-misplaced (yellow) letters, and excluded (gray) letters at a glance.

**Victory detection** &mdash; When you mark all five tiles green, the app celebrates your win and shows how many guesses it took.

**Reset** &mdash; One click clears all rows and starts fresh.

## How It Works

The solver has two layers: **filtering** and **ranking**.

**Filtering** happens every time you change a tile color. It looks at all your guesses and throws out any word from the dictionary that doesn't fit the clues. Green letters must be in exactly that spot. Yellow letters must be in the word but *not* in the spot you marked. Gray letters can't appear at all (unless they're also green somewhere else, like a double-letter situation).

**Ranking** kicks in after your first guess, once all tile colors are set. Instead of showing the remaining words in a random order, it scores each one and puts the most useful guesses at the top. This is where the entropy algorithm comes in.

## How the Ranking Works

Imagine you have 100 words left and you're trying to pick your next guess. Some guesses are better than others &mdash; not because they're more likely to be the answer, but because they'll narrow things down the most no matter what the answer turns out to be.

Here's the idea: for any word you might guess, the app simulates what would happen if you guessed it against every remaining possibility. Each possible answer would give you a different pattern of greens, yellows, and grays. Some guesses would produce lots of different patterns (meaning you'd learn a lot), while others would produce mostly the same pattern over and over (meaning you wouldn't learn much).

The best guess is one that splits the remaining words into as many small, evenly-sized groups as possible. If your guess would divide 100 words into 50 groups of 2, that's great &mdash; no matter what colors you get back, you've cut your options way down. If it divides them into 1 group of 95 and a few stragglers, that's a bad guess &mdash; you'll probably learn almost nothing.

The app turns this into a single score for each word. Higher score = more useful guess. The scoring math is borrowed from information theory, but the intuition is simple: **pick the guess that leaves you with the fewest remaining possibilities on average, regardless of what the answer is.**

Because this involves checking every candidate against every other candidate, it can be computationally heavy. The app runs this in a background thread so the UI stays responsive, and results stream in as they're calculated &mdash; you'll see words shuffling into their ranked positions in real time.

## Quick Start

```bash
npm install
npm run dev        # dev server at http://localhost:5173/WordleCheater/
npm run build      # type-check + production bundle in ./dist
npm test           # run unit tests
```

## License

MIT
