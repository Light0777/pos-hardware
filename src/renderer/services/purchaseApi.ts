// purchaseApi.ts
import { apiGet, apiPost } from "./api";

export async function createPurchase(data: any) {
  const response = await apiPost("/purchases", data);
  return response.data || response;
}

export async function getPurchases() {
  const response = await apiGet("/purchases");
  console.log("🟢 getPurchases raw response:", response);
  // Our API returns an array directly (as seen in your console)
  if (Array.isArray(response)) {
    console.log("✅ Response is array, length:", response.length);
    return response;
  }
  // Fallback for safety (e.g., if wrapped in { data: [...] })
  if (response && Array.isArray(response.data)) {
    console.log("✅ Response.data is array, length:", response.data.length);
    return response.data;
  }
  console.warn("⚠️ Unexpected response type, returning []");
  return [];
}