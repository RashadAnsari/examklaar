import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, test } from "bun:test";
import { feedbackHeadline } from "./config";
import {
  CALIBRATION,
  CORRECTION,
  RUBRICS,
  describeImages,
  rubricFor,
  toQuestionFeedback,
} from "./grader";

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
      grammar: { score: 5, comment: "Out of range." },
      vocabulary: { score: 1, comment: "Simple words." },
      coherence: { score: 1, comment: "Uses want." },
    },
    summary: "Decent answer.",
    corrections: [{ original: "ik gaan", corrected: "ik ga", reason: "Grammar: verb agreement." }],
    correctedAnswer: "ik ga naar huis",
  };

  test("clamps each aspect to its DUO maximum and scores a missing aspect 0", () => {
    const fb = toQuestionFeedback(grade, "writing");
    expect(fb.criteria?.map((c) => [c.key, c.score, c.max])).toEqual([
      ["content", 2, 3],
      ["grammar", 2, 2],
      ["spelling", 0, 2],
      ["vocabulary", 1, 2],
      ["coherence", 1, 1],
    ]);
    expect(fb.score).toBe(6);
    expect(fb.feedback).toBe("Decent answer.");
    expect(fb.correctedAnswer).toBe("ik ga naar huis");
  });

  test("matches the DUO totals: writing 10, form 7, speaking 12", () => {
    expect(toQuestionFeedback(grade, "writing").maxScore).toBe(10);
    expect(toQuestionFeedback(grade, "form").maxScore).toBe(7);
    expect(toQuestionFeedback(grade, "speaking").maxScore).toBe(12);
  });

  test("scores every aspect 0 when adequacy is 0", () => {
    const offTask = {
      ...grade,
      criteria: { ...grade.criteria, content: { score: 0, comment: "" } },
    };
    expect(toQuestionFeedback(offTask, "writing").score).toBe(0);
  });
});

describe("feedbackHeadline", () => {
  test("keeps only the first sentence, not cut at a time like 18.00", () => {
    expect(feedbackHeadline("You fed the dog at 18.00 as asked. Add where the key is.")).toBe(
      "You fed the dog at 18.00 as asked."
    );
    expect(feedbackHeadline("No answer provided.")).toBe("No answer provided.");
    expect(feedbackHeadline("No end punctuation")).toBe("No end punctuation");
  });
});

describe("rubricFor", () => {
  test("picks the DUO model per question", () => {
    expect(rubricFor({ type: "speaking" })).toBe("speaking");
    expect(rubricFor({ type: "writing", form: true })).toBe("form");
    expect(rubricFor({ type: "writing" })).toBe("writing");
  });

  // A form graded on the free-writing model would lose grammar and coherence points it cannot earn
  test("every writing exam marks exactly one form question", async () => {
    for (const { file, exam } of await readExams()) {
      const forms = exam.questions.filter((q) => (q as { form?: boolean }).form);
      if (exam.questions.some((q) => q.type === "writing")) {
        expect([file, forms.length]).toEqual([file, 1]);
      } else {
        expect([file, forms.length]).toEqual([file, 0]);
      }
    }
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

describe("grade-a2-exam skill", () => {
  // Agents outside the app grade with the skill, so it must carry the grader's exact rules
  test("copies the grader's assessment models, scoring and correction rules word for word", async () => {
    const skill = await readFile(
      path.join(process.cwd(), ".agents", "skills", "grade-a2-exam", "SKILL.md"),
      "utf-8"
    );
    for (const section of [...Object.values(RUBRICS), CALIBRATION, CORRECTION]) {
      expect(skill).toContain(section);
    }
  });
});
