import type { Metadata } from "next";
import { AccountSection } from "@/features/account/account-section";
import { DataSection } from "@/features/backup/data-section";
import {
  SoundSettings,
  TimerSettings,
} from "@/features/timer/components/timer-settings";
import { PageHeader } from "@/ui/page-header";
import { SettingsSection } from "@/ui/settings-section";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" />
      <div>
        <SettingsSection
          title="Timer"
          description="How long each phase lasts, saved as you change it. A phase already under way keeps its length."
        >
          <TimerSettings />
        </SettingsSection>
        <SettingsSection
          title="Sound"
          description="Short 8-bit sounds, made in the browser."
        >
          <SoundSettings />
        </SettingsSection>
        <AccountSection />
        <DataSection />
      </div>
    </>
  );
}
