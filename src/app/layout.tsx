import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AppShell } from "@/ui/app-shell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "pomoapp", template: "%s · pomoapp" },
  description:
    "A pomodoro timer that tracks your path to 10,000 hours per skill.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
