import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--gray-50)" }}>
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-6" style={{ maxWidth: "480px" }}>
          <h1 className="font-bold mb-2" style={{ fontSize: "1.75rem", color: "var(--gray-900)" }}>
            Payment cancelled
          </h1>
          <p className="mb-8" style={{ color: "var(--gray-500)" }}>
            No worries, you weren&apos;t charged. You can upgrade whenever you&apos;re ready.
          </p>
          <Button href="/pricing" variant="primary">
            Back to Pricing
          </Button>
          <p className="mt-4 text-sm" style={{ color: "var(--gray-400)" }}>
            or{" "}
            <Link href="/dashboard" style={{ color: "var(--green-700)" }}>
              continue with free plan
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
