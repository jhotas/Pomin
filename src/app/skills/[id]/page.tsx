import type { Metadata } from "next";
import { Suspense } from "react";
import { SkillDetailRoute } from "@/features/skills/skill-detail-route";

export const metadata: Metadata = { title: "Skill" };

export default function SkillPage() {
  return (
    <Suspense>
      <SkillDetailRoute />
    </Suspense>
  );
}
