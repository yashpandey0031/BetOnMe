"use client";

import { useState } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseAbi } from 'viem';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { CONTRACT_ADDRESS, VERISTAKE_ABI } from '@/lib/constants';
import { Bot, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function CreateProfile() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const { writeContract, data: hash, isPending: isWriting, error: writeError } = useWriteContract();
  const { isLoading: isWaiting, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleGenerateAi = async () => {
    if (!description) return;
    setIsGeneratingAi(true);
    // Simulate AI endpoint call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    const buzzwords = ['builder', 'web3', 'founder', 'crypto'];
    const hasBuzz = buzzwords.some(b => description.toLowerCase().includes(b));
    setAiSummary(hasBuzz ? "AI Analysis: Claims align with common Web3 builder narratives. High potential for active contribution, but reputation should be continuously monitored." : "AI Analysis: General profile. Claims are neutral. Verification depends heavily on future continuous community staking.");
    setIsGeneratingAi(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: parseAbi(VERISTAKE_ABI),
      functionName: 'createProfile',
      args: [name, description],
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">Create <span className="text-gradient">Profile</span></h1>
        
        {isSuccess ? (
          <div className="bg-positive/10 border border-positive/30 rounded-xl p-8 text-center animate-in fade-in zoom-in duration-500">
            <CheckCircle2 className="w-16 h-16 text-positive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Profile Created!</h2>
            <p className="text-foreground/70 mb-6">Your identity is now anchored on the Monad testnet.</p>
            <button
              onClick={() => router.push('/')}
              className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-6 bg-card border border-border rounded-xl p-6 sm:p-8">
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground/80">Name / Alias</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors font-medium"
                placeholder="e.g. Satoshi Nakamoto"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground/80">Claim / Background</label>
              <textarea
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary transition-colors text-sm resize-none"
                placeholder="What are your credentials? Why should people trust you?"
              />
            </div>

            <div className="bg-background/50 border border-primary/20 rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-sm">AI Credibility Analyzer</span>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateAi}
                  disabled={isGeneratingAi || !description}
                  className="text-xs bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                >
                  {isGeneratingAi ? 'Analyzing...' : 'Generate Summary'}
                </button>
              </div>
              
              {isGeneratingAi ? (
                <div className="flex items-center gap-3 text-sm text-foreground/50 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  Parsing semantics and historical context...
                </div>
              ) : aiSummary ? (
                <p className="text-sm font-medium text-foreground/80 leading-relaxed border-l-2 border-primary pl-3 py-1 animate-in slide-in-from-left-2">{aiSummary}</p>
              ) : (
                <p className="text-xs text-foreground/40 italic">Enter a description and click Generate to analyze claims.</p>
              )}
            </div>

            {writeError && (
              <div className="flex items-center gap-2 text-negative text-sm bg-negative/10 border border-negative/20 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="line-clamp-2">{writeError.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isWriting || isWaiting || !name || !description}
              className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-lg font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:shadow-none"
            >
              {(isWriting || isWaiting) && <Loader2 className="w-5 h-5 animate-spin" />}
              {isWaiting ? 'Confirming on Monad...' : isWriting ? 'Waiting for Wallet...' : 'Create Decentralized Identity'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
