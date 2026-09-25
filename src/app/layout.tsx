import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DockProof — Receiving Manager",
  description: "Record condition on arrival: identity, quantity, damage, and spec against the purchase order.",
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
