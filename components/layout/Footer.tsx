import Link from "next/link";

export function Footer() {
  return (
    <footer style={{ background: "var(--gray-900)", color: "var(--gray-400)" }}>
      <div className="container py-12 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href="/" className="logo" style={{ color: "white", fontSize: "1.25rem" }}>
              ExamKlaar
            </Link>
            <p className="mt-3 text-sm leading-relaxed">
              Practice for your Dutch inburgering exam with realistic mock exams and AI-powered
              feedback.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={{ color: "white" }}>
              Platform
            </h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link href="/#features" className="hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={{ color: "white" }}>
              Account
            </h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Log In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-white transition-colors">
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4" style={{ color: "white" }}>
              Exams
            </h4>
            <ul className="flex flex-col gap-2 text-sm">
              <li>
                <Link href="/exam" className="hover:text-white transition-colors">
                  KNM
                </Link>
              </li>
              <li>
                <Link href="/exam" className="hover:text-white transition-colors">
                  Lezen
                </Link>
              </li>
              <li>
                <Link href="/exam" className="hover:text-white transition-colors">
                  Luisteren
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="pt-8 text-center text-sm"
          style={{ borderTop: "1px solid var(--gray-800)" }}
        >
          <p>&copy; 2026 ExamKlaar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
