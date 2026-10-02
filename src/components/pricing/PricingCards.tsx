import { getSessionUser } from "@/lib/auth-session";
import { getUserSubscription, isEarlyAccess } from "@/lib/payment/subscription";
import { hasPremiumAccess } from "@/lib/payment/plans";
import { Button } from "@/components/ui/Button";
import { CheckoutButton } from "@/components/pricing/CheckoutButton";
import { PLAN } from "@/components/pricing/plan";
import { withNext } from "@/lib/redirects";
import {
  CheckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CreditCardIcon,
} from "@heroicons/react/20/solid";

export async function PricingCards() {
  const user = await getSessionUser();

  const loggedIn = !!user;
  // No provider yet: every exam is free, so the card shows the price that
  // applies later and sends people straight to practicing.
  const earlyAccess = isEarlyAccess();

  let hasActiveSubscription = false;
  if (user) {
    hasActiveSubscription = hasPremiumAccess(await getUserSubscription(user.id));
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
          {(earlyAccess || !hasActiveSubscription) && (
            <span
              className="inline-flex self-start items-center text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6"
              style={{ background: "var(--green-50)", color: "var(--green-700)" }}
            >
              {earlyAccess ? PLAN.badgeEarlyAccess : PLAN.badge}
            </span>
          )}

          <h2 className="font-bold mb-5" style={{ fontSize: "1.5rem", color: "var(--gray-900)" }}>
            {PLAN.headline}
          </h2>

          {earlyAccess ? (
            <>
              <div className="flex items-end gap-1.5">
                <span
                  className="font-bold"
                  style={{ fontSize: "3.5rem", lineHeight: 1, color: "var(--green-900)" }}
                >
                  Free
                </span>
                <span className="text-base mb-2" style={{ color: "var(--green-700)" }}>
                  during early access
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold" style={{ color: "var(--gray-800)" }}>
                Later {PLAN.price} {PLAN.priceNote}, incl. VAT
              </p>
            </>
          ) : (
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
          )}
          <p className="mt-3 text-sm" style={{ color: "var(--gray-600)" }}>
            {earlyAccess ? PLAN.subNoteEarlyAccess : PLAN.subNote}
          </p>

          <div className="mt-auto pt-8">
            <PlanCta
              loggedIn={loggedIn}
              earlyAccess={earlyAccess}
              hasActiveSubscription={hasActiveSubscription}
            />
            {!hasActiveSubscription && (
              <p className="mt-3 text-center text-xs" style={{ color: "var(--gray-500)" }}>
                {earlyAccess
                  ? "No payment method needed"
                  : "The first exam of every skill stays free"}
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

      {/* Trust row: about checkout, so only once there is one */}
      {!earlyAccess && (
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
      )}
    </div>
  );
}

function PlanCta({
  loggedIn,
  earlyAccess,
  hasActiveSubscription,
}: {
  loggedIn: boolean;
  earlyAccess: boolean;
  hasActiveSubscription: boolean;
}) {
  // During early access a signed-in user already has every exam, so there is
  // nothing to buy or claim.
  if (hasActiveSubscription || (earlyAccess && loggedIn)) {
    return (
      <Button href="/dashboard" variant={PLAN.ctaVariant} fullWidth>
        Go to Dashboard
      </Button>
    );
  }
  // A logged-out visitor on the pricing page is a prospect, so send them to
  // signup rather than login. During early access `next` lands them on the
  // dashboard; otherwise it brings them back here to subscribe.
  if (!loggedIn) {
    return (
      <Button
        href={withNext("/auth/signup", earlyAccess ? "/dashboard" : "/pricing")}
        variant={PLAN.ctaVariant}
        fullWidth
      >
        {earlyAccess ? PLAN.ctaEarlyAccess : PLAN.cta}
      </Button>
    );
  }
  return (
    <CheckoutButton planId={PLAN.id} variant={PLAN.ctaVariant} fullWidth>
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
