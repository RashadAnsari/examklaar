import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getUserSubscription, hasAccess } from "@/lib/payment/subscription";
import { Button } from "@/components/ui/Button";
import { CheckoutButton } from "@/components/pricing/CheckoutButton";
import {
  CheckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CreditCardIcon,
} from "@heroicons/react/20/solid";

export const PLAN = {
  id: "monthly",
  name: "Monthly plan",
  badge: "7-day free trial",
  headline: "Full access to every exam",
  price: "€9.99",
  priceNote: "/ month",
  subNote: "7 days free, then €9.99 / month. Cancel anytime.",
  features: [
    { text: "All exams per skill (growing library)" },
    { text: "Unlimited practice attempts" },
    { text: "KNM, Reading, Listening, Writing & Speaking" },
    { text: "AI feedback on every Writing & Speaking exam" },
    { text: "Full progress tracking" },
    { text: "Email support" },
  ],
  cta: "Start free trial",
  ctaVariant: "primary" as const,
} as const;

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
    hasActiveSubscription = hasAccess(sub);
  }

  return (
    <div className="mx-auto" style={{ maxWidth: "1040px" }}>
      <div
        className="rounded-2xl border-2 overflow-hidden grid md:grid-cols-2"
        style={{
          borderColor: "var(--green-900)",
          boxShadow: "0 16px 40px rgba(27,107,74,0.14), 0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        {/* Offer */}
        <div className="bg-white p-8 sm:p-10 flex flex-col">
          <span
            className="inline-flex self-start items-center text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6"
            style={{ background: "var(--green-50)", color: "var(--green-700)" }}
          >
            {PLAN.badge}
          </span>

          <h2 className="font-bold mb-5" style={{ fontSize: "1.5rem", color: "var(--gray-900)" }}>
            {PLAN.headline}
          </h2>

          <div className="flex items-end gap-1.5">
            <span
              className="font-bold"
              style={{ fontSize: "3.5rem", lineHeight: 1, color: "var(--green-900)" }}
            >
              {PLAN.price}
            </span>
            <span className="text-base mb-2" style={{ color: "var(--green-700)" }}>
              {PLAN.priceNote}
            </span>
          </div>
          <p className="mt-3 text-sm" style={{ color: "var(--gray-600)" }}>
            {PLAN.subNote}
          </p>

          <div className="mt-auto pt-8">
            <PlanCta
              loggedIn={loggedIn}
              showContactUs={showContactUs}
              hasActiveSubscription={hasActiveSubscription}
            />
            <p className="mt-3 text-center text-xs" style={{ color: "var(--gray-500)" }}>
              No charge during your 7-day trial
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="p-8 sm:p-10" style={{ background: "var(--green-50)" }}>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-6"
            style={{ color: "var(--green-700)" }}
          >
            Everything included
          </p>
          <ul className="flex flex-col gap-4">
            {PLAN.features.map((f) => (
              <li key={f.text} className="flex items-start gap-3 text-sm">
                <span
                  className="mt-0.5 flex-shrink-0 flex items-center justify-center rounded-full"
                  style={{ width: 22, height: 22, background: "white", color: "var(--green-700)" }}
                >
                  <CheckIcon style={{ width: 14, height: 14 }} />
                </span>
                <span style={{ color: "var(--gray-800)", lineHeight: 1.5 }}>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Trust row */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
        <TrustItem
          icon={<ShieldCheckIcon style={{ width: 16, height: 16 }} />}
          text="Secure checkout"
        />
        <TrustItem
          icon={<ArrowPathIcon style={{ width: 16, height: 16 }} />}
          text="Cancel anytime"
        />
        <TrustItem
          icon={<CreditCardIcon style={{ width: 16, height: 16 }} />}
          text="iDEAL and cards accepted"
        />
      </div>
    </div>
  );
}

function PlanCta({
  loggedIn,
  showContactUs,
  hasActiveSubscription,
}: {
  loggedIn: boolean;
  showContactUs: boolean;
  hasActiveSubscription: boolean;
}) {
  if (hasActiveSubscription) {
    return (
      <Button href="/dashboard" variant={PLAN.ctaVariant} fullWidth>
        Go to Dashboard
      </Button>
    );
  }
  if (!loggedIn) {
    return (
      <Button href="/auth/login?next=/pricing" variant={PLAN.ctaVariant} fullWidth>
        {PLAN.cta}
      </Button>
    );
  }
  if (showContactUs) {
    return (
      <Button
        href={`mailto:hallo@examklaar.nl?subject=${encodeURIComponent(`${PLAN.name} subscription`)}&body=${encodeURIComponent(`Hi,\n\nI'm interested in the ${PLAN.name} (${PLAN.price} ${PLAN.priceNote}).\n\nCould you help me get started?\n\nThanks`)}`}
        variant={PLAN.ctaVariant}
        fullWidth
      >
        Contact Us
      </Button>
    );
  }
  return (
    <CheckoutButton variant={PLAN.ctaVariant} fullWidth>
      {PLAN.cta}
    </CheckoutButton>
  );
}

function TrustItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm" style={{ color: "var(--gray-500)" }}>
      <span style={{ color: "var(--green-700)" }}>{icon}</span>
      {text}
    </div>
  );
}
