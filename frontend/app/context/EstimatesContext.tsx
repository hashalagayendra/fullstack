"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  fetchEstimates as apiFetchEstimates,
  createEstimate as apiCreateEstimate,
  updateEstimate as apiUpdateEstimate,
  updateEstimateStatus as apiUpdateEstimateStatus,
  type EstimateData,
} from "../utils/api";

export type EstimateStatus = "Draft" | "Approved" | "Sent" | "Accepted";
export type EstimateType = "draft" | "active";

export interface EstimateItem {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
}

export interface EstimateCustomer {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface Estimate {
  id: number;
  number: string;
  date: string;
  customer: string;
  amount: string;
  status: string;
  type: string;
  validUntil?: string;
  customerObj?: EstimateCustomer;
  items?: EstimateItem[];
  customer_id?: number;
}

interface EstimatesContextType {
  estimates: Estimate[];
  loading: boolean;
  refreshEstimates: () => Promise<void>;
  addEstimate: (data: {
    number?: string;
    date?: string;
    valid_until?: string;
    status?: string;
    type?: string;
    customer_id?: number;
    notes?: string;
    items?: {
      item_id?: number;
      name: string;
      description?: string;
      quantity?: number;
      price?: number;
    }[];
  }) => Promise<Estimate>;
  updateEstimate: (
    id: number,
    data: {
      date?: string;
      valid_until?: string;
      status?: string;
      type?: string;
      customer_id?: number;
      notes?: string;
      items?: {
        item_id?: number;
        name: string;
        description?: string;
        quantity?: number;
        price?: number;
      }[];
    },
  ) => Promise<Estimate>;
  updateEstimateStatus: (id: string, status: string) => Promise<Estimate>;
}

const EstimatesContext = createContext<EstimatesContextType | null>(null);

function apiToEstimate(e: EstimateData): Estimate {
  return {
    id: e.id,
    number: e.number,
    date: e.date,
    customer: e.customer,
    amount: e.amount,
    status: e.status,
    type: e.type,
    validUntil: e.valid_until,
    customer_id: e.customer_id ?? undefined,
    customerObj: e.customer_obj
      ? {
          id: e.customer_obj.id,
          name: e.customer_obj.name,
          email: e.customer_obj.email,
          phone: e.customer_obj.phone,
        }
      : undefined,
    items: e.items?.map((li) => ({
      id: li.id,
      name: li.name,
      description: li.description,
      price: li.price,
      quantity: li.quantity,
    })),
  };
}

export function EstimatesProvider({ children }: { children: ReactNode }) {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshEstimates = useCallback(async () => {
    try {
      const data = await apiFetchEstimates();
      setEstimates(data.map(apiToEstimate));
    } catch (err) {
      console.error("Failed to fetch estimates:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshEstimates();
  }, [refreshEstimates]);

  const addEstimate = async (
    data: Parameters<EstimatesContextType["addEstimate"]>[0],
  ) => {
    const created = await apiCreateEstimate(data);
    const est = apiToEstimate(created);
    setEstimates((prev) => [est, ...prev]);
    return est;
  };

  const updateEstimate = async (
    id: number,
    data: Parameters<EstimatesContextType["updateEstimate"]>[1],
  ) => {
    const updated = await apiUpdateEstimate(id, data);
    const est = apiToEstimate(updated);
    setEstimates((prev) => prev.map((e) => (e.id === id ? est : e)));
    return est;
  };

  const updateEstimateStatus = async (id: string, status: string) => {
    const updated = await apiUpdateEstimateStatus(id, status);
    const est = apiToEstimate(updated);
    setEstimates((prev) =>
      prev.map((e) => (String(e.id) === id || e.number === id ? est : e)),
    );
    return est;
  };

  return (
    <EstimatesContext.Provider
      value={{
        estimates,
        loading,
        refreshEstimates,
        addEstimate,
        updateEstimate,
        updateEstimateStatus,
      }}
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
