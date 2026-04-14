import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getUserSubscription } from "@/lib/payment/subscription";
import { getPaymentProvider } from "@/lib/payment/provider";

export async function GET() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isStub = !process.env.PAYMENT_PROVIDER;

  const sub = await getUserSubscription(user.id);
  if (!sub.providerCustomerId && !isStub) {
    return NextResponse.json({ payments: [] });
  }

  try {
    const provider = getPaymentProvider();
    const payments = await provider.getPaymentHistory(sub.providerCustomerId || "stub_customer");
    return NextResponse.json({ payments });
  } catch (err) {
    console.error("[payments] provider error:", err);
    return NextResponse.json({ error: "Failed to fetch payment history" }, { status: 500 });
  }
}
