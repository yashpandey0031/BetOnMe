import { formatEther } from "viem";

export function shortAddress(address: string) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatMon(value: bigint) {
  return Number(formatEther(value)).toFixed(4);
}

export function formatScore(score: bigint) {
  return (Number(score) / 100).toFixed(2);
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
