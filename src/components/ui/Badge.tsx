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
    success: "badge-success",
    warning: "badge-warning",
    error: "badge-error",
    info: "badge-info",
    neutral: "badge-neutral",
    primary: "badge-primary",
    free: "badge-free",
    premium: "badge-premium",
  };

  return <span className={`badge ${variantMap[variant]} ${className}`}>{children}</span>;
}
