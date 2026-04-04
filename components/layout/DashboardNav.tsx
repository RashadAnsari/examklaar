import Link from "next/link";

interface DashboardNavProps {
  userName?: string;
  userInitials?: string;
}

export function DashboardNav({ userName = "User", userInitials = "U" }: DashboardNavProps) {
  return (
    <nav className="nav">
      <div className="nav-container">
        <Link href="/" className="logo">
          ExamKlaar
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="nav-link hidden sm:block">
            Dashboard
          </Link>
          <Link href="/pricing" className="nav-link hidden sm:block">
            Upgrade
          </Link>
          <Link href="/settings" className="nav-link hidden sm:block">
            Settings
          </Link>

          {/* User menu */}
          <div
            className="flex items-center gap-3 px-4 py-2 rounded-full cursor-pointer"
            style={{ background: "var(--gray-100)" }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
              style={{ background: "var(--green-900)" }}
            >
              {userInitials}
            </div>
            <span
              className="text-sm font-medium hidden sm:block"
              style={{ color: "var(--gray-900)" }}
            >
              {userName}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}
