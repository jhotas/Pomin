import type { Metadata } from "next";
import { AccountSection } from "@/features/account/account-section";
import { PageHeader } from "@/ui/page-header";
import { SettingsSection } from "@/ui/settings-section";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" />
      <div>
        <AccountSection />
        <SettingsSection
          title="Data"
          description="This browser keeps its own copy of your skills and sessions."
        >
          <p>
            The app reads from this copy, so it works offline. Signed out,
            clearing this site&apos;s data in your browser deletes it; signed
            in, your account keeps a copy.
          </p>
        </SettingsSection>
      </div>
    </>
  );
}
