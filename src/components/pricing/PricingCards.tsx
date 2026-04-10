import { Button } from "@/components/ui/Button";
import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";

export const PLANS = [
  {
    id: "free",
    name: "Free",
    description: "Perfect for trying out the platform",
    price: "€0",
    priceNote: "Forever free",
    features: [
      { text: "1 practice exam per skill", included: true },
      { text: "Basic scoring & results", included: true },
      { text: "Progress overview", included: true },
      { text: "KNM, Reading, Listening", included: true },
      { text: "No AI feedback", included: false },
      { text: "No Writing & Speaking", included: false },
    ],
    cta: "Get Started",
    ctaVariant: "outline" as const,
    href: "/signup",
    featured: false,
  },
  {
    id: "premium",
    name: "Premium",
    description: "Complete exam preparation with AI feedback",
    price: "€8",
    period: "/month",
    features: [
      { text: "Unlimited practice exams", included: true },
      { text: "AI writing corrections", included: true },
      { text: "AI speaking feedback", included: true },
      { text: "All 5 skills (KNM + 4)", included: true },
      { text: "Full progress tracking", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Upgrade Now",
    ctaVariant: "primary" as const,
    href: "#",
    featured: true,
  },
  {
    id: "onetime",
    name: "One-Time Pack",
    description: "Pay once, practice until you pass",
    price: "€25",
    priceNote: "One-time payment",
    features: [
      { text: "20 full practice exams", included: true },
      { text: "AI feedback included", included: true },
      { text: "All 5 skills", included: true },
      { text: "No recurring charge", included: true },
      { text: "Perfect for focused prep", included: true },
      { text: "6 months access", included: true },
    ],
    cta: "Buy Pack",
    ctaVariant: "outline" as const,
    href: "#",
    featured: false,
  },
] as const;

export function PricingCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {PLANS.map((plan) => (
        <PricingCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}

function PricingCard({ plan }: { plan: (typeof PLANS)[number] }) {
  return (
    <div
      className="relative rounded-3xl p-12 border-2"
      style={{
        background: "white",
        borderColor: plan.featured ? "var(--green-900)" : "var(--gray-200)",
        boxShadow: plan.featured ? "0 20px 40px rgba(27,107,74,0.15)" : "none",
      }}
    >
      {plan.featured && (
        <span
          className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-xs font-bold uppercase tracking-wider px-5 py-1.5 rounded-full"
          style={{ background: "var(--green-900)" }}
        >
          Most Popular
        </span>
      )}

      <h2 className="font-bold mb-2" style={{ fontSize: "1.5rem", color: "var(--gray-900)" }}>
        {plan.name}
      </h2>
      <p className="mb-8 text-sm leading-relaxed" style={{ color: "var(--gray-600)" }}>
        {plan.description}
      </p>

      <div className="mb-8">
        <span
          className="font-bold"
          style={{
            fontSize: "3rem",
            color: "var(--green-900)",
            lineHeight: 1,
          }}
        >
          {plan.price}
        </span>
        {"period" in plan && (
          <span className="ml-2" style={{ color: "var(--gray-500)" }}>
            {plan.period}
          </span>
        )}
        {"priceNote" in plan && (
          <p className="mt-2 text-sm" style={{ color: "var(--gray-500)" }}>
            {plan.priceNote}
          </p>
        )}
      </div>

      <ul className="mb-8 flex flex-col gap-0">
        {plan.features.map((f) => (
          <li
            key={f.text}
            className="flex items-center gap-3 py-3 border-b last:border-b-0 text-sm"
            style={{
              borderColor: "var(--gray-100)",
              color: f.included ? "var(--gray-700)" : "var(--gray-400)",
              opacity: f.included ? 1 : 0.6,
            }}
          >
            <span
              style={{ color: f.included ? "var(--green-900)" : "var(--gray-400)", flexShrink: 0 }}
            >
              {f.included ? (
                <CheckIcon style={{ width: 20, height: 20 }} />
              ) : (
                <XMarkIcon style={{ width: 20, height: 20 }} />
              )}
            </span>
            {f.text}
          </li>
        ))}
      </ul>

      <Button href={plan.href} variant={plan.ctaVariant} fullWidth>
        {plan.cta}
      </Button>
    </div>
  );
}
