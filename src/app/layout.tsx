import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DockProof — AI Receiving Manager",
  description: "Evidence-First AI Receiving Manager for the CUBE Buildathon",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
