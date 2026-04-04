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
    default: "",
    success: "progress-bar-success",
    warning: "progress-bar-warning",
    danger: "progress-bar-danger",
  };

  return (
    <div className={`progress-container ${thin ? "progress-bar-thin" : ""} ${className}`}>
      <div
        className={`progress-bar ${variantMap[variant]}`}
        style={{ width: `${percentage}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      />
    </div>
  );
}
