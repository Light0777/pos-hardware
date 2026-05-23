import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getSettings, saveSettings } from "../../renderer/services/settingsApi";
import { IonIcon } from "@ionic/react";
import { apiPost } from "../../renderer/services/api";
import {
  saveOutline,
  closeOutline,
  checkmarkCircleOutline,
  warningOutline,
  businessOutline,
  callOutline,
  locationOutline,
  documentTextOutline,
  pricetagOutline,
  refreshOutline,
} from "ionicons/icons";
import { createBackup, listBackups, restoreBackup } from "../../renderer/services/settingsApi";
import { cloudUploadOutline, cloudDownloadOutline } from "ionicons/icons";

const DEFAULT_SETTINGS = {
  shop_name: "",
  mobile: "",
  address: "",
  gstin: "",
  invoice_prefix: "INV",
  auto_print: 0,
};

export default function Settings() {
  const { t } = useTranslation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [backups, setBackups] = useState<any[]>([]);
  const [backupLoading, setBackupLoading] = useState(false);

  // Helper: extract clean settings from any response shape
  const extractCleanSettings = (obj: any) => {
    if (!obj) return null;
    let source = obj;
    if (obj.data && typeof obj.data === 'object') source = obj.data;
    // Return only known fields
    return {
      shop_name: source.shop_name || "",
      mobile: source.mobile || "",
      address: source.address || "",
      gstin: source.gstin || "",
      invoice_prefix: source.invoice_prefix || "INV",
      auto_print: source.auto_print ?? 0,
    };
  };

  // Load from localStorage first
  useEffect(() => {
    const cached = localStorage.getItem('shop_settings');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const clean = extractCleanSettings(parsed);
        if (clean) {
          setData({ ...DEFAULT_SETTINGS, ...clean });
          console.log("Loaded from cache", clean);
        } else {
          setData({ ...DEFAULT_SETTINGS });
        }
      } catch (err) {
        console.error("Failed to parse cached settings", err);
        setData({ ...DEFAULT_SETTINGS });
      }
    } else {
      setData({ ...DEFAULT_SETTINGS });
    }
    setLoading(false);
  }, []);

  const syncFromBackend = async () => {
    try {
      const res = await getSettings();
      const clean = extractCleanSettings(res);
      if (clean && (clean.shop_name || clean.mobile || clean.address)) {
        setData((prev: any) => ({ ...prev, ...clean }));
        localStorage.setItem('shop_settings', JSON.stringify(clean));
        console.log("Synced from backend", clean);
      } else {
        console.log("Backend returned empty, keeping cached");
      }
    } catch (err) {
      console.error("Failed to sync from backend:", err);
    }
  };

  useEffect(() => {
    syncFromBackend();
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const res = await listBackups();
      if (res?.data) setBackups(res.data);
    } catch (err) {
      console.error('Failed to load backups:', err);
    }
  };

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      await createBackup();
      setSuccess(t('settings.backupSuccess'));
      await loadBackups();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(t('settings.backupError'));
    } finally {
      setBackupLoading(false);
    }
  };

  const handleRestore = async (backupName: string) => {
    if (!confirm(t('settings.restoreConfirm', { name: backupName }))) return;
    setBackupLoading(true);
    try {
      await restoreBackup(backupName);
      setSuccess(t('settings.restoreSuccess'));
      await syncFromBackend();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(t('settings.restoreError'));
    } finally {
      setBackupLoading(false);
    }
  };

  const handleSave = async () => {
    if (!data?.shop_name) {
      setError(t('settings.shopNameRequired'));
      return;
    }
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await saveSettings(data);
      // Store only the clean settings
      const toStore = {
        shop_name: data.shop_name,
        mobile: data.mobile,
        address: data.address,
        gstin: data.gstin,
        invoice_prefix: data.invoice_prefix,
        auto_print: data.auto_print,
      };
      localStorage.setItem('shop_settings', JSON.stringify(toStore));
      setSuccess(t('settings.saveSuccess'));
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Save error:", err);
      setError(t('settings.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    await syncFromBackend();
    await loadBackups();
  };

  const handleTestPrint = async () => {
    try {
      const res = await apiPost('/settings/test-print', {});
      if (res.success) {
        setSuccess(t('settings.testPrintSuccess'));
      } else {
        setError(`${t('settings.testPrintError')}: ${res.error}`);
      }
    } catch (err) {
      setError(t('settings.testPrintError'));
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">{t('settings.loadingSettings')}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <IonIcon icon={warningOutline} className="text-5xl text-red-500 mx-auto mb-4" />
            <p className="text-red-700">{t('settings.loadFailed')}</p>
            <button onClick={handleRefresh} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl">
              {t('settings.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="font-inter text-start">
          <h1 className="text-3xl font-bold text-white">{t('settings.title')}</h1>
          <p className="text-gray-500 text-sm">{t('settings.subtitle')}</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl flex items-center gap-2"
        >
          <IonIcon icon={refreshOutline} className="text-xl" />
          <span>{t('settings.refresh')}</span>
        </button>
      </div>

      {/* Auto Print Toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mt-2">
        <div className="text-start">
          <p className="text-sm font-medium text-gray-700">{t('settings.autoPrintBill')}</p>
          <p className="text-xs text-gray-500">{t('settings.autoPrintDesc')}</p>
        </div>
        <button
          onClick={() => setData({ ...data, auto_print: data.auto_print ? 0 : 1 })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            data.auto_print ? 'bg-green-600' : 'bg-gray-300'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            data.auto_print ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700">
          <div className="flex items-center gap-2">
            <IonIcon icon={checkmarkCircleOutline} className="text-xl" />
            <p className="text-sm">{success}</p>
          </div>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IonIcon icon={warningOutline} className="text-xl" />
              <p className="text-sm">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <IonIcon icon={closeOutline} className="text-lg" />
            </button>
          </div>
        </div>
      )}

      {/* Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Main Settings Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
              <div className="flex items-center gap-2">
                <IonIcon icon={businessOutline} className="text-white text-xl" />
                <h2 className="text-white font-semibold text-lg">{t('settings.storeInformation')}</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('settings.shopName')} *
                </label>
                <input
                  placeholder={t('settings.shopNamePlaceholder')}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={data.shop_name || ""}
                  onChange={(e) => setData({ ...data, shop_name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('settings.mobileNumber')}
                </label>
                <input
                  placeholder="+91 98765 43210"
                  className="w-full border border-gray-300 rounded-lg p-2.5"
                  value={data.mobile || ""}
                  onChange={(e) => setData({ ...data, mobile: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('settings.address')}
                </label>
                <textarea
                  rows={3}
                  placeholder={t('settings.addressPlaceholder')}
                  className="w-full border border-gray-300 rounded-lg p-2.5"
                  value={data.address || ""}
                  onChange={(e) => setData({ ...data, address: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tax & Invoice Settings Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
              <div className="flex items-center gap-2">
                <IonIcon icon={documentTextOutline} className="text-white text-xl" />
                <h2 className="text-white font-semibold text-lg">{t('settings.taxInvoiceSettings')}</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('settings.gstinNumber')}
                </label>
                <input
                  placeholder="22AAAAA0000A1Z"
                  className="w-full border border-gray-300 rounded-lg p-2.5 uppercase"
                  value={data.gstin || ""}
                  onChange={(e) => setData({ ...data, gstin: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('settings.invoicePrefix')}
                </label>
                <input
                  placeholder="INV"
                  className="w-full border border-gray-300 rounded-lg p-2.5 uppercase"
                  value={data.invoice_prefix || "INV"}
                  onChange={(e) => setData({ ...data, invoice_prefix: e.target.value.toUpperCase() })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('settings.exampleInvoice')} {data.invoice_prefix || "INV"}-0001
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Information (read-only summary) */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
          <div className="flex items-center gap-2">
            <IonIcon icon={businessOutline} className="text-white text-xl" />
            <h2 className="text-white font-semibold text-lg">{t('settings.businessInformation')}</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-start">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <IonIcon icon={businessOutline} className="text-blue-600 text-lg" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{t('settings.businessName')}</p>
                <p className="text-sm text-gray-600 mt-1">{data.shop_name || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <IonIcon icon={callOutline} className="text-green-600 text-lg" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{t('settings.contactNumber')}</p>
                <p className="text-sm text-gray-600 mt-1">{data.mobile || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <IonIcon icon={locationOutline} className="text-purple-600 text-lg" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{t('settings.addressLabel')}</p>
                <p className="text-sm text-gray-600 mt-1">{data.address || "—"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <IonIcon icon={pricetagOutline} className="text-orange-600 text-lg" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{t('settings.invoicePrefixLabel')}</p>
                <p className="text-sm text-gray-600 mt-1">{data.invoice_prefix || "INV"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-50"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              {t('settings.savingSettings')}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <IonIcon icon={saveOutline} className="text-xl" />
              {t('settings.saveAllSettings')}
            </span>
          )}
        </button>
      </div>

      {/* Backup & Restore Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IonIcon icon={cloudUploadOutline} className="text-white text-xl" />
              <h2 className="text-white font-semibold text-lg">{t('settings.backupRestore')}</h2>
            </div>
            <button
              onClick={handleBackup}
              disabled={backupLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50"
            >
              <IonIcon icon={cloudUploadOutline} />
              {backupLoading ? t('settings.creatingBackup') : t('settings.backupNow')}
            </button>
          </div>
        </div>
        <div className="p-6">
          {backups.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">{t('settings.noBackups')}</p>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-3">{t('settings.availableBackups')}</p>
              {backups.map((backup, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-mono text-gray-700">{backup.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(backup.date).toLocaleString('en-IN')} · {(backup.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => handleRestore(backup.name)}
                    disabled={backupLoading}
                    className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg flex items-center gap-1 disabled:opacity-50"
                  >
                    <IonIcon icon={cloudDownloadOutline} />
                    {t('settings.restore')}
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-xs text-yellow-800">
              ⚡ {t('settings.autoBackupNote')} <span className="font-mono">%APPDATA%\pos-app\backups\</span> {t('settings.onWindows')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}