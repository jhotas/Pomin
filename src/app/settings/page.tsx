import type { Metadata } from "next";
import { PageHeader } from "@/ui/page-header";
import { SettingsSection } from "@/ui/settings-section";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" />
      <div>
        <SettingsSection
          title="Data"
          description="Your sessions are stored in this browser only."
        >
          <p>
            Skills and sessions never leave this device. Clearing this
            site&apos;s data in your browser deletes them.
          </p>
        </SettingsSection>
      </div>
    </>
  );
}
