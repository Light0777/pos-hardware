// productApi.ts
import { apiGet, apiPost, apiPut, apiDelete } from "./api";

export async function getProducts() {
  try {
    const response = await apiGet("/products");
    console.log("📦 Products API response:", response);

    // Handle expected format: { success: true, data: [...] }
    if (response && response.success && Array.isArray(response.data)) {
      return response.data;
    }
    // Fallback: if response is already an array
    if (Array.isArray(response)) {
      return response;
    }
    // Fallback: if response has a data property that is an array
    if (response && Array.isArray(response.data)) {
      return response.data;
    }
    // If nothing works, return empty array
    console.warn("Unexpected products response structure", response);
    return [];
  } catch (error) {
    console.error("Failed to load products:", error);
    return [];
  }
}

// Other functions (create, update, delete) remain unchanged
export async function createProduct(data: any) {
  const response = await apiPost("/products", data);
  return response.data || response;
}

export async function updateProduct(uuid: string, data: any) {
  const response = await apiPut(`/products/${uuid}`, data);
  return response.data || response;
}

export async function deleteProduct(uuid: string) {
  const response = await apiDelete(`/products/${uuid}`);
  return response.data || response;
}

export async function previewMigration(fileContent: string, fileType: string) {
  const response = await apiPost('/migration/preview', { fileContent, fileType });
  return response.data || response;
}

export async function confirmMigration(products: any[], onDuplicate: 'skip' | 'overwrite') {
  const response = await apiPost('/migration/confirm', { products, onDuplicate });
  return response.data || response;
}