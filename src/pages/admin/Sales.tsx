import { useEffect, useState } from "react";
import {
  getSales,
  getInvoice,
  type Invoice,
  type Sale,
} from "../../renderer/services/saleApi";
import { IonIcon } from "@ionic/react";
import {
  eyeOutline,
  printOutline,
  closeOutline,
  cashOutline,
  calendarOutline,
  documentTextOutline,
  trendingUpOutline,
  checkmarkCircleOutline,
  searchOutline,
} from "ionicons/icons";

export default function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [invoiceData, setInvoiceData] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const response = await getSales();
      console.log("📊 Sales API Response:", response);
      
      // Handle different response structures
      let salesData = [];
      if (Array.isArray(response)) {
        salesData = response;
      } else if (response.data && Array.isArray(response.data)) {
        salesData = response.data;
      } else if (response.success && response.data && Array.isArray(response.data)) {
        salesData = response.data;
      } else if (response.sales && Array.isArray(response.sales)) {
        salesData = response.sales;
      } else {
        console.warn("Unexpected sales response structure:", response);
        salesData = [];
      }
      
      console.log("📊 Processed sales data:", salesData);
      setSales(salesData);
    } catch (e) {
      console.error("Sales error:", e);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (sale: Sale) => {
    try {
      console.log("🔍 Viewing sale:", sale);
      const invoice = await getInvoice(sale.sale_uuid);
      console.log("📄 Full invoice data:", invoice);
      setInvoiceData(invoice);
    } catch (e) {
      console.error("Invoice error:", e);
      alert("Failed to load invoice. Please try again.");
    }
  };

  const format = (val: any) => {
    const num = Number(val);
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  // Calculate stats
  const totalSales = sales.reduce((sum, sale) => {
    const grandTotal = typeof sale.grand_total === 'string' ? parseFloat(sale.grand_total) : (sale.grand_total || 0);
    return sum + grandTotal;
  }, 0);

  const averageSale = sales.length > 0 ? totalSales / sales.length : 0;

  const todaySales = sales.filter(sale => {
    if (!sale.created_at) return false;
    const saleDate = new Date(sale.created_at).toDateString();
    const today = new Date().toDateString();
    return saleDate === today;
  }).reduce((sum, sale) => {
    const grandTotal = typeof sale.grand_total === 'string' ? parseFloat(sale.grand_total) : (sale.grand_total || 0);
    return sum + grandTotal;
  }, 0);

  // Filter sales
  const filteredSales = sales.filter((sale) => {
    const matchesSearch = !searchTerm || 
      sale.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !filterDate || sale.created_at?.startsWith(filterDate);
    return matchesSearch && matchesDate;
  });

  return (
    <div className="space-y-6 font-inter">
      {/* Header */}
      <div className="flex justify-between items-center font-inter">
        <div>
          <h1 className="text-3xl font-bold text-white">Sales</h1>
          <p className="text-gray-300 text-sm mt-1">Manage and view all your sales transactions</p>
        </div>
        <button
          onClick={loadSales}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          <IonIcon icon={documentTextOutline} className="text-xl" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-start">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Total Sales</p>
              <p className="text-2xl font-bold mt-1">₹{format(totalSales)}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <IonIcon icon={trendingUpOutline} className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">Average Sale</p>
              <p className="text-2xl font-bold mt-1">₹{format(averageSale)}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <IonIcon icon={cashOutline} className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm">Today's Sales</p>
              <p className="text-2xl font-bold mt-1">₹{format(todaySales)}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <IonIcon icon={calendarOutline} className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-100 text-sm">Total Transactions</p>
              <p className="text-2xl font-bold mt-1">{sales.length}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <IonIcon icon={documentTextOutline} className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by invoice number or customer name..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <IonIcon icon={searchOutline} className="text-xl" />
          </div>
        </div>

        <input
          type="date"
          className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto text-start">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Invoice</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Customer</th>
                <th className="text-right p-4 text-sm font-semibold text-gray-600">Amount</th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-2 text-gray-500">Loading sales...</p>
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-gray-500">
                    {searchTerm || filterDate ? "No sales match your search" : "No sales found"}
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.sale_uuid} className="border-b border-gray-100 hover:bg-gray-50 transition-all group">
                    <td className="p-4">
                      <div className="font-medium text-gray-800">{sale.invoice_number || "N/A"}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">
                        {sale.sale_uuid?.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-700">{sale.customer?.name || "Walk-in Customer"}</div>
                      {sale.customer?.mobile && (
                        <div className="text-xs text-gray-400 mt-0.5">{sale.customer.mobile}</div>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-bold text-green-600 text-lg">
                        ₹{format(sale.grand_total)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-gray-600">
                        {sale.created_at ? new Date(sale.created_at).toLocaleDateString() : "N/A"}
                      </div>
                      <div className="text-xs text-gray-400">
                        {sale.created_at ? new Date(sale.created_at).toLocaleTimeString() : ""}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        <IonIcon icon={checkmarkCircleOutline} className="text-xs" />
                        Completed
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleView(sale)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all inline-flex items-center gap-1"
                        title="View Invoice"
                      >
                        <IonIcon icon={eyeOutline} className="text-lg" />
                        <span className="text-sm">View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INVOICE MODAL */}
      {invoiceData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Invoice Details</h2>
              <button
                onClick={() => setInvoiceData(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <IonIcon icon={closeOutline} className="text-xl text-gray-500" />
              </button>
            </div>

            {/* Invoice Content */}
            <div className="p-6" id="invoice-content">
              {/* Header */}
              <div className="text-center mb-4">
                <div className="text-xs text-gray-400 mb-1">
                  Invoice #{invoiceData.invoice_number || invoiceData.sale_uuid?.slice(0, 8) || "-"}
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                  {invoiceData.shop?.name || "My Store"}
                </h2>
                <div className="text-xs text-gray-500 mt-1">
                  {invoiceData.shop?.address || "Chennai, Tamil Nadu"}
                </div>
                <div className="text-xs text-gray-400">
                  GSTIN: {invoiceData.shop?.gstin || "33ABCDE1234F1Z5"}
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  Date: {invoiceData.created_at ? new Date(invoiceData.created_at).toLocaleString() : new Date().toLocaleString()}
                </div>
              </div>

              <hr className="my-3 border-gray-200" />

              {/* Customer Info */}
              {(invoiceData.customer || invoiceData.customer_name) && (
                <div className="mb-3 text-sm">
                  <div className="font-semibold text-gray-700">Customer:</div>
                  <div className="text-gray-600">
                    {invoiceData.customer?.name || invoiceData.customer_name || "Walk-in Customer"}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="space-y-2 mb-3">
                <div className="font-semibold text-gray-700 text-sm">Items:</div>
                {(invoiceData.items?.length || invoiceData.cart?.items?.length) ? (
                  (invoiceData.items || invoiceData.cart?.items || []).map((item: any, i: number) => (
                    <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-100">
                      <div>
                        <div className="text-gray-700">{item.name || item.product?.name}</div>
                        <div className="text-xs text-gray-400">
                          Qty: {item.qty || item.quantity || 1} × ₹{format(item.price || item.product?.price)}
                        </div>
                      </div>
                      <div className="font-medium text-gray-700">
                        ₹{format(item.total || (item.price * (item.qty || item.quantity || 1)))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-sm text-gray-400">No items found</div>
                )}
              </div>

              <hr className="my-3 border-gray-200" />

              {/* Summary */}
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">
                    ₹{format(invoiceData.summary?.total || invoiceData.subtotal || invoiceData.total || 0)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (GST)</span>
                  <span className="text-gray-800">
                    ₹{format(invoiceData.summary?.tax || invoiceData.tax || invoiceData.gst || 0)}
                  </span>
                </div>

                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-bold text-gray-800">Grand Total</span>
                  <span className="font-bold text-green-600 text-lg">
                    ₹{format(invoiceData.summary?.grand_total || invoiceData.grand_total || invoiceData.total_amount || 0)}
                  </span>
                </div>
              </div>

              <hr className="my-3 border-gray-200" />

              {/* Footer */}
              <div className="text-center">
                <div className="text-sm text-gray-600">Thank you for your purchase! 🙏</div>
                <div className="text-xs text-gray-400 mt-1">Visit again!</div>
              </div>
            </div>

            {/* Modal Footer Buttons */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 p-4 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <IonIcon icon={printOutline} className="text-lg" />
                <span>Print</span>
              </button>
              <button
                onClick={() => setInvoiceData(null)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-xl flex items-center justify-center gap-2 transition-all"
              >
                <IonIcon icon={closeOutline} className="text-lg" />
                <span>Close</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}