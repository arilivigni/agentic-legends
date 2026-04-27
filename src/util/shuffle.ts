import type { QuizQuestion } from "../data/quizzes";

/**
 * Fisher–Yates in-place shuffle of an index array.
 * Accepts an optional RNG so tests can pass a deterministic source.
 */
export function shuffleIndices(n: number, rng: () => number = Math.random): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/**
 * Returns a copy of the quiz question with its options shuffled.
 * `correctIndex` is remapped so it still points to the same answer text.
 */
export function shuffleQuestion(q: QuizQuestion, rng: () => number = Math.random): QuizQuestion {
  const order = shuffleIndices(q.options.length, rng);
  const options = order.map((i) => q.options[i]);
  const correctIndex = order.indexOf(q.correctIndex);
  return { ...q, options, correctIndex };
}
