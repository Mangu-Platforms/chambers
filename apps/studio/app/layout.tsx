import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Chambers Studio",
    template: "%s · Chambers Studio",
  },
  description:
    "The calm resume studio. Edit, preview live on real letter paper, export ATS-clean PDF, DOCX and text.",
};

export const viewport: Viewport = {
  themeColor: "#F5F5F7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
