import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-session";
import { grantComplimentaryAccess } from "@/lib/payment/subscription";

/**
 * Grants the early-stage complimentary access when the user clicks
 * "Start free trial" on the pricing page. grantComplimentaryAccess enforces the
 * same conditions as before: it no-ops when a payment provider is configured and
 * is idempotent for a user who already has a subscription row. When it cannot
 * grant (granted false), the client falls back to the mailto contact option.
 */
export async function POST() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { granted } = await grantComplimentaryAccess(user.id);
  return NextResponse.json({ granted });
}
