const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ── Customers ──────────────────────────────────────────────────────────────

export interface CustomerData {
  id: number;
  name: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
}

export async function fetchCustomers(search = ""): Promise<CustomerData[]> {
  const params = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await fetch(`${API_BASE}/api/customers${params}`);
  if (!res.ok) throw new Error("Failed to fetch customers");
  return res.json();
}

export async function createCustomer(data: {
  name: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
}): Promise<CustomerData> {
  const res = await fetch(`${API_BASE}/api/customers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create customer");
  return res.json();
}

// ── Items / Products ───────────────────────────────────────────────────────

export interface ItemData {
  id: number;
  name: string;
  description: string;
  price: number;
}

export async function fetchItems(search = ""): Promise<ItemData[]> {
  const params = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await fetch(`${API_BASE}/api/items${params}`);
  if (!res.ok) throw new Error("Failed to fetch items");
  return res.json();
}

export async function createItem(data: {
  name: string;
  description?: string;
  price?: number;
}): Promise<ItemData> {
  const res = await fetch(`${API_BASE}/api/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create item");
  return res.json();
}

// ── Estimates ──────────────────────────────────────────────────────────────

export interface LineItemData {
  id: number;
  item_id: number | null;
  name: string;
  description: string;
  quantity: number;
  price: number;
}

export interface EstimateData {
  id: number;
  number: string;
  date: string;
  valid_until: string;
  status: string;
  type: string;
  customer: string;
  amount: string;
  notes: string;
  customer_id: number | null;
  customer_obj: CustomerData | null;
  items: LineItemData[];
}

export async function fetchEstimates(filters?: {
  status?: string;
  type?: string;
  customer?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
}): Promise<EstimateData[]> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });
  }
  const qs = params.toString();
  const res = await fetch(`${API_BASE}/api/estimates${qs ? `?${qs}` : ""}`);
  if (!res.ok) throw new Error("Failed to fetch estimates");
  return res.json();
}

export async function fetchEstimate(id: string): Promise<EstimateData> {
  const res = await fetch(`${API_BASE}/api/estimates/${id}`);
  if (!res.ok) throw new Error("Failed to fetch estimate");
  return res.json();
}

export async function createEstimate(data: {
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
}): Promise<EstimateData> {
  const res = await fetch(`${API_BASE}/api/estimates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create estimate");
  return res.json();
}

export async function updateEstimate(
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
): Promise<EstimateData> {
  const res = await fetch(`${API_BASE}/api/estimates/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update estimate");
  return res.json();
}

export async function updateEstimateStatus(
  id: string,
  status: string,
): Promise<EstimateData> {
  const res = await fetch(`${API_BASE}/api/estimates/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update estimate status");
  return res.json();
}

export async function deleteEstimate(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/api/estimates/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete estimate");
}
