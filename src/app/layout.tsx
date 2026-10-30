import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { AppDataProvider } from "@/data/provider";
import { AppShell } from "@/ui/app-shell";
import "./globals.css";

const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });
const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "pomoapp", template: "%s · pomoapp" },
  description:
    "A pomodoro timer that tracks your path to 10,000 hours per skill.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${nunito.variable} ${fredoka.variable} h-full`}>
      <body className="min-h-full">
        <AppDataProvider>
          <AppShell>{children}</AppShell>
        </AppDataProvider>
      </body>
    </html>
  );
}
