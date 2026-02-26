"use client";

import { EstimatesProvider } from "../context/EstimatesContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <EstimatesProvider>{children}</EstimatesProvider>;
}
