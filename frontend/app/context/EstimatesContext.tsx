"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface Estimate {
  id: number;
  number: string;
  date: string;
  customer: string;
  amount: string;
  status: "Draft";
  type: "draft";
}

interface EstimatesContextType {
  estimates: Estimate[];
  addEstimate: (estimate: Estimate) => void;
}

const EstimatesContext = createContext<EstimatesContextType | null>(null);

export function EstimatesProvider({ children }: { children: ReactNode }) {
  const [estimates, setEstimates] = useState<Estimate[]>([]);

  const addEstimate = (estimate: Estimate) => {
    setEstimates((prev) => [estimate, ...prev]);
  };

  return (
    <EstimatesContext.Provider value={{ estimates, addEstimate }}>
      {children}
    </EstimatesContext.Provider>
  );
}

export function useEstimates() {
  const ctx = useContext(EstimatesContext);
  if (!ctx)
    throw new Error("useEstimates must be used within EstimatesProvider");
  return ctx;
}
