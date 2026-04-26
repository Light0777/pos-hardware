import { useEffect, useState } from "react";
import {
  getTopProducts,
  getStockReport,
  getProfitReport,
} from "../../renderer/services/reportApi";
import { IonIcon } from "@ionic/react";
import {
  trendingUpOutline,
  cashOutline,
  cartOutline,
  cubeOutline,
  warningOutline,
  refreshOutline,
  trophyOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
} from "ionicons/icons";

export default function Reports() {
  const [top, setTop] = useState<any[]>([]);
  const [stock, setStock] = useState<any[]>([]);
  const [profit, setProfit] = useState<any>({
    revenue: 0,
    cost: 0,
    profit: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReports = async () => {
    try {
      setError(null);
      setRefreshing(true);
      
      const [topRes, stockRes, profitRes] = await Promise.allSettled([
        getTopProducts(),
        getStockReport(),
        getProfitReport(),
      ]);

      console.log("Top Products Response:", topRes);
      console.log("Stock Response:", stockRes);
      console.log("Profit Response:", profitRes);

      // Handle Top Products
      if (topRes.status === "fulfilled" && Array.isArray(topRes.value)) {
        setTop(topRes.value);
      } else {
        setTop([]);
      }

      // Handle Stock
      if (stockRes.status === "fulfilled" && Array.isArray(stockRes.value)) {
        setStock(stockRes.value);
      } else {
        setStock([]);
      }

      // Handle Profit
      if (profitRes.status === "fulfilled" && profitRes.value) {
        setProfit({
          revenue: profitRes.value.revenue || 0,
          cost: profitRes.value.cost || 0,
          profit: profitRes.value.profit || 0,
        });
      } else {
        setProfit({ revenue: 0, cost: 0, profit: 0 });
      }

      // Check if all data is empty
      const hasNoData = 
        (topRes.status !== "fulfilled" || topRes.value?.length === 0) &&
        (stockRes.status !== "fulfilled" || stockRes.value?.length === 0) &&
        (profitRes.status !== "fulfilled" || profitRes.value?.profit === 0);
      
      if (hasNoData) {
        setError("No report data available. Please add some products and sales first.");
      }
    } catch (err) {
      console.error("Reports error:", err);
      setError("Failed to load reports");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleRefresh = () => {
    loadReports();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-start">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <p className="text-gray-500 text-sm mt-1">Analytics and insights for your business</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          <IonIcon icon={refreshOutline} className={`text-xl ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IonIcon icon={warningOutline} className="text-xl" />
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-yellow-600 hover:text-yellow-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* 💰 Profit Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">₹{profit.revenue?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <IonIcon icon={cashOutline} className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-red-100 text-sm">Total Cost</p>
              <p className="text-2xl font-bold mt-1">₹{profit.cost?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <IonIcon icon={cartOutline} className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Net Profit</p>
              <p className="text-2xl font-bold mt-1">₹{profit.profit?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <IonIcon icon={trendingUpOutline} className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Profit Margin Card */}
      {profit.revenue > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Profit Margin</p>
              <p className="text-3xl font-bold text-blue-600">
                {((profit.profit / profit.revenue) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="w-32">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${Math.min((profit.profit / profit.revenue) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 Top Products */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
          <div className="flex items-center gap-2">
            <IonIcon icon={trophyOutline} className="text-white text-xl" />
            <h2 className="text-white font-semibold text-lg">Top Selling Products</h2>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {top.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <IonIcon icon={cubeOutline} className="text-5xl mx-auto mb-3" />
              <p>No sales data yet</p>
              <p className="text-sm mt-1">Products will appear here when they are sold</p>
            </div>
          ) : (
            top.map((p, idx) => (
              <div key={p.product_uuid || idx} className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 transition-all">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    idx === 0 ? "bg-yellow-100 text-yellow-600" :
                    idx === 1 ? "bg-gray-100 text-gray-600" :
                    idx === 2 ? "bg-orange-100 text-orange-600" :
                    "bg-blue-100 text-blue-600"
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{p.product?.name || p.name || "Unknown"}</p>
                    {p.sku && <p className="text-xs text-gray-400">SKU: {p.sku}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-blue-600">{p.total_qty || p.total_sold || 0} units</p>
                  {p.revenue && <p className="text-xs text-green-600">₹{p.revenue.toLocaleString()}</p>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 📦 Stock Status */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
          <div className="flex items-center gap-2">
            <IonIcon icon={cubeOutline} className="text-white text-xl" />
            <h2 className="text-white font-semibold text-lg">Stock Status</h2>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {stock.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <IonIcon icon={cubeOutline} className="text-5xl mx-auto mb-3" />
              <p>No stock data available</p>
              <p className="text-sm mt-1">Add products to see inventory levels</p>
            </div>
          ) : (
            stock.map((s, i) => {
              const stockLevel = s.stock || 0;
              const isLow = stockLevel <= 10 && stockLevel > 0;
              const isOut = stockLevel === 0;
              const stockPercentage = Math.min((stockLevel / 50) * 100, 100);
              
              return (
                <div key={s.product_uuid || i} className="px-6 py-4 hover:bg-gray-50 transition-all">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-medium text-gray-800">{s.name || "Unknown"}</p>
                      {s.sku && <p className="text-xs text-gray-400">SKU: {s.sku}</p>}
                    </div>
                    <div className="text-right">
                      <span className={`font-semibold ${
                        isOut ? "text-red-600" : isLow ? "text-orange-600" : "text-green-600"
                      }`}>
                        {stockLevel} units
                      </span>
                      <div className="mt-1">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                            <IonIcon icon={closeCircleOutline} className="text-xs" />
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                            <IonIcon icon={warningOutline} className="text-xs" />
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            <IonIcon icon={checkmarkCircleOutline} className="text-xs" />
                            In Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  {!isOut && (
                    <div className="w-full mt-2">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isLow ? "bg-orange-500" : "bg-green-500"
                          }`}
                          style={{ width: `${stockPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Summary Stats */}
      {stock.length > 0 && (
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-3">Inventory Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Total Products</p>
              <p className="text-2xl font-bold">{stock.length}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Low Stock Items</p>
              <p className="text-2xl font-bold text-orange-400">
                {stock.filter((s: any) => s.stock <= 10 && s.stock > 0).length}
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Out of Stock</p>
              <p className="text-2xl font-bold text-red-400">
                {stock.filter((s: any) => s.stock === 0).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}