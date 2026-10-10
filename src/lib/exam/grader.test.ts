import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, test } from "bun:test";
import { GRADING_CRITERIA } from "./config";
import { describeImages, toQuestionFeedback } from "./grader";

/**
 * The grader never sends media to the model. It reads each image's data-description and each video
 * or audio clip's data-transcription instead, so media without one leaves the model grading
 * something it cannot see or hear. Only speaking and writing questions are graded; multiple-choice
 * questions (reading, listening, knm) never reach the grader.
 */

const MIN_DESCRIPTION_WORDS = 25;

async function readExams() {
  const dir = path.join(process.cwd(), "src", "data", "exams");
  const files = (await readdir(dir, { recursive: true })).filter((f) => f.endsWith(".json"));
  return Promise.all(
    files.map(async (file) => ({
      file,
      exam: JSON.parse(await readFile(path.join(dir, file), "utf-8")) as {
        questions: { id: string; type: string; content: string }[];
      },
    }))
  );
}

async function readGradedQuestions() {
  return (await readExams()).flatMap(({ file, exam }) =>
    exam.questions
      .filter((q) => q.type === "speaking" || q.type === "writing")
      .map((q) => ({ file, ...q }))
  );
}

describe("describeImages", () => {
  test("replaces each image with its description", () => {
    const html =
      '<p>Kijk.</p><img src="https://cdn/a.jpg" data-description="A man rides a bike." style="x" />' +
      '<img src="https://cdn/b.jpg" data-description="A woman swims." />';
    expect(describeImages(html)).toBe(
      "<p>Kijk.</p>[Image: A man rides a bike.][Image: A woman swims.]"
    );
  });

  test("marks an image without a description", () => {
    expect(describeImages('<img src="https://cdn/a.jpg" />')).toBe(
      "[Image: no description available]"
    );
  });
});

describe("toQuestionFeedback", () => {
  const grade = {
    questionId: "q1",
    criteria: {
      content: { score: 2, comment: "All points covered." },
      vocabulary: { score: 1, comment: "Some gaps." },
      grammar: { score: 5, comment: "Out of range." },
      coherence: { score: 1, comment: "Weak linking." },
    },
    summary: "Decent answer.",
    corrections: [{ original: "ik gaan", corrected: "ik ga", reason: "Grammar: verb agreement." }],
    correctedAnswer: "ik ga naar huis",
  };

  test("sums clamped criteria in rubric order and scores a missing criterion 0", () => {
    const fb = toQuestionFeedback(grade, GRADING_CRITERIA.writing);
    expect(fb.criteria?.map((c) => [c.key, c.score])).toEqual([
      ["content", 2],
      ["vocabulary", 1],
      ["grammar", 2],
      ["spelling", 0],
      ["coherence", 1],
    ]);
    expect(fb.score).toBe(6);
    expect(fb.maxScore).toBe(10);
    expect(fb.feedback).toBe("Decent answer.");
    expect(fb.correctedAnswer).toBe("ik ga naar huis");
  });

  test("speaking is out of 12", () => {
    expect(toQuestionFeedback(grade, GRADING_CRITERIA.speaking).maxScore).toBe(12);
  });
});

describe("exam media", () => {
  // The description is all the grader knows of the image, so a one-liner is not enough
  test("every image in a graded question has a detailed description", async () => {
    const tooShort: string[] = [];
    for (const q of await readGradedQuestions()) {
      for (const tag of q.content.match(/<img\b[^>]*>/gi) ?? []) {
        const description = tag.match(/\bdata-description="([^"]*)"/)?.[1] ?? "";
        if (description.split(/\s+/).filter(Boolean).length < MIN_DESCRIPTION_WORDS) {
          tooShort.push(`${q.file} ${q.id}`);
        }
      }
    }
    expect(tooShort).toEqual([]);
  });

  test("every video and audio clip in a graded question has a transcription", async () => {
    const missing: string[] = [];
    for (const q of await readGradedQuestions()) {
      for (const tag of q.content.match(/<(?:video|audio)\b[^>]*>/gi) ?? []) {
        if (!/\bdata-transcription="[^"]+"/.test(tag)) {
          missing.push(`${q.file} ${q.id}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });
});
