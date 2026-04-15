import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getUserSubscription, canAccessPremium } from "@/lib/payment/subscription";
import { Button } from "@/components/ui/Button";
import { CheckoutButton } from "@/components/pricing/CheckoutButton";
import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";

export const PLANS = [
  {
    id: "free",
    name: "Free",
    badge: null,
    description: "Try the platform before you commit",
    price: "€0",
    priceNote: "Forever free",
    subNote: null,
    savingsBadge: null,
    features: [
      { text: "1 exam per skill, unlimited practice attempts", included: true },
      { text: "All 5 skills: KNM, Reading, Listening, Writing & Speaking", included: true },
      { text: "Basic scoring & results", included: true },
      { text: "Progress overview", included: true },
      { text: "AI feedback on Writing & Speaking (1 exam only)", included: true },
      { text: "Access to all exams per skill", included: false },
    ],
    cta: "Get Started for Free",
    ctaVariant: "outline" as const,
    href: "/signup",
    featured: false,
  },
  {
    id: "premium",
    name: "Premium",
    badge: "Most Popular",
    description: "Complete preparation across every exam component",
    price: "€9.99",
    priceNote: "/ month",
    subNote: null,
    savingsBadge: null,
    features: [
      { text: "Access to all exams per skill (growing library)", included: true },
      { text: "Unlimited practice attempts", included: true },
      { text: "All 5 skills: KNM, Reading, Listening, Writing & Speaking", included: true },
      { text: "AI feedback on every Writing & Speaking exam", included: true },
      { text: "Full progress tracking", included: true },
      { text: "Cancel anytime", included: true },
      { text: "Email support", included: true },
    ],
    cta: "Start Premium",
    ctaVariant: "white" as const,
    href: "#",
    featured: true,
  },
  {
    id: "biannual",
    name: "6-Month Plan",
    badge: "Best value",
    description: "Commit for 6 months and save",
    price: "€29.99",
    priceNote: "/ 6 months",
    subNote: "≈ €5 / month",
    savingsBadge: "Save 50%",
    features: [
      { text: "Access to all exams per skill (growing library)", included: true },
      { text: "Unlimited practice attempts", included: true },
      { text: "All 5 skills: KNM, Reading, Listening, Writing & Speaking", included: true },
      { text: "AI feedback on every Writing & Speaking exam", included: true },
      { text: "Full progress tracking", included: true },
      { text: "Cancel anytime", included: true },
      { text: "Email support", included: true },
    ],
    cta: "Get 6-Month Plan",
    ctaVariant: "outline" as const,
    href: "#",
    featured: false,
  },
] as const;

export async function PricingCards() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const loggedIn = !!user;
  const providerConfigured = !!process.env.PAYMENT_PROVIDER;
  const showContactUs = loggedIn && !providerConfigured;

  let hasActiveSubscription = false;
  if (user) {
    const sub = await getUserSubscription(user.id);
    hasActiveSubscription = canAccessPremium(sub);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
      {PLANS.map((plan) => (
        <PricingCard
          key={plan.id}
          plan={plan}
          showContactUs={showContactUs}
          hasActiveSubscription={hasActiveSubscription}
        />
      ))}
    </div>
  );
}

function PricingCard({
  plan,
  showContactUs,
  hasActiveSubscription,
}: {
  plan: (typeof PLANS)[number];
  showContactUs: boolean;
  hasActiveSubscription: boolean;
}) {
  const dark = plan.featured;

  return (
    <div
      className={`relative rounded-2xl flex flex-col${dark ? " pricing-featured" : ""}`}
      style={{
        background: dark ? "var(--green-900)" : "white",
        border: dark ? "none" : "1px solid var(--gray-200)",
        boxShadow: dark
          ? "0 24px 48px rgba(27,107,74,0.25), 0 8px 16px rgba(27,107,74,0.15)"
          : "0 1px 4px rgba(0,0,0,0.06)",
        padding: "2rem",
        zIndex: dark ? 1 : 0,
      }}
    >
      {/* Badge */}
      <div className="mb-5" style={{ minHeight: "1.5rem" }}>
        {plan.badge && (
          <span
            className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{
              background: dark ? "rgba(255,255,255,0.15)" : "var(--green-50)",
              color: dark ? "white" : "var(--green-700)",
            }}
          >
            {plan.badge}
          </span>
        )}
      </div>

      {/* Name + description */}
      <div className="flex items-center gap-2 mb-1">
        <h2
          className="font-bold"
          style={{ fontSize: "1.25rem", color: dark ? "white" : "var(--gray-900)" }}
        >
          {plan.name}
        </h2>
        {plan.savingsBadge && (
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: "var(--green-50)", color: "var(--green-700)" }}
          >
            {plan.savingsBadge}
          </span>
        )}
      </div>
      <p
        className="text-sm mb-6 leading-relaxed"
        style={{ color: dark ? "rgba(255,255,255,0.65)" : "var(--gray-500)" }}
      >
        {plan.description}
      </p>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-end gap-1.5">
          <span
            className="font-bold"
            style={{
              fontSize: "2.75rem",
              lineHeight: 1,
              color: dark ? "white" : "var(--gray-900)",
            }}
          >
            {plan.price}
          </span>
          <span
            className="text-sm mb-1"
            style={{ color: dark ? "rgba(255,255,255,0.55)" : "var(--gray-400)" }}
          >
            {plan.priceNote}
          </span>
        </div>
        {plan.subNote && (
          <p
            className="mt-1.5 text-xs"
            style={{ color: dark ? "rgba(255,255,255,0.5)" : "var(--gray-400)" }}
          >
            {plan.subNote}
          </p>
        )}
      </div>

      {/* Divider */}
      <div
        className="mb-6"
        style={{ height: "1px", background: dark ? "rgba(255,255,255,0.12)" : "var(--gray-100)" }}
      />

      {/* Features */}
      <ul className="flex flex-col gap-3 mb-8 flex-1">
        {plan.features.map((f) => (
          <li key={f.text} className="flex items-start gap-3 text-sm">
            <span
              className="mt-0.5 flex-shrink-0"
              style={{
                color: f.included
                  ? dark
                    ? "rgba(255,255,255,0.9)"
                    : "var(--green-700)"
                  : dark
                    ? "rgba(255,255,255,0.25)"
                    : "var(--gray-300)",
              }}
            >
              {f.included ? (
                <CheckIcon style={{ width: 16, height: 16 }} />
              ) : (
                <XMarkIcon style={{ width: 16, height: 16 }} />
              )}
            </span>
            <span
              style={{
                color: f.included
                  ? dark
                    ? "rgba(255,255,255,0.85)"
                    : "var(--gray-700)"
                  : dark
                    ? "rgba(255,255,255,0.3)"
                    : "var(--gray-400)",
              }}
            >
              {f.text}
            </span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      {plan.id === "free" ? (
        <Button href={plan.href} variant={plan.ctaVariant} fullWidth>
          {plan.cta}
        </Button>
      ) : hasActiveSubscription ? (
        <Button variant={plan.ctaVariant} fullWidth disabled>
          {plan.cta}
        </Button>
      ) : showContactUs ? (
        <Button
          href={`mailto:hallo@examklaar.nl?subject=${encodeURIComponent(`${plan.name} subscription`)}&body=${encodeURIComponent(`Hi,\n\nI'm interested in the ${plan.name} plan (${plan.price} ${plan.priceNote}).\n\nCould you help me get started?\n\nThanks`)}`}
          variant={plan.ctaVariant}
          fullWidth
        >
          Contact Us
        </Button>
      ) : (
        <CheckoutButton planId={plan.id} variant={plan.ctaVariant} fullWidth>
          {plan.cta}
        </CheckoutButton>
      )}
    </div>
  );
}
