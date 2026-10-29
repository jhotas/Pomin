type ButtonVariant = "primary" | "secondary" | "text";

const base =
  "inline-flex h-11 items-center justify-center gap-2 rounded-control px-3.5 font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed md:h-9";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-ink hover:opacity-85 active:opacity-75",
  secondary:
    "border border-control bg-surface text-text hover:bg-raised active:bg-active",
  text: "px-0 text-text underline-offset-4 hover:underline",
};

/** Class names for a button or a link styled as one. */
export function buttonClass(variant: ButtonVariant = "secondary"): string {
  return `${base} ${variants[variant]}`;
}
