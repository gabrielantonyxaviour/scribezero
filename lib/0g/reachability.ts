export function isStorageReachableStatus(status: number): boolean {
  return status >= 200 && status < 300;
}
