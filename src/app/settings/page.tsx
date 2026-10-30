import type { Metadata } from "next";
import { Fragment } from "react";
import { AccountSection } from "@/features/account/account-section";
import { DataSection } from "@/features/backup/data-section";
import { SHORTCUTS } from "@/features/timer/shortcuts";
import {
  SoundSettings,
  TimerSettings,
} from "@/features/timer/components/timer-settings";
import { Kbd } from "@/ui/kbd";
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
          title="Sound and alerts"
          description="Short 8-bit sounds made in the browser, and a nudge when a phase ends while you are elsewhere."
        >
          <SoundSettings />
        </SettingsSection>
        <SettingsSection
          title="Keyboard"
          description="On the timer page, unless you are typing in a field."
        >
          <dl className="grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3">
            {SHORTCUTS.map(({ key, action }) => (
              <Fragment key={key}>
                <dt>
                  <Kbd>{key}</Kbd>
                </dt>
                <dd>{action}</dd>
              </Fragment>
            ))}
          </dl>
        </SettingsSection>
        <AccountSection />
        <DataSection />
      </div>
    </>
  );
}
