import { Button } from "@/components/ui/Button";
import { PLAN } from "@/components/pricing/plan";

/**
 * The dashboard's call to subscribe. During early access nothing is locked, so
 * it instead says that every exam is free for now and what it will cost later.
 */
export function UpgradeBanner({ earlyAccess = false }: { earlyAccess?: boolean }) {
  return (
    <div className="rounded-2xl p-5 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 bg-gradient-to-br from-[var(--green-900)] to-[var(--green-700)] text-white">
      <div>
        {earlyAccess && (
          <span className="inline-flex items-center text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-3 bg-[var(--green-50)] text-[var(--green-700)]">
            Early access
          </span>
        )}
        <h3 className="font-bold mb-1 text-xl">
          {earlyAccess ? "Every exam is free for now" : "Unlock the Full Experience"}
        </h3>
        <p className="text-sm text-white/90">
          {earlyAccess
            ? `ExamKlaar is in early access, so all materials are free to use. When early access ends, full access will cost ${PLAN.price} ${PLAN.priceNote}. We will email you before that happens, and nothing is charged automatically.`
            : "The first exam of every skill is free. Subscribe to unlock all exams per skill, unlimited practice attempts, and AI feedback on every Writing & Speaking exam"}
        </p>
      </div>
      <Button href="/pricing" variant="white" className="flex-shrink-0">
        {earlyAccess ? "See pricing" : "Subscribe"}
      </Button>
    </div>
  );
}
