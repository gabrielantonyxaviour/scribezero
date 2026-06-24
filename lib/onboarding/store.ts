"use client";

import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@/components/providers/wallet-provider";
import { hasCompleteDoctorProfileReceipt } from "./profile-status";

/**
 * Doctor profile, owned by the connected wallet. The browser copy is a local
 * cache for UX; the completed profile must have a live 0G Storage receipt.
 */
export type DoctorProfile = {
  name: string;
  clinic: string;
  city: string;
  specialty: string;
  languages: string[];
  motivation: string;
  degrees: string;
  registrationNumber: string;
  registrationCouncil: string;
  sampleConsultReviewed: boolean;
  profileRootHash?: string;
  profileTxHash?: string;
  profileArtifactHash?: `0x${string}`;
  profileStoredAt?: string;
  profileStorageMode?: "live";
  profileRegistryAddress?: `0x${string}`;
  profileRegistryTxHash?: `0x${string}`;
  profileRegistryBlockNumber?: number;
};

/** In-flight wizard progress (resume after reload/navigation). */
export type OnboardingProgress = {
  step: number;
  name: string;
  clinic: string;
  city: string;
  specialty: string;
  languages: string[];
  motivation: string;
  degrees: string;
  registrationNumber: string;
  registrationCouncil: string;
  sampleConsultReviewed: boolean;
};

const PROFILE_PREFIX = "scribezero:doctor:";
const PROGRESS_PREFIX = "scribezero:onboarding:";

function profileKey(address: string) {
  return `${PROFILE_PREFIX}${address.toLowerCase()}`;
}
function progressKey(address: string) {
  return `${PROGRESS_PREFIX}${address.toLowerCase()}`;
}

export function readProfile(address: string): DoctorProfile | null {
  if (typeof window === "undefined" || !address) return null;
  try {
    const raw = window.localStorage.getItem(profileKey(address));
    return raw ? (JSON.parse(raw) as DoctorProfile) : null;
  } catch {
    return null;
  }
}

export function writeProfile(address: string, profile: DoctorProfile) {
  if (typeof window === "undefined" || !address) return;
  try {
    window.localStorage.setItem(profileKey(address), JSON.stringify(profile));
  } catch {}
}

export function isOnboarded(address: string): boolean {
  const p = readProfile(address);
  return isCompleteDoctorProfile(p);
}

export function isCompleteDoctorProfile(profile: DoctorProfile | null | undefined): profile is DoctorProfile {
  return hasCompleteDoctorProfileReceipt(profile);
}

export function clearProfile(address: string) {
  if (typeof window === "undefined" || !address) return;
  try {
    window.localStorage.removeItem(profileKey(address));
  } catch {}
}

export function readProgress(address: string): OnboardingProgress | null {
  if (typeof window === "undefined" || !address) return null;
  try {
    const raw = window.localStorage.getItem(progressKey(address));
    return raw ? (JSON.parse(raw) as OnboardingProgress) : null;
  } catch {
    return null;
  }
}

export function writeProgress(address: string, progress: OnboardingProgress) {
  if (typeof window === "undefined" || !address) return;
  try {
    window.localStorage.setItem(progressKey(address), JSON.stringify(progress));
  } catch {}
}

export function clearProgress(address: string) {
  if (typeof window === "undefined" || !address) return;
  try {
    window.localStorage.removeItem(progressKey(address));
  } catch {}
}

export type OnboardingStatus = "loading" | "needed" | "done";

/**
 * Reactive onboarding state for the connected wallet. Used by the auth gate
 * and the onboarding wizard.
 */
export function useOnboarding() {
  const { address } = useWallet();
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [hydratedAddress, setHydratedAddress] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      if (!address) {
        setProfile(null);
        setHydratedAddress("");
        return;
      }
      setProfile(readProfile(address));
      setHydratedAddress(address);
    });
    return () => {
      cancelled = true;
    };
  }, [address]);

  const save = useCallback(
    (next: DoctorProfile) => {
      if (!address) return;
      writeProfile(address, next);
      clearProgress(address);
      setProfile(next);
    },
    [address],
  );

  const reset = useCallback(() => {
    if (!address) return;
    clearProfile(address);
    clearProgress(address);
    setProfile(null);
  }, [address]);

  let status: OnboardingStatus = "loading";
  if (hydratedAddress === (address || "")) status = isCompleteDoctorProfile(profile) ? "done" : "needed";

  return { status, profile, save, reset, address };
}

/**
 * Display profile for product surfaces (dashboard greeting, clinic panel).
 * No demo doctor fallback is used; absent fields remain visibly unset.
 */
export function useDoctorProfile() {
  const { profile } = useOnboarding();
  const languageLine = profile?.languages?.length
    ? profile.languages.join(", ")
    : "Languages not set";
  return {
    name: profile?.name?.trim() || "Doctor",
    clinic: profile?.clinic?.trim() || "Clinic not set",
    city: profile?.city?.trim() || "",
    role: profile?.specialty?.trim() || "Specialty not set",
    languageLine,
    credentials: profile?.registrationNumber?.trim() || "Credentials not set",
    profileRootHash: profile?.profileRootHash,
    profileStorageMode: profile?.profileStorageMode,
    profileStoredAt: profile?.profileStoredAt,
    profileRegistryAddress: profile?.profileRegistryAddress,
    profileRegistryTxHash: profile?.profileRegistryTxHash,
    profileRegistryBlockNumber: profile?.profileRegistryBlockNumber,
    isReal: Boolean(profile?.name?.trim()),
  };
}
