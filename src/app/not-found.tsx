import Link from "next/link";
import { buttonClass } from "@/ui/button";
import { PageHeader } from "@/ui/page-header";

export default function NotFound() {
  return (
    <PageHeader
      title="Page not found"
      description="There is nothing at this address."
      actions={
        <Link href="/" className={buttonClass("secondary")}>
          Back to the timer
        </Link>
      }
    />
  );
}
