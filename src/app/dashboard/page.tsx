import { cookies } from "next/headers";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { DashboardClient } from "./DashboardClient";
import { createClient } from "@/utils/supabase/server";
import { listSkillGroups } from "@/data/exams";
import { ExamResultsRepository } from "@/lib/repositories/examResultsRepository";
import { WelcomeGiftModal } from "@/components/ui/WelcomeGiftModal";
import {
  COMPLIMENTARY_ACCESS_MONTHS,
  getUserSubscription,
  grantComplimentaryAccess,
  hasPremiumAccess,
  isTrialEligible,
} from "@/lib/payment/subscription";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // While no payment provider is configured, grant a new user free access on
  // their first dashboard visit. Done before reading the subscription so the
  // grant is reflected in this same render; granted is true only on the visit
  // that creates the row, which is when we show the welcome gift modal.
  const { granted: showWelcomeGift } = user
    ? await grantComplimentaryAccess(user.id)
    : { granted: false };

  const [results, sub] = await Promise.all([
    new ExamResultsRepository(supabase).listCompletedExamIds(),
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
            Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}
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
