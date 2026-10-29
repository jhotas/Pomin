import type { ReactNode } from "react";

type SettingsSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

/** A settings row: what the section is on the left, its controls on the right. */
export function SettingsSection({
  title,
  description,
  children,
}: SettingsSectionProps) {
  const id = `settings-${title.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <section
      aria-labelledby={id}
      className="grid gap-3 border-t border-border py-8 first:border-t-0 first:pt-0 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-12"
    >
      <div className="lg:pt-4">
        <h2 id={id} className="text-section font-medium">
          {title}
        </h2>
        <p className="mt-1 text-muted">{description}</p>
      </div>
      <div className="rounded-card border border-border bg-surface p-4">
        {children}
      </div>
    </section>
  );
}
