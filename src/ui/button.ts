type ButtonVariant = "primary" | "secondary" | "text" | "danger" | "dangerText";

const base =
  "inline-flex h-11 items-center justify-center gap-2 font-display font-medium whitespace-nowrap transition disabled:cursor-not-allowed";

// Sticker buttons sink into their shadow when pressed.
const sticker =
  "rounded-full border-2 border-text px-5 shadow-sticker-sm hover:-translate-y-px active:translate-x-0.5 active:translate-y-0.5 active:shadow-pressed disabled:translate-0 disabled:shadow-none";

// Each variant owns its padding and colours, so no two classes compete.
const variants: Record<ButtonVariant, string> = {
  primary: `${sticker} bg-primary text-primary-ink`,
  secondary: `${sticker} bg-surface text-text hover:bg-cream`,
  text: "text-text underline-offset-4 hover:underline",
  danger: `${sticker} bg-surface text-negative hover:bg-tint`,
  dangerText: "text-negative underline-offset-4 hover:underline",
};

/** Class names for a button or a link styled as one. */
export function buttonClass(variant: ButtonVariant = "secondary"): string {
  return `${base} ${variants[variant]}`;
}
