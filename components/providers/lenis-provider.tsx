"use client";

import { ReactLenis } from "lenis/react";

export function LenisProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.09, duration: 1.1, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
