import Link from "next/link";
import { CookiePreferencesLink } from "@/components/layout/CookiePreferencesLink";
import { site } from "@/config/site";

export function Footer() {
  return (
    <footer className="bg-[var(--gray-900)] text-[var(--gray-400)]">
      <div className="container pt-12 pb-8">
        <div className="flex justify-center mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10">
            {/* Brand */}
            <div>
              <div className="mb-4">
                <Link href="/" className="font-semibold text-sm text-white">
                  {site.name}
                </Link>
              </div>
              <p className="text-sm leading-relaxed">
                Practice for your Dutch inburgering exam with realistic mock exams and AI-powered
                feedback.
              </p>
            </div>

            {/* Info */}
            <div>
              <h4 className="font-semibold mb-4 text-sm text-white">Info</h4>
              <ul className="flex flex-col gap-2 text-sm">
                <li>
                  <a href={site.repoUrl} className="hover:text-white transition-colors">
                    Source Code
                  </a>
                </li>
                <li>
                  <Link href="/terms-and-conditions" className="hover:text-white transition-colors">
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <CookiePreferencesLink />
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4 text-sm text-white">Contact</h4>
              <p className="text-sm mb-2">Have a question or need help?</p>
              <a
                href={site.issuesUrl}
                className="text-sm text-[var(--green-500)] hover:text-white transition-colors"
              >
                Open an issue on GitHub
              </a>
            </div>
          </div>
        </div>

        <div className="pt-6 text-center text-sm border-t border-[var(--gray-800)]">
          <p>&copy; 2026 {site.name}. All rights reserved.</p>
          <p className="mt-1">Free demo version, provided as is without any guarantee.</p>
        </div>
      </div>
    </footer>
  );
}
