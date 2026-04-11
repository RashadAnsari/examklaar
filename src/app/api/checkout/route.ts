import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getPaymentProvider } from "@/lib/payment/provider";

const PLAN_DURATION_MONTHS: Record<"premium" | "biannual", number> = {
  premium: 1,
  biannual: 6,
};

export async function POST(req: NextRequest) {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const planId = body?.planId as string;
  if (planId !== "premium" && planId !== "biannual") {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const origin = req.nextUrl.origin;
  const successUrl = `${origin}/payment/success`;
  const cancelUrl = `${origin}/payment/cancel`;

  const isStub = !process.env.PAYMENT_PROVIDER;
  if (isStub) {
    // Stub mode: write subscription directly and redirect to success page.
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + PLAN_DURATION_MONTHS[planId]);

    const admin = createAdminClient();
    const { error } = await admin.from("subscriptions").upsert(
      {
        user_id: user.id,
        plan_id: planId,
        status: "active",
        payment_provider: "stub",
        provider_customer_id: null,
        provider_subscription_id: null,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        cancel_at_period_end: false,
        updated_at: now.toISOString(),
      },
      { onConflict: "user_id" }
    );

    if (error) {
      console.error("[checkout] stub upsert error:", error);
      return NextResponse.json({ error: "Failed to activate subscription" }, { status: 500 });
    }

    return NextResponse.json({ checkoutUrl: successUrl });
  }

  // Real provider mode.
  const providerName = process.env.PAYMENT_PROVIDER!;
  const admin = createAdminClient();

  // Look up existing customer ID for this provider, if any.
  const { data: existingCustomer } = await admin
    .from("provider_customers")
    .select("customer_id")
    .eq("user_id", user.id)
    .eq("provider", providerName)
    .single();

  try {
    const provider = getPaymentProvider();
    const result = await provider.createCheckoutSession({
      userId: user.id,
      userEmail: user.email ?? "",
      planId,
      successUrl,
      cancelUrl,
      existingCustomerId: existingCustomer?.customer_id,
    });

    // Persist the customer ID if it's newly created.
    if (result.customerId && !existingCustomer) {
      await admin.from("provider_customers").insert({
        user_id: user.id,
        provider: providerName,
        customer_id: result.customerId,
      });
    }

    return NextResponse.json({ checkoutUrl: result.checkoutUrl });
  } catch (err) {
    console.error("[checkout] provider error:", err);
    return NextResponse.json({ error: "Payment provider error" }, { status: 500 });
  }
}
