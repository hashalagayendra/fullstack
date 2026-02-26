"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type EstimateStatus = "Draft" | "Approved" | "Sent" | "Accepted";
export type EstimateType = "draft" | "active";

export interface Estimate {
  id: number;
  number: string;
  date: string;
  customer: string;
  amount: string;
  status: EstimateStatus;
  type: EstimateType;
  validUntil?: string;
}

interface EstimatesContextType {
  estimates: Estimate[];
  addEstimate: (estimate: Estimate) => void;
  updateEstimate: (id: number, updates: Partial<Estimate>) => void;
}

const EstimatesContext = createContext<EstimatesContextType | null>(null);

export function EstimatesProvider({ children }: { children: ReactNode }) {
  const [estimates, setEstimates] = useState<Estimate[]>([]);

  const addEstimate = (estimate: Estimate) => {
    setEstimates((prev) => [estimate, ...prev]);
  };

  const updateEstimate = (id: number, updates: Partial<Estimate>) => {
    setEstimates((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    );
  };

  return (
    <EstimatesContext.Provider
      value={{ estimates, addEstimate, updateEstimate }}
    >
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
