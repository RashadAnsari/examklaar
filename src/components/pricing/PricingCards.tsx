import { getSessionUser } from "@/lib/auth-session";
import { getUserSubscription } from "@/lib/payment/subscription";
import { hasPremiumAccess, isTrialEligible } from "@/lib/payment/plans";
import { Button } from "@/components/ui/Button";
import { CheckoutButton } from "@/components/pricing/CheckoutButton";
import { ClaimTrialButton } from "@/components/pricing/ClaimTrialButton";
import { withNext } from "@/lib/redirects";
import { site } from "@/config/site";
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
  // Shown while no payment provider is configured, when claiming grants
  // complimentary access instead of the 7-day trial. The length is deliberately
  // left out here: it can change, and the welcome modal states it on grant.
  badgeComplimentary: "Free early access",
  headline: "Full access to every exam",
  price: "€9.99",
  priceNote: "/ month",
  subNote: "7 days free, then €9.99 / month. Cancel anytime.",
  subNoteComplimentary:
    "Full access while we are in early access, free and with no payment method. It ends on its own and never turns into a paid plan.",
  subNoteReturning: "Billed monthly. Cancel anytime.",
  features: [
    { text: "All exams per skill (growing library)" },
    { text: "Unlimited practice attempts" },
    { text: "KNM, Reading, Listening, Writing & Speaking" },
    { text: "AI feedback on every Writing & Speaking exam" },
    { text: "Full progress tracking" },
    { text: "Email support" },
  ],
  cta: "Start free trial",
  ctaComplimentary: "Claim free access",
  ctaReturning: "Subscribe",
  ctaVariant: "primary" as const,
} as const;

/** Mailto fallback used when we cannot grant access and there is no checkout. */
export const CONTACT_MAILTO = `mailto:${site.supportEmail}?subject=${encodeURIComponent(`${PLAN.name} subscription`)}&body=${encodeURIComponent(`Hi,\n\nI'm interested in the ${PLAN.name} (${PLAN.price} ${PLAN.priceNote}).\n\nCould you help me get started?\n\nThanks`)}`;

export async function PricingCards() {
  const user = await getSessionUser();

  const loggedIn = !!user;
  const providerConfigured = !!process.env.PAYMENT_PROVIDER;
  // No provider yet: claiming grants early-stage complimentary access instead of
  // the 7-day trial. The offer regime drives the copy, so a logged-out visitor
  // sees what they will actually get; loggedIn only decides which button runs.
  const complimentaryOffer = !providerConfigured;
  const claimComplimentary = loggedIn && !providerConfigured;

  let hasActiveSubscription = false;
  // Logged-out visitors are treated as trial-eligible (most are prospective users);
  // a returning customer who already used the trial is billed immediately.
  let trialEligible = true;
  if (user) {
    const sub = await getUserSubscription(user.id);
    hasActiveSubscription = hasPremiumAccess(sub);
    trialEligible = isTrialEligible(sub);
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
          {trialEligible && (
            <span
              className="inline-flex self-start items-center text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6"
              style={{ background: "var(--green-50)", color: "var(--green-700)" }}
            >
              {complimentaryOffer ? PLAN.badgeComplimentary : PLAN.badge}
            </span>
          )}

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
            {!trialEligible
              ? PLAN.subNoteReturning
              : complimentaryOffer
                ? PLAN.subNoteComplimentary
                : PLAN.subNote}
          </p>

          <div className="mt-auto pt-8">
            <PlanCta
              loggedIn={loggedIn}
              claimComplimentary={claimComplimentary}
              complimentaryOffer={complimentaryOffer}
              hasActiveSubscription={hasActiveSubscription}
              trialEligible={trialEligible}
            />
            {!hasActiveSubscription && trialEligible && (
              <p className="mt-3 text-center text-xs" style={{ color: "var(--gray-500)" }}>
                {complimentaryOffer
                  ? "No payment method needed"
                  : "No charge during your 7-day trial"}
              </p>
            )}
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
  claimComplimentary,
  complimentaryOffer,
  hasActiveSubscription,
  trialEligible,
}: {
  loggedIn: boolean;
  claimComplimentary: boolean;
  complimentaryOffer: boolean;
  hasActiveSubscription: boolean;
  trialEligible: boolean;
}) {
  if (hasActiveSubscription) {
    return (
      <Button href="/dashboard" variant={PLAN.ctaVariant} fullWidth>
        Go to Dashboard
      </Button>
    );
  }
  const ctaLabel = !trialEligible
    ? PLAN.ctaReturning
    : complimentaryOffer
      ? PLAN.ctaComplimentary
      : PLAN.cta;
  // A logged-out visitor on the pricing page is a prospect, so send them to
  // signup rather than login. `next` brings them back here to claim once the
  // account is live, and the signup page links to login for returning users.
  if (!loggedIn) {
    return (
      <Button href={withNext("/auth/signup", "/pricing")} variant={PLAN.ctaVariant} fullWidth>
        {ctaLabel}
      </Button>
    );
  }
  if (claimComplimentary) {
    return (
      <ClaimTrialButton contactHref={CONTACT_MAILTO} variant={PLAN.ctaVariant} fullWidth>
        {ctaLabel}
      </ClaimTrialButton>
    );
  }
  return (
    <CheckoutButton planId={PLAN.id} variant={PLAN.ctaVariant} fullWidth>
      {ctaLabel}
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
