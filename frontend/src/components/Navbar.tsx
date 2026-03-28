import Link from "next/link";
import WalletConnect from "@/components/WalletConnect";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="group flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-positive shadow-[0_0_20px_rgba(57,255,144,0.8)]" />
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-white/70">
              Monad Testnet
            </p>
            <h1 className="text-lg font-bold text-white transition group-hover:text-primary">
              VeriStake
            </h1>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/profile/create"
            className="rounded-md border border-primary/60 bg-primary/20 px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary/35"
          >
            Create Profile
          </Link>
          <WalletConnect />
        </nav>
      </div>
    </header>
  );
}
