/**
 * Copy for the paid plan. Kept apart from PricingCards, a server component, so
 * client components such as the dashboard banner can quote the same price.
 */
export const PLAN = {
  id: "monthly",
  name: "Monthly plan",
  badge: "First exam free",
  badgeEarlyAccess: "Early access",
  headline: "Full access to every exam",
  price: "€9.99",
  priceNote: "/ month",
  subNote: "Incl. VAT. Billed monthly. Cancel anytime.",
  subNoteEarlyAccess:
    "We are in early access, so every exam is free to use for now, with no payment method. We will email you before early access ends. Nothing is charged automatically: after that, you choose whether to subscribe.",
  features: [
    { text: "All exams per skill (growing library)" },
    { text: "Unlimited practice attempts" },
    { text: "KNM, Reading, Listening, Writing & Speaking" },
    { text: "AI feedback on every Writing & Speaking exam" },
    { text: "Full progress tracking" },
    { text: "Email support" },
  ],
  cta: "Subscribe",
  ctaEarlyAccess: "Start practicing free",
  ctaVariant: "primary" as const,
} as const;
