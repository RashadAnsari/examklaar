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

  return <PaddleInitializer />;
}
