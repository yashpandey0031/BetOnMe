import Link from "next/link";
import WalletConnect from "@/components/WalletConnect";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-bg/90 backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="group flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-positive shadow-[0_0_20px_rgba(20,241,149,0.8)]" />
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.32em] text-white/55">
              Monad Testnet
            </p>
            <h1 className="text-xl font-bold text-white transition group-hover:text-primary">
              BetOnMe
            </h1>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/profile/create"
            className="rounded-md border border-primary/50 bg-primary/20 px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primary/35"
          >
            Create Profile
          </Link>
          <WalletConnect />
        </nav>
      </div>
    </header>
  );
}
