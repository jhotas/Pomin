import Link from "next/link";
import { buttonClass } from "@/ui/button";
import { PageHeader } from "@/ui/page-header";

export default function Home() {
  return (
    <PageHeader
      title="Timer"
      description="Pick a skill to start a 25-minute focus block."
      actions={
        <Link href="/skills" className={buttonClass("primary")}>
          Add your first skill
        </Link>
      }
    />
  );
}
