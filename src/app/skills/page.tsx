import type { Metadata } from "next";
import { EmptyState } from "@/ui/empty-state";
import { PageHeader } from "@/ui/page-header";

export const metadata: Metadata = { title: "Skills" };

export default function SkillsPage() {
  return (
    <>
      <PageHeader title="Skills" />
      <EmptyState>
        No skills yet. Each skill keeps its own count toward 10,000 hours.
      </EmptyState>
    </>
  );
}
