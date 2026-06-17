import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getUserSubscription, hasAccess } from "@/lib/payment/subscription";
import { getPaymentProvider } from "@/lib/payment/provider";

export async function POST(req: NextRequest) {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const currentSubscription = await getUserSubscription(user.id);
  if (hasAccess(currentSubscription)) {
    return NextResponse.json({ error: "You already have an active subscription" }, { status: 400 });
  }

  // A subscription row only exists for users who have subscribed (or trialed)
  // before. They are not eligible for the free trial again.
  const skipTrial = currentSubscription.planId !== null;

  const providerName = process.env.PAYMENT_PROVIDER;
  if (!providerName) {
    return NextResponse.json({ error: "No payment provider configured" }, { status: 503 });
  }

  const origin = req.nextUrl.origin;
  const successUrl = `${origin}/payment/success`;
  const cancelUrl = `${origin}/payment/cancel`;

  const admin = createAdminClient();

  // Look up existing customer ID for this provider, if any.
  const { data: existingCustomer } = await admin
    .from("payment_customers")
    .select("customer_id")
    .eq("user_id", user.id)
    .eq("provider", providerName)
    .single();

  try {
    const provider = getPaymentProvider();
    const result = await provider.createCheckoutSession({
      userId: user.id,
      userEmail: user.email ?? "",
      successUrl,
      cancelUrl,
      existingCustomerId: existingCustomer?.customer_id,
      skipTrial,
    });

    // Persist the customer ID if it's newly created.
    if (result.customerId && !existingCustomer) {
      await admin.from("payment_customers").insert({
        user_id: user.id,
        provider: providerName,
        customer_id: result.customerId,
      });
    }

    return NextResponse.json({ checkoutUrl: result.checkoutUrl });
  } catch (err) {
    console.error("[checkout] Payment provider error:", err);
    return NextResponse.json({ error: "Payment provider error" }, { status: 500 });
  }
}
