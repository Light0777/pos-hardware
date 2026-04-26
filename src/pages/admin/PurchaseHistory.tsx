import { useEffect, useState } from "react";
import { getPurchases } from "../../renderer/services/purchaseApi";
import { IonIcon } from "@ionic/react";
import {
  cartOutline,
  cashOutline,
  calendarOutline,
  peopleOutline,
  closeOutline,
  documentTextOutline,
  checkmarkCircleOutline,
  warningOutline,
  timeOutline,
} from "ionicons/icons";

export default function PurchaseHistory() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getPurchases();
      console.log("📊 Purchases API Response:", response);
      
      // Handle different response structures
      let purchasesData = [];
      if (Array.isArray(response)) {
        purchasesData = response;
      } else if (response.data && Array.isArray(response.data)) {
        purchasesData = response.data;
      } else if (response.success && response.data && Array.isArray(response.data)) {
        purchasesData = response.data;
      } else if (response.purchases && Array.isArray(response.purchases)) {
        purchasesData = response.purchases;
      } else {
        console.warn("Unexpected purchases response structure:", response);
        purchasesData = [];
      }
      
      console.log("📊 Processed purchases data:", purchasesData);
      setPurchases(purchasesData);
    } catch (e) {
      console.error("Error loading purchases:", e);
      setError("Failed to load purchase history");
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalPurchases = purchases.length;
  const totalSpent = purchases.reduce((sum, p) => sum + (Number(p.total) || 0), 0);
  const averagePurchase = totalPurchases > 0 ? totalSpent / totalPurchases : 0;

  // Helper function to safely format numbers
  const formatNumber = (value: any) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white">Loading purchases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="font-inter text-start">
          <h1 className="text-3xl font-bold text-white font-inter">
            Purchase History
          </h1>
          <p className="text-gray-500 text-sm font-inter">
            Track and manage all your purchase orders
          </p>
        </div>
        <button
          onClick={load}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl px-4 py-2 text-white hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-2">
            <IonIcon icon={cartOutline} className="text-xl" />
            <span className="font-semibold">Refresh</span>
          </div>
        </button>
      </div>

      {/* Error Alert */}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div className="text-start">
              <p className="text-blue-100 text-sm">Total Purchases</p>
              <p className="text-3xl font-bold mt-1">{totalPurchases}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <IonIcon icon={cartOutline} className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div className="text-start">
              <p className="text-green-100 text-sm">Total Spent</p>
              <p className="text-3xl font-bold mt-1">₹{formatNumber(totalSpent).toLocaleString()}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <IonIcon icon={cashOutline} className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div className="text-start">
              <p className="text-purple-100 text-sm">Average Purchase</p>
              <p className="text-3xl font-bold mt-1">₹{formatNumber(averagePurchase).toFixed(0)}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <IonIcon icon={documentTextOutline} className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
          <div className="flex items-center gap-2">
            <IonIcon icon={cartOutline} className="text-white text-xl" />
            <h2 className="text-white font-semibold text-lg">
              Purchase Orders
            </h2>
            <span className="ml-auto text-gray-400 text-sm">
              {purchases.length} records
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                  Supplier
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                  Items
                </th>
                <th className="text-right p-4 text-sm font-semibold text-gray-600">
                  Total Amount
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                  Date
                </th>
                <th className="text-center p-4 text-sm font-semibold text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-12">
                    <div className="flex flex-col items-center gap-2">
                      <IonIcon icon={cartOutline} className="text-6xl text-gray-300" />
                      <p className="text-gray-500 text-lg">No purchases found</p>
                      <p className="text-gray-400 text-sm">
                        Create your first purchase order to get started
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr
                    key={purchase.purchase_uuid || purchase.id}
                    onClick={() => setSelected(purchase)}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {purchase.supplier?.name?.charAt(0).toUpperCase() || 
                           purchase.supplier_name?.charAt(0).toUpperCase() || 
                           "W"}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">
                            {purchase.supplier?.name || purchase.supplier_name || "Walk-in Supplier"}
                          </div>
                          {purchase.supplier?.phone && (
                            <div className="text-xs text-gray-400">
                              {purchase.supplier.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-600">
                        {purchase.items?.length || 0} item(s)
                      </div>
                      <div className="text-xs text-gray-400 truncate max-w-[200px]">
                        {purchase.items?.slice(0, 2).map((item: any) => 
                          item.product?.name || item.name
                        ).join(", ")}
                        {purchase.items?.length > 2 && "..."}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-semibold text-green-600">
                        ₹{formatNumber(purchase.total).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <IonIcon icon={calendarOutline} className="text-xs" />
                        <span>{purchase.created_at ? new Date(purchase.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <IonIcon icon={timeOutline} className="text-xs" />
                        <span>{purchase.created_at ? new Date(purchase.created_at).toLocaleTimeString() : 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        <IonIcon icon={checkmarkCircleOutline} className="text-xs" />
                        Completed
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Details Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white rounded-t-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <IonIcon icon={documentTextOutline} className="text-2xl" />
                    <h2 className="text-2xl font-bold">Purchase Details</h2>
                  </div>
                  <p className="text-gray-300 text-sm">
                    Order #{selected.purchase_uuid?.slice(0, 8).toUpperCase() || 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="p-2 hover:bg-white/10 rounded-full transition"
                >
                  <IonIcon icon={closeOutline} className="text-2xl" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Supplier Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <IonIcon icon={peopleOutline} className="text-blue-600" />
                  <h3 className="font-semibold text-gray-800">Supplier Information</h3>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Name:</span>
                    <span className="font-medium text-gray-800">
                      {selected.supplier?.name || selected.supplier_name || "Walk-in Supplier"}
                    </span>
                  </div>
                  {selected.supplier?.phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Phone:</span>
                      <span className="text-gray-800">{selected.supplier.phone}</span>
                    </div>
                  )}
                  {selected.supplier?.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="text-gray-800">{selected.supplier.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Purchase Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <IonIcon icon={calendarOutline} className="text-blue-600" />
                  <h3 className="font-semibold text-gray-800">Purchase Information</h3>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Date:</span>
                    <span className="text-gray-800">
                      {selected.created_at ? new Date(selected.created_at).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Items:</span>
                    <span className="text-gray-800">{selected.items?.length || 0} products</span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <IonIcon icon={cartOutline} className="text-blue-600" />
                  <h3 className="font-semibold text-gray-800">Items Purchased</h3>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 text-xs font-semibold text-gray-500 pb-2 border-b border-gray-200">
                    <span>Product</span>
                    <span className="text-center">Quantity</span>
                    <span className="text-right">Cost Price</span>
                  </div>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {selected.items && selected.items.length > 0 ? (
                      selected.items.map((item: any, i: number) => (
                        <div key={i} className="grid grid-cols-3 text-sm">
                          <span className="text-gray-800">
                            {item.product?.name || item.name || "Unknown Product"}
                          </span>
                          <span className="text-center text-gray-600">
                            x{item.quantity || 0}
                          </span>
                          <span className="text-right text-green-600 font-medium">
                            ₹{formatNumber(item.cost_price).toFixed(2)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        No items details available
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-xs text-gray-500">Including all items</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">
                      ₹{formatNumber(selected.total).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 rounded-b-2xl">
              <button
                onClick={() => setSelected(null)}
                className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-3 rounded-xl font-semibold transition-all duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}