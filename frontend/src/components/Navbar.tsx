import Link from "next/link";
import WalletConnect from "@/components/WalletConnect";

export default function Navbar() {
  return (
    <header className="sticky top-3 z-30 px-4 lg:px-6">
      <div className="mx-auto w-full max-w-[90rem]">
        <div className="flex items-center justify-between rounded-2xl border border-white/15 bg-bg/70 px-4 py-3 shadow-[0_8px_28px_rgba(0,0,0,0.32)] backdrop-blur-xl">
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
              className="rounded-xl border border-primary/50 bg-primary/20 px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-primary/35"
            >
              Create Profile
            </Link>
            <WalletConnect />
          </nav>
        </div>
      </div>
    </header>
  );
}
