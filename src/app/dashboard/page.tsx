import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DashboardClient } from "./DashboardClient";
import { getSessionUser } from "@/lib/auth-session";
import { pool } from "@/lib/db";
import { listSkillGroups } from "@/data/exams";
import { ExamResultsRepository } from "@/lib/repositories/examResultsRepository";

export default async function DashboardPage() {
  const user = await getSessionUser();

  const results = user ? await new ExamResultsRepository(pool).listCompletedExamIds(user.id) : [];

  const completedByGroup = new Map<string, Set<string>>();
  for (const r of results) {
    const match = r.exam_id.match(/^(.+)-exam-\d+$/);
    if (!match) {
      continue;
    }
    const groupId = match[1];
    if (!completedByGroup.has(groupId)) {
      completedByGroup.set(groupId, new Set());
    }
    completedByGroup.get(groupId)!.add(r.exam_id);
  }

  const skills = (await listSkillGroups()).map((g) => ({
    ...g,
    completedCount: completedByGroup.get(g.id)?.size ?? 0,
  }));

  return (
    <div className="min-h-screen" style={{ background: "var(--gray-50)" }}>
      <Navbar />

      <div className="container py-8" style={{ maxWidth: "1280px" }}>
        <div className="mb-8">
          <h1 className="font-bold mb-1" style={{ fontSize: "2rem", color: "var(--gray-900)" }}>
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p style={{ color: "var(--gray-600)" }}>Continue practicing for your inburgering exam</p>
        </div>

        <DashboardClient skills={skills} />
      </div>

      <Footer />
    </div>
  );
}
