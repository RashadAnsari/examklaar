import { Button } from "@/components/ui/Button";

export function UpgradeBanner() {
  return (
    <div
      className="rounded-2xl p-5 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6"
      style={{
        background: "linear-gradient(135deg, var(--green-900) 0%, var(--green-700) 100%)",
        color: "white",
      }}
    >
      <div>
        <h3 className="font-bold mb-1" style={{ fontSize: "1.5rem" }}>
          Unlock the Full Experience
        </h3>
        <p style={{ opacity: 0.9 }}>
          Upgrade to access all exams per skill, unlimited practice attempts, and AI feedback on
          every Writing &amp; Speaking exam
        </p>
      </div>
      <Button href="/pricing" variant="white" className="flex-shrink-0">
        Upgrade Now
      </Button>
    </div>
  );
}
