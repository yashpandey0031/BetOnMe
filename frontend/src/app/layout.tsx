import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import WalletProvider from "@/components/WalletProvider";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });

export const metadata: Metadata = {
  title: "VeriStake | Decentralized Credibility Layer",
  description: "A market-driven trust system on Monad testnet.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${space.variable}`}>
      <body>
        <WalletProvider>
          <Navbar />
          <main className="mx-auto min-h-[calc(100vh-64px)] w-full max-w-6xl px-4 py-8">
            {children}
          </main>
        </WalletProvider>
      </body>
    </html>
  );
}
