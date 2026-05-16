import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../../renderer/services/productApi";
import { IonIcon } from "@ionic/react";
import {
  addOutline,
  createOutline,
  trashOutline,
  searchOutline,
  closeOutline,
  cubeOutline,
  checkmarkCircleOutline,
  warningOutline,
  cloudUploadOutline,
} from "ionicons/icons";
import ImportProductsModal from "../../components/ImportProductsModal";

export default function Products() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    price: "",
    stock: "",
    sku: "",
    barcode: "",
    gst_percent: "0",
    hsn_code: "",
    description: "",
    image: "",
  });

  const loadProducts = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load products error:", err);
      setError(t('products.loadError'));
      setProducts([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      setError(t('products.namePriceRequired'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (editing) {
        await updateProduct(editing.product_uuid, {
          name: form.name,
          price: Number(form.price),
          stock: Number(form.stock),
          sku: form.sku,
          barcode: form.barcode,
          gst_percent: Number(form.gst_percent),
          hsn_code: form.hsn_code,
          description: form.description,
          image: form.image || undefined,
        });
      } else {
        await createProduct({
          name: form.name,
          price: Number(form.price),
          stock: Number(form.stock),
          sku: form.sku,
          gst_percent: Number(form.gst_percent),
          hsn_code: form.hsn_code,
          description: form.description,
          image: form.image || undefined,
        });
      }

      setForm({ name: "", price: "", stock: "", sku: "", barcode: "", description: "", gst_percent: "", hsn_code: "", image: "" });
      setEditing(null);
      setShowForm(false);
      await loadProducts();
    } catch (err) {
      console.error("Submit error:", err);
      setError(editing ? t('products.updateError') : t('products.createError'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p: any) => {
    setEditing(p);
    setForm({
      name: p.name,
      price: p.price,
      stock: p.stock || 0,
      sku: p.sku || "",
      barcode: p.barcode || "",
      gst_percent: p.gst_percent || "0",
      hsn_code: p.hsn_code || "",
      description: p.description || "",
      image: p.image || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (uuid: string) => {
    if (!confirm(t('products.deleteConfirm'))) return;
    setDeleting(uuid);
    try {
      await deleteProduct(uuid);
      window.location.reload();
    } catch (err) {
      console.error("Delete error:", err);
      setError(t('products.deleteError'));
      setDeleting(null);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => p.stock <= 10 && p.stock > 0).length;
  const outOfStockProducts = products.filter((p) => p.stock === 0).length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="font-inter text-start">
          <h1 className="text-3xl font-bold text-white font-inter">{t('products.title')}</h1>
          <p className="text-gray-500 text-sm font-inter">{t('products.subtitle')}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditing(null);
              setForm({ name: "", price: "", stock: "", sku: "", barcode: "", description: "", gst_percent: "", hsn_code: "", image: "" });
              setError(null);
              setShowForm(!showForm);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <IonIcon icon={addOutline} className="text-xl" />
            <span>{t('products.addProduct')}</span>
          </button>
          <button onClick={() => setShowImport(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl flex items-center gap-2">
            <IonIcon icon={cloudUploadOutline} className="text-xl" />
            <span>Import Products</span>
          </button>
        </div>
      </div>


      {/* Error Message */}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div className="text-start">
              <p className="text-blue-100 text-sm">{t('products.totalProducts')}</p>
              <p className="text-3xl font-bold mt-1">{totalProducts}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <IonIcon icon={cubeOutline} className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div className="text-start">
              <p className="text-orange-100 text-sm">{t('products.lowStock')}</p>
              <p className="text-3xl font-bold mt-1">{lowStockProducts}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <IonIcon icon={warningOutline} className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div className="text-start">
              <p className="text-red-100 text-sm">{t('products.outOfStock')}</p>
              <p className="text-3xl font-bold mt-1">{outOfStockProducts}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <IonIcon icon={closeOutline} className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <IonIcon icon={searchOutline} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
        <input
          type="text"
          placeholder={t('products.searchPlaceholder')}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-gray-800 to-gray-900 p-6 text-white rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <IonIcon icon={cubeOutline} className="text-2xl" />
                    <h2 className="text-2xl font-bold">
                      {editing ? t('products.editProduct') : t('products.addNewProduct')}
                    </h2>
                  </div>
                  <p className="text-gray-300 text-sm">
                    {editing ? t('products.updateProductInfo') : t('products.createNewProduct')}
                  </p>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition"
                >
                  <IonIcon icon={closeOutline} className="text-2xl" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.productName')} *</label>
                <input
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('products.namePlaceholder')}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.barcodeLabel')}</label>
                <input
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('products.barcodePlaceholder')}
                  value={form.barcode}
                  onChange={(e) => setForm({ ...form, barcode: e.target.value })}
                />
                <p className="text-xs text-gray-500 mt-1">{t('products.barcodeHint')}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.priceLabel')} *</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('products.pricePlaceholder')}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.stockLabel')}</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('products.stockPlaceholder')}
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.skuLabel')}</label>
                <input
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('products.skuPlaceholder')}
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.gstPercentLabel')}</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.gst_percent}
                    onChange={(e) => setForm({ ...form, gst_percent: e.target.value })}
                  >
                    <option value="0">0% — {t('products.gstExempt')}</option>
                    <option value="5">5% — {t('products.gst5')}</option>
                    <option value="12">12% — {t('products.gst12')}</option>
                    <option value="18">18% — {t('products.gst18')}</option>
                    <option value="28">28% — {t('products.gst28')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.hsnCodeLabel')}</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('products.hsnPlaceholder')}
                    value={form.hsn_code}
                    onChange={(e) => setForm({ ...form, hsn_code: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.descriptionLabel')}</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder={t('products.descriptionPlaceholder')}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('products.imageLabel')}</label>
                <div className="flex items-center gap-3">
                  {form.image && (
                    <img
                      src={form.image}
                      alt="Preview"
                      className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                    />
                  )}
                  <label className="flex-1 cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-3 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX = 200;
                            let w = img.width, h = img.height;
                            if (w > h) { if (w > MAX) { h = h * MAX / w; w = MAX; } }
                            else { if (h > MAX) { w = w * MAX / h; h = MAX; } }
                            canvas.width = w;
                            canvas.height = h;
                            canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
                            setForm({ ...form, image: canvas.toDataURL('image/jpeg', 0.7) });
                          };
                          img.src = ev.target?.result as string;
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    <p className="text-xs text-gray-400">
                      {form.image ? t('products.changeImage') : t('products.uploadImage')}
                    </p>
                  </label>
                  {form.image && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, image: '' })}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      {t('products.removeImage')}
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {editing ? t('products.updating') : t('products.creating')}
                  </span>
                ) : (
                  editing ? t('products.updateProduct') : t('products.createProduct')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 text-center">
              <tr>
                <th className="text-center p-4 text-sm font-semibold text-gray-600">{t('products.tableProduct')}</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-600">{t('products.tableSku')}</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-600">{t('products.tableGst')}</th>
                <th className="text-end p-4 text-sm font-semibold text-gray-600">{t('products.tablePrice')}</th>
                <th className="text-end p-4 text-sm font-semibold text-gray-600">{t('products.tableStock')}</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-600">{t('products.tableStatus')}</th>
                <th className="text-center p-4 text-sm font-semibold text-gray-600">{t('products.tableActions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-gray-500">
                    {searchTerm ? t('products.noSearchResults') : t('products.noProducts')}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.product_uuid} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-gray-800">{p.name}</div>
                        {p.description && (
                          <div className="text-xs text-gray-400 mt-0.5 line-clamp-1">{p.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-mono text-gray-500">{p.sku || "—"}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-xs font-mono text-gray-500">{p.gst_percent || 0}%</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-semibold text-green-600">₹{p.price?.toLocaleString()}</span>
                    </td>
                    <td className="p-4 text-right">
                      <span className={`font-medium ${p.stock === 0 ? "text-red-600" :
                        p.stock <= 10 ? "text-orange-600" :
                          "text-gray-700"
                        }`}>
                        {p.stock ?? "-"}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {p.stock === 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          <IonIcon icon={closeOutline} className="text-xs" />
                          {t('products.outOfStockLabel')}
                        </span>
                      ) : p.stock <= 10 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                          <IonIcon icon={warningOutline} className="text-xs" />
                          {t('products.lowStockLabel')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          <IonIcon icon={checkmarkCircleOutline} className="text-xs" />
                          {t('products.inStockLabel')}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title={t('products.editTitle')}
                        >
                          <IonIcon icon={createOutline} className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.product_uuid)}
                          disabled={deleting === p.product_uuid}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                          title={t('products.deleteTitle')}
                        >
                          {deleting === p.product_uuid
                            ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" />
                            : <IonIcon icon={trashOutline} className="text-lg" />
                          }
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {showImport && (
        <ImportProductsModal onClose={() => setShowImport(false)} onImported={loadProducts} />
      )}
    </div>
  );
}