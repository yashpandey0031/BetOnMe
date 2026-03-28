"use client";

import dynamic from "next/dynamic";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { type CloudinaryUploadWidgetResults } from "next-cloudinary";
import { decodeEventLog } from "viem";
import { veriStakeAbi } from "@/lib/abi";
import { VERISTAKE_ADDRESS } from "@/lib/constants";

// Import dynamically to avoid build-time cloud name requirement
const CldUploadWidget = dynamic(
  () => import("next-cloudinary").then((m) => m.CldUploadWidget),
  { ssr: false },
);

// Default placeholder images for fallback
const PLACEHOLDER_IMAGES = [
  "/download%20(4).jpg",
  "/download%20(5).jpg",
  "/Alternates%20in%20graphics%20variants%20%F0%9F%A4%9F%F0%9F%8F%BD%E2%9C%A8_%23art%20%23cameraroll.jpg",
  "/%D0%9D%D0%B0%20%D0%B0%D0%B2%D1%83.jpg",
  "/placeholder-5.svg",
];

const legacyCreateProfileAbi = [
  {
    inputs: [
      { internalType: "string", name: "name", type: "string" },
      { internalType: "string", name: "description", type: "string" },
    ],
    name: "createProfile",
    outputs: [{ internalType: "uint256", name: "profileId", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export default function CreateProfilePage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function createProfile(event: FormEvent) {
    event.preventDefault();
    if (!publicClient || !isConnected || !address) return;

    try {
      setBusy(true);
      setMessage("Submitting profile on Monad...");

      const currentCount = (await publicClient.readContract({
        address: VERISTAKE_ADDRESS,
        abi: veriStakeAbi,
        functionName: "profileCount",
      })) as bigint;

      // Use Cloudinary URL if available, otherwise use placeholder
      const finalImageUrl =
        imageUrl ||
        PLACEHOLDER_IMAGES[Number(currentCount) % PLACEHOLDER_IMAGES.length];

      let hash: `0x${string}`;
      try {
        await publicClient.estimateContractGas({
          account: address,
          address: VERISTAKE_ADDRESS,
          abi: veriStakeAbi,
          functionName: "createProfile",
          args: [name, description, finalImageUrl],
        });

        hash = await writeContractAsync({
          address: VERISTAKE_ADDRESS,
          abi: veriStakeAbi,
          functionName: "createProfile",
          args: [name, description, finalImageUrl],
        });
      } catch {
        // Fallback for legacy deployments that only accept (name, description).
        setMessage(
          "Legacy contract detected. Creating profile without on-chain image URL...",
        );

        await publicClient.estimateContractGas({
          account: address,
          address: VERISTAKE_ADDRESS,
          abi: legacyCreateProfileAbi,
          functionName: "createProfile",
          args: [name, description],
        });

        hash = await writeContractAsync({
          address: VERISTAKE_ADDRESS,
          abi: legacyCreateProfileAbi,
          functionName: "createProfile",
          args: [name, description],
        });
      }

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      let createdProfileId: bigint | null = null;
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: veriStakeAbi,
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName === "ProfileCreated") {
            createdProfileId = decoded.args.profileId as bigint;
            break;
          }
        } catch {
          // Ignore non-matching logs.
        }
      }

      const targetProfileId = createdProfileId ?? currentCount;
      setMessage("Profile created successfully.");
      router.push(`/profile/${targetProfileId.toString()}`);
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
          Profile Image (Optional)
        </label>
        <div className="mb-4 rounded-md border border-white/15 bg-panelSoft p-3">
          <div className="mb-3 overflow-hidden rounded-md border border-white/10">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Selected profile preview"
                className="h-44 w-full object-cover"
              />
            ) : (
              <div className="flex h-44 items-center justify-center text-sm text-white/55">
                No image uploaded (will use placeholder)
              </div>
            )}
          </div>

          <CldUploadWidget
            uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
            onSuccess={(results: CloudinaryUploadWidgetResults) => {
              if (
                results.event === "success" &&
                typeof results.info === "object" &&
                results.info?.secure_url
              ) {
                setImageUrl(results.info.secure_url);
                setMessage("Image uploaded successfully.");
              }
            }}
            onError={() => {
              setMessage("Image upload failed.");
            }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className="cursor-pointer rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary transition hover:border-primary/60 hover:bg-primary/20"
              >
                Upload to Cloudinary
              </button>
            )}
          </CldUploadWidget>
        </div>

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
