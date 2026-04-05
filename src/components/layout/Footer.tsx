import Link from "next/link";

export function Footer() {
  return (
    <footer style={{ background: "var(--gray-900)", color: "var(--gray-400)" }}>
      <div className="container pt-12 pb-8">
        <div className="flex justify-center mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {/* Brand */}
            <div>
              <div className="mb-4">
                <Link href="/" className="font-semibold text-sm" style={{ color: "white" }}>
                  ExamKlaar
                </Link>
              </div>
              <p className="text-sm leading-relaxed">
                Practice for your Dutch inburgering exam with realistic mock exams and AI-powered
                feedback.
              </p>
            </div>

            {/* Info */}
            <div>
              <h4 className="font-semibold mb-4 text-sm" style={{ color: "white" }}>
                Info
              </h4>
              <ul className="flex flex-col gap-2 text-sm">
                <li>
                  <Link href="/pricing" className="hover:text-white transition-colors">
                    Plans &amp; Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4 text-sm" style={{ color: "white" }}>
                Contact
              </h4>
              <p className="text-sm mb-2">Have a question or need help?</p>
              <a
                href="mailto:hallo@examklaar.nl"
                className="text-sm hover:text-white transition-colors"
                style={{ color: "var(--green-500)" }}
              >
                hallo@examklaar.nl
              </a>
            </div>
          </div>
        </div>

        <div
          className="pt-6 text-center text-sm"
          style={{ borderTop: "1px solid var(--gray-800)" }}
        >
          <p>&copy; 2026 ExamKlaar. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
