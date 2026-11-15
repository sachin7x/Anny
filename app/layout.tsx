import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "ANY | Speak. It’s done.", template: "%s | ANY" },
  description: "Turn speech into polished text anywhere you write. Meet ANY, your AI voice workspace.",
  applicationName: "ANY"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
