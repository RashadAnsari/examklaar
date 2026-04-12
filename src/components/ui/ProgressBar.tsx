type ProgressVariant = "default" | "success" | "warning" | "danger";

interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  thin?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  variant = "default",
  thin = false,
  className = "",
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const variantMap: Record<ProgressVariant, string> = {
    default: "bg-[var(--green-900)]",
    success: "bg-[var(--green-success)]",
    warning: "bg-[var(--amber)]",
    danger: "bg-[var(--red)]",
  };

  return (
    <div
      className={`w-full overflow-hidden rounded-full bg-[var(--gray-100)] ${thin ? "h-1.5" : "h-2"} ${className}`}
    >
      <div
        className={`h-full rounded-full transition-all duration-300 ${variantMap[variant]}`}
        style={{ width: `${percentage}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      />
    </div>
  );
}
