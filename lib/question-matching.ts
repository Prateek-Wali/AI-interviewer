// lib/question-matching.ts
// Matches the AI's spoken turn (captured via output audio transcription)
// against the pre-generated QuestionBank, so real bank questions can be told
// apart from quality-gate follow-ups ("How exactly...?", "I need more
// detail..."). Used on both the client (live progress tracking) and the
// server (resume snapshots), so interview progress counts bank questions
// actually completed — not raw answered-row count, which inflates with every
// follow-up and caused premature interview auto-end.

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "for", "with",
  "at", "by", "as", "is", "are", "was", "were", "be", "been", "it", "its",
  "this", "that", "these", "those", "you", "your", "yours", "me", "my", "him",
  "her", "his", "she", "he", "they", "them", "their", "we", "us", "our", "do",
  "did", "does", "how", "what", "when", "where", "why", "which", "who", "can",
  "could", "would", "should", "tell", "about", "if", "so",
]);

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOPWORDS.has(w))
  );
}

// Fraction of a bank question's meaningful tokens that must appear in the
// AI's turn. The AI asks bank questions near-verbatim (often behind a short
// acknowledgment like "I see. Moving on, ..."), so containment is high for
// real questions and low for follow-ups, which are short and reuse few of a
// bank question's tokens. Under-matching is the safe direction: an unmatched
// real question just isn't counted, and the AI's end_interview tool call
// still ends the interview.
const MATCH_THRESHOLD = 0.6;

/**
 * Returns the index of the bank question the AI's turn is asking,
 * or -1 if the turn doesn't match any (follow-up, intro, clarification).
 */
export function matchBankQuestion(aiTurnText: string, bankQuestions: string[]): number {
  if (!aiTurnText) return -1;
  const turnTokens = tokenize(aiTurnText);
  if (turnTokens.size === 0) return -1;

  let bestIndex = -1;
  let bestScore = 0;

  bankQuestions.forEach((question, i) => {
    const questionTokens = tokenize(question);
    if (questionTokens.size < 3) return;
    let hits = 0;
    questionTokens.forEach((token) => {
      if (turnTokens.has(token)) hits++;
    });
    const score = hits / questionTokens.size;
    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  });

  return bestScore >= MATCH_THRESHOLD ? bestIndex : -1;
}

/**
 * Maps stored question rows back to bank-question indices (deduplicated,
 * sorted). Rows holding follow-ups or legacy placeholder text simply don't
 * match and are excluded — they never represent bank progress.
 */
export function matchAnsweredRowsToBank(rowTexts: string[], bankQuestions: string[]): number[] {
  const matched = new Set<number>();
  for (const text of rowTexts) {
    const idx = matchBankQuestion(text, bankQuestions);
    if (idx !== -1) matched.add(idx);
  }
  return [...matched].sort((a, b) => a - b);
}
