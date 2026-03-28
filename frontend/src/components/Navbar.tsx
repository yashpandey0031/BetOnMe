"use client";

import Link from 'next/link';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Wallet, ShieldAlert } from 'lucide-react';

export function Navbar() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <nav className="border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <ShieldAlert className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-bold text-xl tracking-tight text-gradient">VeriStake</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/profile/create" className="text-sm font-medium hover:text-primary transition-colors">
            Create Profile
          </Link>
          
          {isConnected ? (
            <button
              onClick={() => disconnect()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border hover:border-negative/50 hover:bg-negative/10 transition-all text-sm font-medium"
            >
              <Wallet className="w-4 h-4" />
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </button>
          ) : (
            <button
              onClick={() => connect({ connector: injected() })}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white transition-all text-sm font-medium shadow-[0_0_15px_rgba(99,102,241,0.5)]"
            >
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
