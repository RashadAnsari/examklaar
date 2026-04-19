import { redirect } from "next/navigation";
import { type Metadata } from "next";
import { PaddleInitializer } from "@/components/payment/PaddleInitializer";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

interface CheckoutPageProps {
  searchParams: Promise<{ _ptxn?: string }>;
}

export default async function CheckoutPage({ searchParams }: CheckoutPageProps) {
  const { _ptxn } = await searchParams;
  if (!_ptxn) {
    redirect("/pricing");
  }

  const token = process.env.PADDLE_CLIENT_TOKEN ?? "";
  if (!token) {
    redirect("/pricing");
  }

  // const environment = process.env.NODE_ENV === "production" ? "production" : "sandbox";
  // FIXME: Use above line once we have separate Paddle environments for production and
  const environment = "sandbox";

  return <PaddleInitializer token={token} environment={environment} />;
}
