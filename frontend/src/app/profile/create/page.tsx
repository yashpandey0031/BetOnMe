"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { veriStakeAbi } from "@/lib/abi";
import {
  getRandomPlaceholderImage,
  saveProfileImageForId,
} from "@/lib/profileImages";
import { VERISTAKE_ADDRESS } from "@/lib/constants";

export default function CreateProfilePage() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [summary, setSummary] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setSelectedImage(getRandomPlaceholderImage());
  }, []);

  function assignRandomPlaceholder() {
    setSelectedImage(getRandomPlaceholderImage());
  }

  function onImageUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setSelectedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  async function generateSummary() {
    if (!description.trim()) return;

    try {
      setBusy(true);
      setMessage("Generating credibility summary...");

      const response = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });

      const data = (await response.json()) as { summary: string };
      setSummary(data.summary);
      setMessage("Summary generated.");
    } catch {
      setMessage("Could not generate summary.");
    } finally {
      setBusy(false);
    }
  }

  async function createProfile(event: FormEvent) {
    event.preventDefault();
    if (!publicClient || !isConnected) return;

    try {
      setBusy(true);
      setMessage("Submitting profile on Monad...");

      const finalDescription = summary
        ? `${description}\n\nAI Summary: ${summary}`
        : description;

      const currentCount = (await publicClient.readContract({
        address: VERISTAKE_ADDRESS,
        abi: veriStakeAbi,
        functionName: "profileCount",
      })) as bigint;

      const hash = await writeContractAsync({
        address: VERISTAKE_ADDRESS,
        abi: veriStakeAbi,
        functionName: "createProfile",
        args: [name, finalDescription],
      });

      await publicClient.waitForTransactionReceipt({ hash });
      saveProfileImageForId(
        currentCount,
        selectedImage || getRandomPlaceholderImage(),
      );
      setMessage("Profile created successfully.");
      router.push(`/profile/${currentCount.toString()}`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Profile creation failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h2 className="text-4xl font-bold text-white">
          Create Reputation Profile
        </h2>
        <p className="mt-2 text-sm text-white/70">
          Register a person in the public credibility market.
        </p>
      </div>

      <form onSubmit={createProfile} className="glass-card p-5 shadow-glow">
        <label className="mb-2 block text-sm text-white/80">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Example: Investigative Journalist A"
          className="mb-4 w-full rounded-md border border-white/15 bg-panelSoft px-3 py-2 text-white outline-none transition focus:border-primary"
          required
        />

        <label className="mb-2 block text-sm text-white/80">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Who is this person and what are the key claims about credibility?"
          className="mb-3 h-28 w-full rounded-md border border-white/15 bg-panelSoft px-3 py-2 text-white outline-none transition focus:border-primary"
          required
        />

        <label className="mb-2 block text-sm text-white/80">
          Profile Image
        </label>
        <div className="mb-4 rounded-md border border-white/15 bg-panelSoft p-3">
          <div className="mb-3 overflow-hidden rounded-md border border-white/10">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Selected profile preview"
                className="h-44 w-full object-cover"
              />
            ) : (
              <div className="flex h-44 items-center justify-center text-sm text-white/55">
                No image selected yet
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <label className="cursor-pointer rounded-md border border-white/20 bg-panel px-3 py-2 text-xs font-semibold text-white transition hover:border-white/40">
              Upload Image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onImageUpload}
              />
            </label>
            <button
              type="button"
              onClick={assignRandomPlaceholder}
              className="rounded-md border border-primary/50 bg-primary/20 px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary/35"
            >
              Use Random Placeholder
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={generateSummary}
          disabled={busy || !description.trim()}
          className="mb-3 rounded-md border border-primary/50 bg-primary/20 px-3 py-2 text-sm font-semibold text-white transition hover:bg-primary/35 disabled:opacity-40"
        >
          Generate AI Credibility Summary
        </button>

        {summary && (
          <div className="mb-4 rounded-md border border-primary/40 bg-primary/10 p-3 text-sm text-white/90">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              AI Summary
            </p>
            <p>{summary}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!isConnected || busy}
          className="w-full rounded-md border border-primary/60 bg-primary px-4 py-2 font-semibold text-white transition hover:bg-primarySoft disabled:opacity-40"
        >
          {busy ? "Submitting..." : "Create Profile On-Chain"}
        </button>

        {!isConnected && (
          <p className="mt-3 text-xs text-white/60">Connect MetaMask first.</p>
        )}
        {message && <p className="mt-3 text-xs text-white/80">{message}</p>}
      </form>
    </section>
  );
}
