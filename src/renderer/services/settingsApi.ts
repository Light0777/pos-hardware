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

// Backup management
export async function createBackup() {
  return await apiPost('/settings/backup', {});
}

export async function listBackups() {
  return await apiGet('/settings/backups');
}

export async function restoreBackup(backup_name: string) {
  return await apiPost('/settings/restore', { backup_name });
}