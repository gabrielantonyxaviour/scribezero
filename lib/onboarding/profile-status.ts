export type DoctorProfileCompletionCandidate = {
  [key: string]: unknown;
  name?: string;
  profileRootHash?: string;
  profileArtifactHash?: string;
  profileStoredAt?: string;
  profileStorageMode?: "live";
  profileRegistryAddress?: string;
  profileRegistryTxHash?: string;
  profileRegistryBlockNumber?: number;
};

export function hasCompleteDoctorProfileReceipt(
  profile: DoctorProfileCompletionCandidate | null | undefined,
) {
  return Boolean(
    profile?.name?.trim() &&
      profile.profileStorageMode === "live" &&
      profile.profileRootHash &&
      profile.profileArtifactHash &&
      profile.profileStoredAt &&
      profile.profileRegistryAddress &&
      profile.profileRegistryTxHash &&
      typeof profile.profileRegistryBlockNumber === "number",
  );
}
