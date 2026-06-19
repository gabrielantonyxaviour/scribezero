/** Display helpers for hashes, addresses, timestamps. */

export function truncMid(value: string, head = 6, tail = 4): string {
  if (!value) return "";
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

/** 0x9a3f7e…c1 — keeps the 0x, shows a little more head for hashes. */
export function truncHash(value: string, head = 6, tail = 2): string {
  return truncMid(value, head, tail);
}

/** 0x7a4f…e3f2 */
export function truncAddress(value: string): string {
  return truncMid(value, 6, 4);
}

/** "19 Jun 2026 · 16:42 IST" */
export function formatIST(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
  const time = d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });
  return `${date} · ${time} IST`;
}

/** "19 Jun" */
export function formatDayMonth(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    timeZone: "Asia/Kolkata",
  });
}

export const LANGUAGE_LABEL: Record<string, string> = {
  ta: "ta-IN",
  hi: "hi-IN",
  en: "en-IN",
};

export const LANGUAGE_NATIVE: Record<string, string> = {
  ta: "தமிழ்",
  hi: "हिन्दी",
  en: "English",
};
