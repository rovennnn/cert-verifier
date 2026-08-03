import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Sealmark — On-Chain Verification",
  description:
    "Register a document's hash on-chain and let anyone verify it's authentic and untampered, without trusting a central database.",
  openGraph: {
    title: "Sealmark — On-Chain Verification",
    description:
      "Register a document's hash on-chain and let anyone verify it's authentic and untampered, without trusting a central database.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body antialiased">
        <Nav />
        {children}
      </body>
    </html>
  );
}
