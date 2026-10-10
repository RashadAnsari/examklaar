import { CRITERION_LABELS, CRITERION_MAX, type QuestionFeedback } from "@/lib/exam/config";

const SCORE_COLORS = ["var(--red)", "var(--amber)", "var(--green-success)"];

/** Per-criterion scores of an AI grade. Renders nothing for results graded before criteria existed. */
export function CriteriaScores({ criteria }: { criteria: QuestionFeedback["criteria"] }) {
  if (!criteria?.length) {
    return null;
  }
  return (
    <ul className="flex flex-col gap-3 mt-4">
      {criteria.map((c) => (
        <li key={c.key} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
          <span
            className="text-sm font-semibold shrink-0 flex justify-between sm:w-56"
            style={{ color: "var(--gray-900)" }}
          >
            {CRITERION_LABELS[c.key]}
            <span style={{ color: SCORE_COLORS[c.score] }}>
              {c.score}/{CRITERION_MAX}
            </span>
          </span>
          <span className="text-sm" style={{ color: "var(--gray-700)", lineHeight: 1.6 }}>
            {c.comment}
          </span>
        </li>
      ))}
    </ul>
  );
}
