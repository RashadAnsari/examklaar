import { XCircleIcon } from "@heroicons/react/20/solid";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-20 sm:px-6">
        <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-700">
              <XCircleIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-slate-900">Checkout cancelled</h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                No charge was made. You can subscribe whenever you are ready.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left">
              <p className="text-sm font-semibold text-slate-900">Start when you&apos;re ready</p>
              <p className="mt-2 text-sm text-slate-500">
                The first exam of every skill stays free. Subscribe whenever you want every exam and
                AI feedback.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left">
              <p className="text-sm font-semibold text-slate-900">See what&apos;s included</p>
              <p className="mt-2 text-sm text-slate-500">
                Review the pricing page for everything the subscription unlocks.
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button href="/pricing" variant="primary" fullWidth>
              View pricing
            </Button>
            <Button href="/dashboard" variant="outline" fullWidth>
              Back to dashboard
            </Button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Need help? Visit the pricing page for a full feature overview before you subscribe.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
