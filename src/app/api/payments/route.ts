import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getPaymentProviderByName } from "@/lib/payment/provider";

export async function GET() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: customerRows } = await admin
    .from("payment_customers")
    .select("provider, customer_id")
    .eq("user_id", user.id);

  if (!customerRows?.length) {
    return NextResponse.json({ payments: [] });
  }

  try {
    const results = await Promise.allSettled(
      customerRows.map(({ provider, customer_id }) => {
        const p = getPaymentProviderByName(provider);
        return p ? p.getPaymentHistory(customer_id) : Promise.resolve([]);
      })
    );

    const registeredAt = new Date(user.created_at);
    const payments = results
      .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
      .filter((p) => p.paidAt != null && p.paidAt >= registeredAt);
    payments.sort((a, b) => {
      const aTime = a.paidAt?.getTime() ?? 0;
      const bTime = b.paidAt?.getTime() ?? 0;
      return bTime - aTime;
    });

    return NextResponse.json({ payments });
  } catch (err) {
    console.error("[payments] Payment provider error:", err);
    return NextResponse.json({ error: "Failed to fetch payment history" }, { status: 500 });
  }
}
