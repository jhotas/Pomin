import type { ReactNode } from "react";
import { PageSheet } from "@/ui/page-sheet";

export default function SkillsLayout({ children }: { children: ReactNode }) {
  return <PageSheet>{children}</PageSheet>;
}
