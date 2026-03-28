import type { Metadata } from "next";
import { IBM_Plex_Sans, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import WalletProvider from "@/components/WalletProvider";
import Navbar from "@/components/Navbar";

const display = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
});
const body = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "BetOnMe | Bet On Your Reputation",
  description: "Your reputation is at stake on Monad testnet.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
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
