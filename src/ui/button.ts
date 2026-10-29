type ButtonVariant = "primary" | "secondary" | "text" | "danger" | "dangerText";

const base =
  "inline-flex h-11 items-center justify-center gap-2 rounded-control font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed md:h-9";

// Each variant owns its padding and colours, so no two classes compete.
const variants: Record<ButtonVariant, string> = {
  primary:
    "px-3.5 bg-primary text-primary-ink hover:opacity-85 active:opacity-75",
  secondary:
    "px-3.5 border border-control bg-surface text-text hover:bg-raised active:bg-active",
  text: "text-text underline-offset-4 hover:underline",
  danger:
    "px-3.5 border border-negative bg-surface text-negative hover:bg-raised active:bg-active",
  dangerText: "text-negative underline-offset-4 hover:underline",
};

/** Class names for a button or a link styled as one. */
export function buttonClass(variant: ButtonVariant = "secondary"): string {
  return `${base} ${variants[variant]}`;
}
