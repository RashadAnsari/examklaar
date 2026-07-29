import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DashboardClient } from "./DashboardClient";
import { getSessionUser } from "@/lib/auth-session";
import { pool } from "@/lib/db";
import { listSkillGroups } from "@/data/exams";
import { ExamResultsRepository } from "@/lib/repositories/examResultsRepository";
import { WelcomeGiftModal } from "@/components/ui/WelcomeGiftModal";
import { getUserSubscription } from "@/lib/payment/subscription";
import {
  COMPLIMENTARY_ACCESS_MONTHS,
  hasPremiumAccess,
  isTrialEligible,
} from "@/lib/payment/plans";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const user = await getSessionUser();

  // The welcome gift modal is shown right after the pricing page grants
  // complimentary access and redirects here with ?welcome=1.
  const { welcome } = await searchParams;
  const showWelcomeGift = welcome === "gift";

  const [results, sub] = await Promise.all([
    user
      ? new ExamResultsRepository(pool).listCompletedExamIds(user.id)
      : Promise.resolve<{ exam_id: string }[]>([]),
    user ? getUserSubscription(user.id) : Promise.resolve(null),
  ]);

  const isPaid = sub ? hasPremiumAccess(sub) : false;
  const trialEligible = sub ? isTrialEligible(sub) : true;

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

        <DashboardClient skills={skills} isPaid={isPaid} trialEligible={trialEligible} />
        {showWelcomeGift && <WelcomeGiftModal months={COMPLIMENTARY_ACCESS_MONTHS} />}
      </div>

      <Footer />
    </div>
  );
}
