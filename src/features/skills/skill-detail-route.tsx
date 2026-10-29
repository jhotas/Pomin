"use client";

import { useParams } from "next/navigation";
import { SkillDetailScreen } from "./skill-detail-screen";

/** Skills live in the browser, so the id is read on the client. */
export function SkillDetailRoute() {
  const { id } = useParams<{ id: string }>();
  return <SkillDetailScreen skillId={id} />;
}
