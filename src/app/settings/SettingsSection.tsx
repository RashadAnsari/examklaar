/** A titled card on the settings page. Every section on the page is one. */
export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-8 border mb-8"
      style={{ background: "white", borderColor: "var(--gray-200)" }}
    >
      <div className="mb-8">
        <h2
          className="font-semibold mb-1"
          style={{ fontSize: "1.25rem", color: "var(--gray-900)" }}
        >
          {title}
        </h2>
        <p className="text-sm" style={{ color: "var(--gray-600)" }}>
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}

/** A labelled row inside a SettingsSection, with its control on the right. */
export function SettingsItem({
  label,
  description,
  children,
}: {
  label: React.ReactNode;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 py-6 border-b last:border-b-0 first:pt-0"
      style={{ borderColor: "var(--gray-100)" }}
    >
      <div className="flex-1">
        <div
          className="font-semibold mb-0.5"
          style={{ fontSize: "0.9375rem", color: "var(--gray-900)" }}
        >
          {label}
        </div>
        <p className="text-sm" style={{ color: "var(--gray-600)", lineHeight: 1.6 }}>
          {description}
        </p>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}
