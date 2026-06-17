import { Button } from "@/components/ui/Button";

export function UpgradeBanner() {
  return (
    <div className="rounded-2xl p-5 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 bg-gradient-to-br from-[var(--green-900)] to-[var(--green-700)] text-white">
      <div>
        <h3 className="font-bold mb-1 text-xl">Unlock the Full Experience</h3>
        <p className="text-sm text-white/90">
          Start your 7-day free trial to access all exams per skill, unlimited practice attempts,
          and AI feedback on every Writing &amp; Speaking exam
        </p>
      </div>
      <Button href="/pricing" variant="white" className="flex-shrink-0">
        Start Free Trial
      </Button>
    </div>
  );
}
