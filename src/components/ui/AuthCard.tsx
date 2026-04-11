import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

interface Props {
  children: React.ReactNode;
  backLink?: boolean;
}

export function AuthCard({ children, backLink }: Props) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 py-12"
      style={{ background: "var(--gray-50)" }}
    >
      <div className="w-full" style={{ maxWidth: "440px" }}>
        <div className="flex justify-center mb-8">
          <Link href="/" className="logo flex items-center gap-2.5" style={{ fontSize: "1.5rem" }}>
            <Image src="/examklaar-logo.svg" alt="" width={44} height={44} priority />
            ExamKlaar
          </Link>
        </div>

        <div className="card card-auth">{children}</div>

        {backLink && (
          <div className="text-center mt-6">
            <Link
              href="/"
              className="text-sm inline-flex items-center gap-2"
              style={{ color: "var(--gray-600)" }}
            >
              <ArrowLeftIcon style={{ width: 16, height: 16 }} />
              Back to home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
