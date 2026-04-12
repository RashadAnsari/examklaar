"use client";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
}

export function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <div className="flex flex-col gap-3">
      {label ? (
        <div className="flex justify-between items-start gap-8">
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--gray-900)] mb-1">{label}</p>
            {description && (
              <p className="text-sm text-[var(--gray-600)] leading-[1.6]">{description}</p>
            )}
          </div>
          <ToggleSwitch checked={checked} onChange={onChange} />
        </div>
      ) : (
        <ToggleSwitch checked={checked} onChange={onChange} />
      )}
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
        checked ? "bg-[var(--green-900)]" : "bg-[var(--gray-300)]"
      }`}
    >
      <span
        className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-6" : "translate-x-0"
        }`}
      />
    </button>
  );
}
