"use client";

import { useState } from 'react';
import { useReadContract, useWriteContract, useAccount } from 'wagmi';
import { parseAbi, formatEther, parseEther } from 'viem';
import { Navbar } from '@/components/Navbar';
import { CONTRACT_ADDRESS, VERISTAKE_ABI } from '@/lib/constants';
import { TrendingUp, TrendingDown, ShieldCheck, Zap, AlertCircle, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function ProfileView({ params }: { params: { id: string } }) {
  const profileId = BigInt(params.id);
  const { isConnected } = useAccount();
  
  const [stakeAmount, setStakeAmount] = useState('0.1');
  const [reason, setReason] = useState('');
  const [isSimulatingBurst, setIsSimulatingBurst] = useState(false);
  const [burstCount, setBurstCount] = useState(0);

  const { data: profile, refetch: refetchProfile } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: parseAbi(VERISTAKE_ABI),
    functionName: 'profiles',
    args: [profileId],
  });

  const { data: stakes, refetch: refetchStakes } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: parseAbi(VERISTAKE_ABI),
    functionName: 'getStakes',
    args: [profileId],
  });

  const { writeContractAsync } = useWriteContract();

  const handleStake = async (isFor: boolean) => {
    if (!reason || !stakeAmount) return;
    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: parseAbi(VERISTAKE_ABI),
        functionName: 'stake',
        args: [profileId, isFor, reason],
        value: parseEther(stakeAmount),
      });
      // In a real app we wait for tx receipt before refetching
      setTimeout(() => {
        refetchProfile();
        refetchStakes();
      }, 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const simulateBurst = async () => {
    setIsSimulatingBurst(true);
    setBurstCount(0);
    const totalSimulations = 20;
    
    // Simulate high-throughput by incrementing counter rapidly
    for (let i = 1; i <= totalSimulations; i++) {
      await new Promise(r => setTimeout(r, 80)); // 80ms delay simulates fast finality streaming
      setBurstCount(i);
    }
    
    setTimeout(() => {
      setIsSimulatingBurst(false);
      setBurstCount(0);
    }, 2000);
  };

  if (!profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  const stakeFor = Number(formatEther(profile[4] || 0n));
  const stakeAgainst = Number(formatEther(profile[5] || 0n));
  const repScore = stakeFor - stakeAgainst;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile & Reputation */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-card border border-border rounded-xl p-8 relative overflow-hidden flex flex-col md:flex-row gap-8 items-start">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
            
            <div className="flex-grow z-10">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-8 h-8 text-primary" />
                <h1 className="text-4xl font-extrabold">{profile[2] as string}</h1>
              </div>
              <p className="text-foreground/80 text-lg leading-relaxed mb-6">
                {profile[3] as string}
              </p>
              <div className="inline-flex items-center gap-2 bg-background border border-border px-4 py-2 rounded-lg text-sm text-foreground/50">
                <span className="font-mono">{String(profile[1]).slice(0, 6)}...{String(profile[1]).slice(-4)}</span>
              </div>
            </div>

            <div className="shrink-0 bg-background border border-border rounded-2xl p-6 text-center w-full md:w-48 relative z-10">
              <p className="text-sm font-bold uppercase tracking-wider text-foreground/50 mb-2">Live Reputation</p>
              <div className={`text-3xl font-black flex items-center justify-center gap-2 ${repScore >= 0 ? 'text-positive' : 'text-negative'}`}>
                {repScore >= 0 ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                {Math.abs(repScore).toFixed(2)}
              </div>
              <p className="text-xs text-foreground/40 mt-1">MON</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Evidence Log
            </h3>
            
            <div className="space-y-4">
              {!stakes || stakes.length === 0 ? (
                <div className="text-center py-8 text-foreground/40 text-sm">No evidence submitted yet.</div>
              ) : (
                (stakes as any[]).map((stake, idx) => (
                  <div key={idx} className="flex gap-4 items-start p-4 rounded-lg bg-background border border-border">
                    <div className={`shrink-0 p-2 rounded-full ${stake.isFor ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'}`}>
                      {stake.isFor ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs text-foreground/50">{String(stake.staker).slice(0, 6)}...</span>
                        <span className="text-xs font-bold">{formatEther(stake.amount)} MON</span>
                      </div>
                      <p className="text-sm text-foreground/90">{stake.reason}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
            <h3 className="text-lg font-bold mb-4">Market Actions</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-foreground/50 block mb-1">Stake Amount (MON)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 font-mono text-lg focus:outline-none focus:border-primary"
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-foreground/40 font-bold text-sm">MON</div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-foreground/50 block mb-1">Evidence / Reason <span className="text-negative">*</span></label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Paste links, proofs, or logical reasoning..."
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-primary resize-none h-24"
                />
              </div>

              {!isConnected ? (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-center text-sm font-medium text-primary">
                  Connect Wallet to Stake
                </div>
              ) : (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleStake(true)}
                    disabled={!reason || !stakeAmount}
                    className="flex-1 bg-positive/10 hover:bg-positive/20 border border-positive/30 text-positive font-bold py-3 rounded-lg flex flex-col items-center gap-1 transition-all disabled:opacity-50"
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span>Stake FOR</span>
                  </button>
                  <button
                    onClick={() => handleStake(false)}
                    disabled={!reason || !stakeAmount}
                    className="flex-1 bg-negative/10 hover:bg-negative/20 border border-negative/30 text-negative font-bold py-3 rounded-lg flex flex-col items-center gap-1 transition-all disabled:opacity-50"
                  >
                    <TrendingDown className="w-5 h-5" />
                    <span>Stake AGAINST</span>
                  </button>
                </div>
              )}
            </div>

            <hr className="border-border my-6 -mx-6" />

            {/* Monad Burst Demostration */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  Monad Burst Demo
                </h4>
              </div>
              <p className="text-xs text-foreground/50 mb-4">
                Simulate 20 rapid stake consensus updates to experience Monad testnet's 10,000 TPS finality.
              </p>
              
              <button
                onClick={simulateBurst}
                disabled={isSimulatingBurst}
                className="w-full relative overflow-hidden bg-background border border-border hover:border-amber-400/50 text-foreground py-3 rounded-lg font-bold text-sm transition-all"
              >
                {isSimulatingBurst ? (
                  <span className="flex items-center justify-center gap-2 text-amber-400">
                    <Zap className="w-4 h-4 animate-pulse fill-amber-400" />
                    Processing {burstCount} / 20 TXs...
                  </span>
                ) : (
                  <span>Simulate Market Frenzy</span>
                )}
                
                {isSimulatingBurst && (
                  <div 
                    className="absolute bottom-0 left-0 h-1 bg-amber-400 transition-all duration-75"
                    style={{ width: `${(burstCount / 20) * 100}%` }}
                  />
                )}
              </button>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
