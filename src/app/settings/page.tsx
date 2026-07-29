import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-session";
import { withNext } from "@/lib/redirects";
import { SettingsClient } from "./SettingsClient";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  // The proxy already turned anonymous visitors away, but it only checks that a
  // session cookie is present, not that it is valid, so it is not access
  // control. This is the check that enforces it, as every protected page must
  // do for itself.
  const user = await getSessionUser();
  if (!user) {
    redirect(withNext("/auth/login", "/settings"));
  }

  return <SettingsClient />;
}
