import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { getUserSubscription } from "@/lib/payment/subscription";
import { getPaymentProviderByName } from "@/lib/payment/provider";

export async function DELETE() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sub = await getUserSubscription(user.id);
  if (sub.providerSubscriptionId && (sub.status === "active" || sub.status === "past_due")) {
    const provider = sub.paymentProvider ? getPaymentProviderByName(sub.paymentProvider) : null;
    try {
      await provider?.cancelSubscription(sub.providerSubscriptionId, sub.providerCustomerId, true);
    } catch (err) {
      console.error("[account] Failed to cancel Paddle subscription for user=%s:", user.id, err);
      return Response.json({ error: "Failed to cancel subscription" }, { status: 500 });
    }
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("[account] Failed to delete user=%s:", user.id, error.message);
    return Response.json({ error: "Failed to delete account" }, { status: 500 });
  }

  return new Response(null, { status: 204 });
}
