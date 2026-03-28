"use client";

import { useReadContract } from 'wagmi';
import { parseAbi } from 'viem';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { CONTRACT_ADDRESS, VERISTAKE_ABI } from '@/lib/constants';
import { TrendingUp, TrendingDown, Users, ArrowRight } from 'lucide-react';
import { formatEther } from 'viem';

export default function Home() {
  const { data: profiles, isLoading } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: parseAbi(VERISTAKE_ABI),
    functionName: 'getAllProfiles',
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            <span className="text-gradient">Decentralized</span> Credibility
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Stake on reputation. Call out fake credibility. Build a verifiable layer of trust for the internet, powered by Monad's high-speed consensus.
          </p>
        </div>

        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Active Profiles
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-xl bg-card animate-pulse border border-border" />
            ))}
          </div>
        ) : !profiles || profiles.length === 0 ? (
          <div className="text-center py-24 bg-card rounded-xl border border-border border-dashed">
            <p className="text-foreground/50 mb-4">No profiles found.</p>
            <Link href="/profile/create" className="text-primary hover:underline">
              Be the first to create one
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(profiles as any[]).map((profile) => {
              const stakeFor = Number(formatEther(profile.totalStakeFor));
              const stakeAgainst = Number(formatEther(profile.totalStakeAgainst));
              const total = stakeFor + stakeAgainst;
              const repScore = stakeFor - stakeAgainst;
              
              return (
                <Link key={profile.id.toString()} href={`/profile/${profile.id}`}>
                  <div className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.1)] relative overflow-hidden flex flex-col h-full">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <h3 className="text-xl font-bold mb-2">{profile.name}</h3>
                    <p className="text-sm text-foreground/70 line-clamp-2 mb-6 flex-grow">
                      {profile.description}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex flex-col">
                        <span className="text-xs text-foreground/50 uppercase font-semibold">Reputation</span>
                        <span className={`text-lg font-bold flex items-center gap-1 ${repScore >= 0 ? 'text-positive' : 'text-negative'}`}>
                          {repScore >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {Math.abs(repScore).toFixed(4)} MON
                        </span>
                      </div>
                      <div className="bg-background rounded-full p-2 group-hover:bg-primary/20 transition-colors">
                        <ArrowRight className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
