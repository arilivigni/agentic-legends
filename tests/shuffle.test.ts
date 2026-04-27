import { describe, it, expect } from "vitest";
import { shuffleIndices, shuffleQuestion } from "../src/util/shuffle";
import { QUIZZES } from "../src/data/quizzes";

function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

describe("shuffleIndices", () => {
  it("returns a permutation of 0..n-1", () => {
    const out = shuffleIndices(5, seeded(42));
    expect(out.slice().sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4]);
  });

  it("handles n=1 and n=0", () => {
    expect(shuffleIndices(1, seeded(1))).toEqual([0]);
    expect(shuffleIndices(0, seeded(1))).toEqual([]);
  });
});

describe("shuffleQuestion", () => {
  it("preserves the correct answer text after shuffling", () => {
    for (const q of Object.values(QUIZZES)) {
      const original = q.options[q.correctIndex];
      for (let seed = 1; seed <= 8; seed++) {
        const shuffled = shuffleQuestion(q, seeded(seed));
        expect(shuffled.options.length).toBe(q.options.length);
        expect(new Set(shuffled.options)).toEqual(new Set(q.options));
        expect(shuffled.options[shuffled.correctIndex]).toBe(original);
      }
    }
  });

  it("does not mutate the original question", () => {
    const q = QUIZZES.LevelMona;
    const before = q.options.slice();
    const beforeIdx = q.correctIndex;
    shuffleQuestion(q, seeded(7));
    expect(q.options).toEqual(before);
    expect(q.correctIndex).toBe(beforeIdx);
  });

  it("keeps prompt and feedback strings intact", () => {
    const q = QUIZZES.LevelDucky;
    const out = shuffleQuestion(q, seeded(3));
    expect(out.prompt).toBe(q.prompt);
    expect(out.successMessage).toBe(q.successMessage);
    expect(out.failureMessage).toBe(q.failureMessage);
  });

  it("can produce different orderings across seeds", () => {
    const q = QUIZZES.LevelDucky;
    const seen = new Set<string>();
    for (let seed = 1; seed <= 16; seed++) {
      seen.add(shuffleQuestion(q, seeded(seed)).options.join("|"));
    }
    expect(seen.size).toBeGreaterThan(1);
  });
});
