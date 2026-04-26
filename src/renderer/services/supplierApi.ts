import { apiGet, apiPost, apiPut, apiDelete } from "./api";

export interface Supplier {
  supplier_uuid: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

// 📋 list
export async function getSuppliers(): Promise<Supplier[]> {
  return await apiGet("/suppliers");
}

// ➕ create
export async function createSupplier(data: Partial<Supplier>) {
  return await apiPost("/suppliers", data);
}

// ✏️ update
export async function updateSupplier(id: string, data: Partial<Supplier>) {
  return await apiPut(`/suppliers/${id}`, data);
}

// ❌ delete
export async function deleteSupplier(id: string) {
  return await apiDelete(`/suppliers/${id}`);
}