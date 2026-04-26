import { apiGet, apiPost, apiPut } from "./api";

export async function getSettings() {
  return await apiGet("/settings");
}

export async function saveSettings(data: any) {
  return await apiPost("/settings", data);
}

// ✅ optional update
export async function updateSettings(data: any) {
  return await apiPut("/settings", data);
}