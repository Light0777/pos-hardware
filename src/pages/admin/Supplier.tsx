import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  type Supplier,
} from "../../renderer/services/supplierApi";
import { IonIcon } from "@ionic/react";
import {
  addOutline,
  createOutline,
  trashOutline,
  searchOutline,
  closeOutline,
  peopleOutline,
  callOutline,
  mailOutline,
  locationOutline,
  checkmarkCircleOutline,
} from "ionicons/icons";

export default function SupplierPage() {
  const { t } = useTranslation();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Supplier>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSuppliers();
      console.log("Loaded suppliers:", data);
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Supplier load error:", e);
      setError(t('suppliers.loadError'));
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) {
      setError(t('suppliers.nameRequired'));
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const supplierData = {
        name: form.name.trim(),
        phone: form.phone?.trim() || "",
        email: form.email?.trim() || "",
        address: form.address?.trim() || "",
      };
      
      console.log("Creating supplier with data:", supplierData);
      const newSupplier = await createSupplier(supplierData);
      console.log("Supplier created successfully:", newSupplier);
      await loadSuppliers();
      setForm({ name: "", phone: "", email: "", address: "" });
      setShowForm(false);
    } catch (e) {
      console.error("Create supplier error:", e);
      setError(e instanceof Error ? e.message : t('suppliers.createError'));
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (s: Supplier) => {
    setEditingId(s.supplier_uuid);
    setEditForm({
      name: s.name || "",
      phone: s.phone || "",
      email: s.email || "",
      address: s.address || "",
    });
  };

  const handleUpdate = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const updateData = {
        name: editForm.name?.trim(),
        phone: editForm.phone?.trim() || "",
        email: editForm.email?.trim() || "",
        address: editForm.address?.trim() || "",
      };
      
      console.log("Updating supplier:", id, updateData);
      const updated = await updateSupplier(id, updateData);
      console.log("Supplier updated successfully:", updated);
      await loadSuppliers();
      setEditingId(null);
      setEditForm({});
    } catch (e) {
      console.error("Update supplier error:", e);
      setError(e instanceof Error ? e.message : t('suppliers.updateError'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('suppliers.deleteConfirm'))) return;

    setLoading(true);
    setError(null);
    
    try {
      console.log("Deleting supplier:", id);
      await deleteSupplier(id);
      console.log("Supplier deleted successfully");
      await loadSuppliers();
    } catch (e) {
      console.error("Delete supplier error:", e);
      setError(e instanceof Error ? e.message : t('suppliers.deleteError'));
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter((s) =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone?.includes(searchTerm)
  );

  const totalSuppliers = suppliers.length;
  const suppliersWithEmail = suppliers.filter((s) => s.email && s.email.trim()).length;
  const suppliersWithPhone = suppliers.filter((s) => s.phone && s.phone.trim()).length;

  return (
    <div className="space-y-3">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <p className="text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-xs text-red-600 hover:text-red-800 mt-1"
          >
            {t('suppliers.dismiss')}
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="font-inter text-start">
          <h1 className="text-3xl font-bold text-white font-inter">{t('suppliers.title')}</h1>
          <p className="text-gray-500 text-sm font-inter">
            {t('suppliers.subtitle')}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setForm({ name: "", phone: "", email: "", address: "" });
            setError(null);
            setShowForm(!showForm);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <IonIcon icon={addOutline} className="text-xl" />
          <span>{t('suppliers.addSupplier')}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div className="text-start">
              <p className="text-purple-100 text-sm">{t('suppliers.totalSuppliers')}</p>
              <p className="text-3xl font-bold mt-1">{totalSuppliers}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <IonIcon icon={peopleOutline} className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div className="text-start">
              <p className="text-green-100 text-sm">{t('suppliers.withEmail')}</p>
              <p className="text-3xl font-bold mt-1">{suppliersWithEmail}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <IonIcon icon={mailOutline} className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div className="text-start">
              <p className="text-blue-100 text-sm">{t('suppliers.withPhone')}</p>
              <p className="text-3xl font-bold mt-1">{suppliersWithPhone}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <IonIcon icon={callOutline} className="text-2xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <IonIcon
          icon={searchOutline}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg"
        />
        <input
          type="text"
          placeholder={t('suppliers.searchPlaceholder')}
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                {t('suppliers.addNewSupplier')}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setError(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <IonIcon icon={closeOutline} className="text-xl text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('suppliers.supplierNameRequired')}
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t('suppliers.namePlaceholder')}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('suppliers.phoneLabel')}
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('suppliers.emailLabel')}
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="supplier@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('suppliers.addressLabel')}
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder={t('suppliers.addressPlaceholder')}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {t('suppliers.adding')}
                  </span>
                ) : (
                  t('suppliers.addSupplier')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Suppliers Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                  {t('suppliers.tableSupplier')}
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                  {t('suppliers.tableContact')}
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                  {t('suppliers.tableAddress')}
                </th>
                <th className="text-center p-4 text-sm font-semibold text-gray-600">
                  {t('suppliers.tableStatus')}
                </th>
                <th className="text-center p-4 text-sm font-semibold text-gray-600">
                  {t('suppliers.tableActions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && suppliers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-gray-500">
                    {searchTerm ? t('suppliers.noSearchResults') : t('suppliers.noSuppliers')}
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((s) => (
                  <tr
                    key={s.supplier_uuid}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                  >
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-gray-800">
                          {s.name || t('suppliers.unnamed')}
                        </div>
                        {s.supplier_uuid && (
                          <div className="text-xs text-gray-400 mt-0.5 font-mono">
                            {t('suppliers.idLabel')}: {s.supplier_uuid.slice(0, 8)}...
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="space-y-1">
                        {s.phone && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <IonIcon icon={callOutline} className="text-xs" />
                            <span>{s.phone}</span>
                          </div>
                        )}
                        {s.email && (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <IonIcon icon={mailOutline} className="text-xs" />
                            <span className="truncate max-w-[200px]">
                              {s.email}
                            </span>
                          </div>
                        )}
                        {!s.phone && !s.email && (
                          <span className="text-xs text-gray-400">
                            {t('suppliers.noContactInfo')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      {s.address ? (
                        <div className="flex items-start gap-1 text-sm text-gray-600">
                          <IonIcon icon={locationOutline} className="text-xs mt-0.5" />
                          <span className="line-clamp-2">{s.address}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {t('suppliers.noAddress')}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        <IonIcon icon={checkmarkCircleOutline} className="text-xs" />
                        {t('suppliers.activeStatus')}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => startEdit(s)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title={t('suppliers.editTitle')}
                        >
                          <IonIcon icon={createOutline} className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.supplier_uuid)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title={t('suppliers.deleteTitle')}
                        >
                          <IonIcon icon={trashOutline} className="text-lg" />
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

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">{t('suppliers.editSupplier')}</h2>
              <button
                onClick={() => {
                  setEditingId(null);
                  setError(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <IonIcon icon={closeOutline} className="text-xl text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('suppliers.supplierName')}
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editForm.name || ""}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('suppliers.phoneLabel')}
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editForm.phone || ""}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('suppliers.emailLabel')}
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editForm.email || ""}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('suppliers.addressLabel')}
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={editForm.address || ""}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                />
              </div>

              <button
                onClick={() => editingId && handleUpdate(editingId)}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
              >
                {loading ? t('suppliers.saving') : t('suppliers.saveChanges')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}