export interface QuizQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  successMessage: string;
  failureMessage: string;
}

export const QUIZZES: Record<string, QuizQuestion> = {
  LevelMona: {
    prompt:
      "GH-600 — Developing in Agentic AI Systems\n\nWhat is the correct number of Domains on the GH-600 certification exam?",
    options: ["4", "6", "8"],
    correctIndex: 1,
    successMessage: "Correct! GH-600 includes 6 domains.",
    failureMessage: "Not quite — the GH-600 exam is organized into 6 domains.",
  },
  LevelDucky: {
    prompt: "What does the acronym SDLC stand for?",
    options: [
      "Secure Deployment Life Cycle",
      "Software Development Life Cycle",
      "System Design Logic Chain",
      "Service Delivery Lifecycle Control",
    ],
    correctIndex: 1,
    successMessage: "Exactly — SDLC stands for Software Development Life Cycle.",
    failureMessage: "Not quite — SDLC means Software Development Life Cycle.",
  },
  LevelCopilot: {
    prompt:
      "Will you have to understand MCP servers for the GH-600 exam,\nDeveloping in Agentic AI Systems?",
    options: ["True", "False"],
    correctIndex: 0,
    successMessage: "Correct — MCP servers are part of what you should understand for GH-600.",
    failureMessage: "Actually MCP servers are in scope for GH-600.",
  },
};
