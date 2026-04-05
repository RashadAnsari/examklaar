"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  if (label) {
    return (
      <div className="flex justify-between items-start gap-8">
        <div className="flex-1">
          {label && (
            <p
              style={{
                fontSize: "0.9375rem",
                fontWeight: 600,
                color: "var(--gray-900)",
                marginBottom: "0.25rem",
              }}
            >
              {label}
            </p>
          )}
          {description && (
            <p style={{ fontSize: "0.875rem", color: "var(--gray-600)", lineHeight: 1.6 }}>
              {description}
            </p>
          )}
        </div>
        <ToggleSwitch checked={checked} onChange={onChange} />
      </div>
    );
  }

  return <ToggleSwitch checked={checked} onChange={onChange} />;
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`toggle-switch ${checked ? "active" : ""}`}
    >
      <span className="toggle-slider" />
    </button>
  );
}
