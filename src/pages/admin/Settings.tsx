import { useEffect, useState } from "react";
import { getSettings, saveSettings } from "../../renderer/services/settingsApi";
import { IonIcon } from "@ionic/react";
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

export default function Settings() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getSettings();
      console.log("Settings loaded:", res);
      
      // Check if response has data
      if (res && Object.keys(res).length > 0) {
        setData(res);
      } else {
        // Set default values if no settings exist
        setData({
          shop_name: "",
          mobile: "",
          address: "",
          gstin: "",
          invoice_prefix: "INV",
        });
      }
    } catch (err) {
      console.error("Load settings error:", err);
      setError("Failed to load settings");
      // Set default values on error
      setData({
        shop_name: "",
        mobile: "",
        address: "",
        gstin: "",
        invoice_prefix: "INV",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!data?.shop_name) {
      setError("Shop name is required");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      await saveSettings(data);
      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Save settings error:", err);
      setError("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    await loadSettings();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading settings...</p>
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
            <p className="text-red-700">Failed to load settings</p>
            <button
              onClick={loadSettings}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all"
            >
              Retry
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
          <h1 className="text-3xl font-bold text-white font-inter">Settings</h1>
          <p className="text-gray-500 text-sm font-inter">
            Configure your store information and preferences
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <IonIcon icon={refreshOutline} className="text-xl" />
          <span>Refresh</span>
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
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
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
                <h2 className="text-white font-semibold text-lg">
                  Store Information
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shop Name *
                </label>
                <input
                  placeholder="Enter your shop name"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={data.shop_name || ""}
                  onChange={(e) => setData({ ...data, shop_name: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will appear on invoices and receipts
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <input
                  placeholder="+91 98765 43210"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={data.mobile || ""}
                  onChange={(e) => setData({ ...data, mobile: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter your store address"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                <h2 className="text-white font-semibold text-lg">
                  Tax & Invoice Settings
                </h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  GSTIN Number
                </label>
                <input
                  placeholder="22AAAAA0000A1Z"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase"
                  value={data.gstin || ""}
                  onChange={(e) => setData({ ...data, gstin: e.target.value.toUpperCase() })}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Goods and Services Tax Identification Number
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Prefix
                </label>
                <input
                  placeholder="INV"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all uppercase"
                  value={data.invoice_prefix || "INV"}
                  onChange={(e) =>
                    setData({ ...data, invoice_prefix: e.target.value.toUpperCase() })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Prefix for invoice numbers (e.g., INV-001)
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-2">
                  <IonIcon icon={documentTextOutline} className="text-blue-500 text-lg mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Preview</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Example invoice number: {data.invoice_prefix || "INV"}-0001
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info Card */}
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
            <div className="flex items-center gap-2">
              <IonIcon icon={businessOutline} className="text-white text-xl" />
              <h2 className="text-white font-semibold text-lg">
                Business Information
              </h2>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-start">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <IonIcon icon={businessOutline} className="text-blue-600 text-lg" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Business Name</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {data.shop_name || "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <IonIcon icon={callOutline} className="text-green-600 text-lg" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Contact Number</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {data.mobile || "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <IonIcon icon={locationOutline} className="text-purple-600 text-lg" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Address</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {data.address || "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <IonIcon icon={pricetagOutline} className="text-orange-600 text-lg" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Invoice Prefix</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {data.invoice_prefix || "INV"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Saving Settings...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <IonIcon icon={saveOutline} className="text-xl" />
              Save All Settings
            </span>
          )}
        </button>
      </div>
    </div>
  );
}