"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useWallet } from "@/components/providers/wallet-provider";
import { BrandLogo } from "@/components/shell/brand-logo";
import {
  readProgress,
  writeProgress,
  useOnboarding,
  type DoctorProfile,
} from "@/lib/onboarding/store";
import { WalletButton } from "@/components/shell/wallet-button";
import { ProgressBar } from "@/components/onboarding/progress-bar";
import { StepIdentity } from "@/components/onboarding/step-identity";
import { StepPractice } from "@/components/onboarding/step-practice";
import { StepCredentials } from "@/components/onboarding/step-credentials";
import { StepSampleConsult } from "@/components/onboarding/step-sample-consult";
import { StepCelebration } from "@/components/onboarding/step-celebration";
import type { ProfileSealState } from "@/components/onboarding/step-celebration";
import { OnboardingAside } from "@/components/onboarding/onboarding-aside";
import {
  buildPracticeProfileArtifact,
  isPracticeProfileArtifact,
  profileArtifactHash,
} from "@/lib/onboarding/profile-artifact";
import {
  ZEROG_RPC,
  encodeRegisterPracticeProfile,
  findLatestPracticeProfileRegistration,
  requireRegistryAddress,
  waitForRegistryReceipt,
} from "@/lib/0g/registry";

const TOTAL_STEPS = 5;

export default function OnboardingPage() {
  const router = useRouter();
  const { ready, connected, resolving, address, sendTransaction } = useWallet();
  const { save, status } = useOnboarding();
  const [allowRerun] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("rerun") === "1",
  );

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [clinic, setClinic] = useState("");
  const [city, setCity] = useState("");
  const [languages, setLanguages] = useState<string[]>(["Tamil", "Hindi", "English"]);
  const [specialty, setSpecialty] = useState("");
  const [motivation, setMotivation] = useState("Reduce after-hours note writing");
  const [degrees, setDegrees] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [registrationCouncil, setRegistrationCouncil] = useState("");
  const [sampleConsultReviewed, setSampleConsultReviewed] = useState(false);
  const [seal, setSeal] = useState<ProfileSealState>({ status: "idle" });
  const [hydrated, setHydrated] = useState(false);
  const finishing = useRef(false);
  const recovering = useRef(false);

  useEffect(() => {
    if (ready && !connected && !resolving) router.replace("/");
  }, [ready, connected, resolving, router]);

  useEffect(() => {
    if (ready && connected && status === "done" && !allowRerun) {
      router.replace("/dashboard");
    }
  }, [allowRerun, ready, connected, router, status]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      if (!address) {
        setHydrated(true);
        return;
      }
      const saved = readProgress(address);
      if (saved) {
        if (saved.step >= 1 && saved.step <= TOTAL_STEPS) setStep(saved.step);
        if (saved.name) setName(saved.name);
        if (saved.clinic) setClinic(saved.clinic);
        if (saved.city) setCity(saved.city);
        if (saved.languages?.length) setLanguages(saved.languages);
        if (saved.specialty) setSpecialty(saved.specialty);
        if (saved.motivation) setMotivation(saved.motivation);
        if (saved.degrees) setDegrees(saved.degrees);
        if (saved.registrationNumber) setRegistrationNumber(saved.registrationNumber);
        if (saved.registrationCouncil) setRegistrationCouncil(saved.registrationCouncil);
        if (saved.sampleConsultReviewed) setSampleConsultReviewed(saved.sampleConsultReviewed);
      }
      setHydrated(true);
    });
    return () => { cancelled = true; };
  }, [address]);

  useEffect(() => {
    if (!hydrated || !address) return;
    writeProgress(address, {
      step,
      name,
      clinic,
      city,
      languages,
      specialty,
      motivation,
      degrees,
      registrationNumber,
      registrationCouncil,
      sampleConsultReviewed,
    });
  }, [
    hydrated,
    address,
    step,
    name,
    clinic,
    city,
    languages,
    specialty,
    motivation,
    degrees,
    registrationNumber,
    registrationCouncil,
    sampleConsultReviewed,
  ]);

  function currentProfile(): DoctorProfile {
    return {
      name: name.trim(),
      clinic: clinic.trim(),
      city: city.trim(),
      specialty: specialty.trim(),
      languages,
      motivation,
      degrees: degrees.trim(),
      registrationNumber: registrationNumber.trim(),
      registrationCouncil: registrationCouncil.trim(),
      sampleConsultReviewed,
    };
  }

  const recoverRegisteredProfile = useCallback(
    async ({ redirect = true }: { redirect?: boolean } = {}) => {
      if (!address) return null;
      const registration = await findLatestPracticeProfileRegistration(address);
      if (!registration) return null;

      const res = await fetch(`/api/0g/download?root=${registration.rootHash}`, { cache: "no-store" });
      const artifact = (await res.json().catch(() => null)) as unknown;
      if (!res.ok) {
        throw new Error(
          `0G Storage download failed for existing profile ${registration.rootHash}: ${JSON.stringify(artifact)}`,
        );
      }
      if (!isPracticeProfileArtifact(artifact)) {
        throw new Error(`0G Storage profile artifact is invalid for ${registration.rootHash}`);
      }
      if (artifact.ownerAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error("0G Storage profile owner does not match the connected wallet");
      }

      const downloadedArtifactHash = profileArtifactHash(artifact);
      if (downloadedArtifactHash.toLowerCase() !== registration.artifactHash.toLowerCase()) {
        throw new Error("0G Storage profile artifact hash does not match the registry event");
      }

      const recoveredProfile: DoctorProfile = {
        name: artifact.doctor.name,
        clinic: artifact.practice.clinic,
        city: artifact.practice.city || "",
        specialty: artifact.doctor.specialty,
        languages: artifact.practice.languages,
        motivation: artifact.practice.motivation,
        degrees: artifact.doctor.degrees || "",
        registrationNumber: artifact.doctor.registrationNumber || "",
        registrationCouncil: artifact.doctor.registrationCouncil || "",
        sampleConsultReviewed: artifact.demo.sampleConsultReviewed,
        profileRootHash: registration.rootHash,
        profileTxHash: isZeroHash(registration.storageTxHash) ? undefined : registration.storageTxHash,
        profileArtifactHash: registration.artifactHash,
        profileStoredAt: artifact.createdAt,
        profileStorageMode: "live",
        profileRegistryAddress: registration.registryAddress,
        profileRegistryTxHash: registration.registryTxHash,
        profileRegistryBlockNumber: registration.registryBlockNumber,
      };
      const recoveredSeal: ProfileSealState = {
        status: "sealed",
        mode: "live",
        rootHash: registration.rootHash,
        txHash: recoveredProfile.profileTxHash,
        storedAt: artifact.createdAt,
        artifactHash: registration.artifactHash,
        registryAddress: registration.registryAddress,
        registryTxHash: registration.registryTxHash,
        registryBlockNumber: registration.registryBlockNumber,
      };

      save(recoveredProfile);
      setSeal(recoveredSeal);
      if (redirect) router.replace("/dashboard");
      return recoveredSeal;
    },
    [address, router, save],
  );

  useEffect(() => {
    if (!ready || !connected || !address || status !== "needed" || allowRerun || recovering.current) return;
    recovering.current = true;
    setSeal({
      status: "sealing",
      stage: "checking",
      message: "Checking 0G Chain for an existing practice profile",
    });
    recoverRegisteredProfile()
      .then((recovered) => {
        if (!recovered) setSeal({ status: "idle" });
      })
      .catch((error) => {
        setSeal({
          status: "error",
          message: `0G profile recovery failed: ${(error as Error).message}`,
        });
      })
      .finally(() => {
        recovering.current = false;
      });
  }, [address, allowRerun, connected, ready, recoverRegisteredProfile, status]);

  async function sealProfile() {
    if (!address || seal.status === "sealing") return;
    setSeal({
      status: "sealing",
      stage: "checking",
      message: "Checking 0G registry and wallet readiness",
    });
    const baseProfile = currentProfile();
    const artifact = buildPracticeProfileArtifact(baseProfile, address);
    const artifactHash = profileArtifactHash(artifact);

    try {
      const registryAddress = requireRegistryAddress();
      const recovered = await recoverRegisteredProfile({ redirect: false });
      if (recovered) return;
      await assertWalletHasGas(address);

      setSeal({
        status: "sealing",
        stage: "storage",
        message: "Uploading PracticeProfile artifact to 0G Storage",
      });
      const res = await fetch("/api/practice-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artifact }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "upload failed");
      const stored = (await res.json()) as {
        rootHash: string;
        txHash?: string;
        storedAt: string;
        mode: "live";
      };
      const data = encodeRegisterPracticeProfile({
        rootHash: stored.rootHash,
        artifactHash,
        storageTxHash: stored.txHash,
      });
      setSeal({
        status: "sealing",
        stage: "signature",
        message: "Waiting for your wallet to sign the 0G Chain registration",
      });
      const registryTxHash = await sendTransaction({ to: registryAddress, data });
      setSeal({
        status: "sealing",
        stage: "confirming",
        message: "Waiting for 0G Chain confirmation",
      });
      const receipt = await waitForRegistryReceipt(registryTxHash);
      if (receipt.status !== "0x1") {
        throw new Error(`0G registry transaction reverted: ${registryTxHash}`);
      }
      const nextProfile: DoctorProfile = {
        ...baseProfile,
        profileRootHash: stored.rootHash,
        profileTxHash: stored.txHash,
        profileArtifactHash: artifactHash,
        profileStoredAt: stored.storedAt,
        profileStorageMode: "live",
        profileRegistryAddress: registryAddress,
        profileRegistryTxHash: registryTxHash,
        profileRegistryBlockNumber: receipt.blockNumber,
      };
      save(nextProfile);
      setSeal({
        status: "sealed",
        mode: "live",
        rootHash: stored.rootHash,
        txHash: stored.txHash,
        storedAt: stored.storedAt,
        artifactHash,
        registryAddress,
        registryTxHash,
        registryBlockNumber: receipt.blockNumber,
      });
    } catch (error) {
      setSeal({
        status: "error",
        message: `0G profile registration failed: ${(error as Error).message}`,
      });
    }
  }

  function complete(dest: "/app" | "/dashboard") {
    if (finishing.current || seal.status !== "sealed") return;
    finishing.current = true;
    const profile: DoctorProfile = {
      ...currentProfile(),
      profileRootHash: seal.rootHash,
      profileTxHash: seal.txHash,
      profileArtifactHash: seal.artifactHash,
      profileStoredAt: seal.storedAt,
      profileStorageMode: seal.mode,
      profileRegistryAddress: seal.registryAddress,
      profileRegistryTxHash: seal.registryTxHash,
      profileRegistryBlockNumber: seal.registryBlockNumber,
    };
    save(profile);
    router.replace(dest);
  }

  if (!ready || resolving || !connected) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="flex items-center gap-2 text-ink-muted">
          <Loader2 className="size-4 animate-spin text-jade" />
          <span className="ds-mono text-xs">loading onboarding</span>
        </div>
      </div>
    );
  }

  const profile: DoctorProfile = {
    name: name.trim() || "Doctor",
    clinic: clinic.trim() || "Your clinic",
    city: city.trim(),
    specialty: specialty.trim(),
    languages,
    motivation,
    degrees,
    registrationNumber,
    registrationCouncil,
    sampleConsultReviewed,
  };

  return (
    <div className="relative min-h-screen bg-bg text-ink">
      <ProgressBar step={step} totalSteps={TOTAL_STEPS} />

      <header className="flex items-center justify-between border-b border-border px-6 py-4 lg:px-8">
        <BrandLogo href="/" size="lg" />
        <WalletButton />
      </header>

      <div className="grid lg:grid-cols-2">
        <div className="flex min-h-[calc(100vh-65px)] flex-col justify-center px-6 py-10 lg:px-12">
          <div className="w-full max-w-lg">
            {step === 1 && (
              <StepIdentity
                values={{ name, clinic, city }}
                onChange={(p) => {
                  if (p.name !== undefined) setName(p.name);
                  if (p.clinic !== undefined) setClinic(p.clinic);
                  if (p.city !== undefined) setCity(p.city);
                }}
                onContinue={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <StepPractice
                values={{ languages, specialty, motivation }}
                onChange={(p) => {
                  if (p.languages !== undefined) setLanguages(p.languages);
                  if (p.specialty !== undefined) setSpecialty(p.specialty);
                  if (p.motivation !== undefined) setMotivation(p.motivation);
                }}
                onContinue={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <StepCredentials
                values={{ degrees, registrationNumber, registrationCouncil }}
                onChange={(p) => {
                  if (p.degrees !== undefined) setDegrees(p.degrees);
                  if (p.registrationNumber !== undefined) setRegistrationNumber(p.registrationNumber);
                  if (p.registrationCouncil !== undefined) setRegistrationCouncil(p.registrationCouncil);
                }}
                onContinue={() => setStep(4)}
                onBack={() => setStep(2)}
              />
            )}
            {step === 4 && (
              <StepSampleConsult
                onContinue={() => {
                  setSampleConsultReviewed(true);
                  setStep(5);
                }}
                onBack={() => setStep(3)}
              />
            )}
            {step === 5 && (
              <StepCelebration profile={profile} address={address} seal={seal} onSeal={sealProfile} onComplete={complete} />
            )}
          </div>
        </div>

        <div className="hidden min-h-[calc(100vh-65px)] overflow-hidden border-l border-border bg-surface-3 lg:block">
          <OnboardingAside step={step} />
        </div>
      </div>
    </div>
  );
}

function isZeroHash(value: string) {
  return /^0x0{64}$/i.test(value);
}

async function assertWalletHasGas(address: string) {
  const res = await fetch(ZEROG_RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_getBalance",
      params: [address, "latest"],
    }),
  });
  const json = (await res.json()) as { result?: string; error?: { message?: string } };
  if (json.error) throw new Error(json.error.message || "0G wallet balance check failed");
  const balance = BigInt(json.result || "0x0");
  if (balance <= BigInt(0)) {
    throw new Error(`Connected wallet ${address} has no native 0G for gas`);
  }
}
