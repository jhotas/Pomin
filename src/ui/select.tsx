"use client";

import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { Select as SelectPrimitive } from "radix-ui";
import type { ComponentProps } from "react";

/**
 * shadcn/ui's Select (Radix) in the sticker style: an ink-outlined pill that
 * opens a card of options. Class names are joined, not merged, so callers add
 * classes and do not override these.
 */

function Select(props: ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectValue(props: ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className = "",
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      // The chevron is inside the trigger, so it moves with it.
      className={`group flex h-12 items-center justify-between gap-3 rounded-full border-2 border-text bg-surface pr-4 pl-5 font-display text-section font-medium whitespace-nowrap shadow-sticker-sm transition hover:-translate-y-px hover:bg-cream active:translate-x-0.5 active:translate-y-0.5 active:shadow-pressed disabled:translate-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none *:data-[slot=select-value]:truncate data-[state=open]:translate-x-0.5 data-[state=open]:translate-y-0.5 data-[state=open]:bg-cream data-[state=open]:shadow-pressed md:h-14 ${className}`}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown
          aria-hidden
          size={20}
          strokeWidth={2.5}
          className="shrink-0 transition-transform group-data-[state=open]:rotate-180"
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className = "",
  children,
  sideOffset = 10,
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position="popper"
        sideOffset={sideOffset}
        className={`relative z-50 max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) origin-(--radix-select-content-transform-origin) overflow-hidden card bg-surface text-text transition duration-150 starting:scale-95 starting:opacity-0 ${className}`}
        {...props}
      >
        <SelectPrimitive.ScrollUpButton className="flex justify-center py-1">
          <ChevronUp aria-hidden size={18} strokeWidth={2.5} />
        </SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="p-1.5">
          {children}
        </SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="flex justify-center py-1">
          <ChevronDown aria-hidden size={18} strokeWidth={2.5} />
        </SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectItem({
  className = "",
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={`relative flex cursor-pointer items-center rounded-full py-2.5 pr-10 pl-4 font-display text-body font-medium outline-none select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-cream data-[state=checked]:bg-tint md:text-section ${className}`}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-3.5 flex">
        <Check aria-hidden size={18} strokeWidth={3} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
