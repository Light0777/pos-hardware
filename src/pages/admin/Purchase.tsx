import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { createPurchase } from "../../renderer/services/purchaseApi";
import { getProducts } from "../../renderer/services/productApi";
import { getSuppliers } from "../../renderer/services/supplierApi";
import { IonIcon } from "@ionic/react";
import {
  addOutline,
  trashOutline,
  cartOutline,
  peopleOutline,
  cubeOutline,
  cashOutline,
  closeOutline,
  checkmarkCircleOutline,
  warningOutline,
} from "ionicons/icons";

interface Item {
  product_uuid: string;
  quantity: number;
  cost_price: number;
}

export default function PurchasePage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [supplierId, setSupplierId] = useState<string>("");
  const [items, setItems] = useState<Item[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    addItem();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      const [p, s] = await Promise.all([getProducts(), getSuppliers()]);
      console.log("Products after extraction:", p);
      console.log("Suppliers after extraction:", s);
      setProducts(Array.isArray(p) ? p : []);
      setSuppliers(Array.isArray(s) ? s : []);
    } catch (e) {
      console.error("Load error:", e);
      setError(t('purchase.loadError'));
    }
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { product_uuid: "", quantity: 1, cost_price: 0 },
    ]);
  };

  const updateItem = (index: number, field: keyof Item, value: any) => {
    setItems((prev) => {
      const updated = [...prev];

      if (field === "product_uuid") {
        const product = products.find((p) => p.product_uuid === value);
        updated[index] = {
          ...updated[index],
          product_uuid: value,
          cost_price: product?.purchase_price ?? product?.price ?? 0,
        };
      } else {
        updated[index] = {
          ...updated[index],
          [field]: value,
        };
      }

      return updated;
    });
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const total = items.reduce((sum, i) => {
    const qty = Number(i.quantity) || 0;
    const price = Number(i.cost_price) || 0;
    return sum + qty * price;
  }, 0);

  const handleSubmit = async () => {
    const validItems = items.filter((i) => i.product_uuid && i.quantity > 0);

    console.log("🔹 supplierId:", supplierId);
    console.log("🔹 validItems:", validItems);

    if (!supplierId) {
      setError(t('purchase.selectSupplierError'));
      return;
    }
    if (validItems.length === 0) {
      setError(t('purchase.addItemsError'));
      return;
    }

    setError(null);
    setLoading(true);

    const payload = {
      supplier_uuid: supplierId,
      items: validItems,
    };
    console.log("📤 Sending payload:", payload);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:3000/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      console.log("✅ Direct fetch result:", result);

      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }

      setSuccess(t('purchase.successMessage'));
      setTimeout(() => {
        setItems([]);
        setSupplierId("");
        addItem();
        setSuccess(null);
      }, 2000);
    } catch (err: any) {
      console.error("❌ Purchase error:", err);
      setError(err.message || t('purchase.saveError'));
    } finally {
      setLoading(false);
    }
  };

  const totalItems = items.filter((i) => i.product_uuid).length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="font-inter text-start">
          <h1 className="text-3xl font-bold text-white font-inter">
            {t('purchase.title')}
          </h1>
          <p className="text-gray-500 text-sm font-inter">
            {t('purchase.subtitle')}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl px-4 py-2 text-white">
          <div className="flex items-center gap-2">
            <IonIcon icon={cartOutline} className="text-xl" />
            <span className="font-semibold">{t('purchase.purchaseLabel')}</span>
          </div>
        </div>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div className="text-start">
              <p className="text-purple-100 text-sm">{t('purchase.totalItems')}</p>
              <p className="text-3xl font-bold mt-1">{totalItems}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <IonIcon icon={cubeOutline} className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div className="text-start">
              <p className="text-blue-100 text-sm">{t('purchase.totalQuantity')}</p>
              <p className="text-3xl font-bold mt-1">
                {items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0)}
              </p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <IonIcon icon={addOutline} className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div className="text-start">
              <p className="text-green-100 text-sm">{t('purchase.totalAmount')}</p>
              <p className="text-3xl font-bold mt-1">₹{total.toFixed(0)}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <IonIcon icon={cashOutline} className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Selection Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-[#212121] px-4 py-4">
          <div className="flex items-center gap-2">
            <IonIcon icon={peopleOutline} className="text-white text-xl pb-2" />
            <h2 className="text-white font-semibold text-lg">
              {t('purchase.selectSupplier')}
            </h2>
          </div>
        </div>
        <div className="p-6">
          <select
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
          >
            <option value="">{t('purchase.chooseSupplier')}</option>
            {suppliers.map((s) => (
              <option key={s.supplier_uuid} value={s.supplier_uuid}>
                {s.name} {s.phone && `- ${s.phone}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Items Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-[#212121] px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <IonIcon icon={cubeOutline} className="text-white text-xl pb-2" />
              <h2 className="text-white font-semibold text-lg">
                {t('purchase.purchaseItems')}
              </h2>
            </div>
            <button
              onClick={addItem}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
            >
              <IonIcon icon={addOutline} className="text-lg" />
              <span>{t('purchase.addItem')}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                  {t('purchase.tableProduct')}
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                  {t('purchase.tableQuantity')}
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                  {t('purchase.tableCostPrice')}
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                  {t('purchase.tableSubtotal')}
                </th>
                <th className="text-center p-4 text-sm font-semibold text-gray-600">
                  {t('purchase.tableAction')}
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <IonIcon icon={cubeOutline} className="text-5xl text-gray-300" />
                      <p>{t('purchase.noItems')}</p>
                      <button
                        onClick={addItem}
                        className="mt-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        {t('purchase.addFirstItem')}
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const selectedProduct = products.find(
                    (p) => p.product_uuid === item.product_uuid
                  );
                  const subtotal = (item.quantity || 0) * (item.cost_price || 0);

                  return (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                    >
                      <td className="p-4">
                        <select
                          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={item.product_uuid}
                          onChange={(e) =>
                            updateItem(index, "product_uuid", e.target.value)
                          }
                        >
                          <option value="">{t('purchase.selectProduct')}</option>
                          {products.map((p) => (
                            <option key={p.product_uuid} value={p.product_uuid}>
                              {p.name} {p.sku && `(${p.sku})`}
                            </option>
                          ))}
                        </select>
                        {selectedProduct && selectedProduct.stock !== undefined && (
                          <div className="text-xs text-gray-500 mt-1">
                            {t('purchase.currentStock')}: {selectedProduct.stock} {t('purchase.units')}
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          min="1"
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "quantity",
                              Math.max(1, Number(e.target.value))
                            )
                          }
                        />
                      </td>
                      <td className="p-4">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={item.cost_price}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "cost_price",
                              Number(e.target.value) || 0
                            )
                          }
                        />
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-green-600">
                          ₹{subtotal.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title={t('purchase.removeItemTitle')}
                        >
                          <IonIcon icon={trashOutline} className="text-lg" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 text-start">
          <h3 className="font-semibold text-gray-800 text-xl">{t('purchase.orderSummary')}</h3>
        </div>
        <div className="p-6 space-y-3">
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-600">{t('purchase.subtotal')}</span>
            <span className="text-gray-800">₹{total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-t border-gray-100">
            <span className="text-lg font-bold text-gray-800">{t('purchase.total')}</span>
            <span className="text-2xl font-bold text-green-600">
              ₹{total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={loading || items.length === 0 || !supplierId}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-greeny-800 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            {t('purchase.processing')}
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <IonIcon icon={checkmarkCircleOutline} className="text-xl" />
            {t('purchase.completeButton')}
          </span>
        )}
      </button>
    </div>
  );
}