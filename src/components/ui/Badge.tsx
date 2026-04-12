type BadgeVariant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "primary"
  | "free"
  | "premium";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "neutral", children, className = "" }: BadgeProps) {
  const variantMap: Record<BadgeVariant, string> = {
    success: "bg-[var(--green-success-light)] text-[var(--green-success)]",
    warning: "bg-[var(--amber-light)] text-[#b45309]",
    error: "bg-[var(--red-light)] text-[var(--red)]",
    info: "bg-[var(--blue-light)] text-[var(--blue)]",
    neutral: "bg-[var(--gray-100)] text-[var(--gray-600)]",
    primary: "bg-[var(--green-900)] text-white",
    free: "bg-[var(--blue)] text-white",
    premium: "bg-[var(--amber-light)] text-[#92400e]",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.05em] ${variantMap[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
