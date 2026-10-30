import Link from "next/link";
import { buttonClass } from "@/ui/button";
import { PageHeader } from "@/ui/page-header";
import { Pomo } from "@/ui/pomo";

export default function NotFound() {
  return (
    <>
      <PageHeader
        title="Page not found"
        description="There is nothing at this address."
        actions={
          <Link href="/" className={buttonClass("primary")}>
            Back to the timer
          </Link>
        }
      />
      <Pomo mood="resting" size={160} className="animate-bob" />
    </>
  );
}
