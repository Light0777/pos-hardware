import { useEffect, useState } from "react";
import {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  type Staff,
} from "../../renderer/services/staffApi";
import { IonIcon } from "@ionic/react";
import {
  addOutline,
  createOutline,
  trashOutline,
  searchOutline,
  closeOutline,
  peopleOutline,
  mailOutline,
  keyOutline,
  checkmarkCircleOutline,
  warningOutline,
  refreshOutline,
} from "ionicons/icons";

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "cashier",
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStaff();
      setStaff(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load staff error:", err);
      setError("Failed to load staff members");
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  // ➕ CREATE
  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) {
      setError("Name, email, and password are required");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const newStaff = await createStaff(form);
      setStaff((prev) => [...prev, newStaff]);
      
      setSuccess("Staff member created successfully!");
      setTimeout(() => setSuccess(null), 3000);
      
      setForm({
        name: "",
        email: "",
        password: "",
        role: "cashier",
      });
      setShowForm(false);
      await loadStaff();
    } catch (err) {
      console.error("Create staff error:", err);
      setError("Failed to create staff member");
    } finally {
      setLoading(false);
    }
  };

  // ✏️ EDIT START
  const startEdit = (s: Staff) => {
    setEditing(s);
    setForm({
      name: s.name,
      email: s.email,
      password: "",
      role: s.role,
    });
    setShowForm(true);
  };

  // 💾 SAVE EDIT
  const handleUpdate = async () => {
    if (!editing) return;

    setLoading(true);
    setError(null);
    
    try {
      const updated = await updateStaff(editing.user_uuid, form);
      setStaff((prev) =>
        prev.map((s) => (s.user_uuid === editing.user_uuid ? updated : s))
      );
      
      setSuccess("Staff member updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
      
      setEditing(null);
      setForm({
        name: "",
        email: "",
        password: "",
        role: "cashier",
      });
      setShowForm(false);
      await loadStaff();
    } catch (err) {
      console.error("Update staff error:", err);
      setError("Failed to update staff member");
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ DELETE
  const handleDelete = async (uuid: string) => {
    if (!confirm("Delete this staff member?")) return;

    setLoading(true);
    setError(null);
    
    try {
      await deleteStaff(uuid);
      setSuccess("Staff member deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
      await loadStaff();
    } catch (err) {
      console.error("Delete staff error:", err);
      setError("Failed to delete staff member");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({
      name: "",
      email: "",
      password: "",
      role: "cashier",
    });
    setShowForm(false);
    setError(null);
  };

  // Filter staff based on search
  const filteredStaff = staff.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalStaff = staff.length;
  const managers = staff.filter((s) => s.role === "manager").length;
  const cashiers = staff.filter((s) => s.role === "cashier").length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="font-inter text-start">
          <h1 className="text-3xl font-bold text-white font-inter">Staff Management</h1>
          <p className="text-gray-500 text-sm font-inter">
            Manage your team members and their roles
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setForm({
              name: "",
              email: "",
              password: "",
              role: "cashier",
            });
            setError(null);
            setShowForm(!showForm);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <IonIcon icon={addOutline} className="text-xl" />
          <span>Add Staff</span>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div className="text-start">
              <p className="text-purple-100 text-sm">Total Staff</p>
              <p className="text-3xl font-bold mt-1">{totalStaff}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <IonIcon icon={peopleOutline} className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div className="text-start">
              <p className="text-blue-100 text-sm">Managers</p>
              <p className="text-3xl font-bold mt-1">{managers}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <IonIcon icon={peopleOutline} className="text-2xl" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
          <div className="flex justify-between items-start">
            <div className="text-start">
              <p className="text-green-100 text-sm">Cashiers</p>
              <p className="text-3xl font-bold mt-1">{cashiers}</p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg">
              <IonIcon icon={peopleOutline} className="text-2xl" />
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
          placeholder="Search staff by name or email..."
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
                    <IonIcon icon={peopleOutline} className="text-2xl" />
                    <h2 className="text-2xl font-bold">
                      {editing ? "Edit Staff Member" : "Add New Staff"}
                    </h2>
                  </div>
                  <p className="text-gray-300 text-sm">
                    {editing ? "Update staff information" : "Create a new staff account"}
                  </p>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-white/10 rounded-full transition"
                >
                  <IonIcon icon={closeOutline} className="text-2xl" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter staff name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="staff@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editing ? "Password (leave blank to keep current)" : "Password *"}
                </label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={editing ? "Enter new password (optional)" : "Enter password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="cashier">Cashier</option>
                  <option value="manager">Manager</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Managers have access to products and reports, cashiers can only process sales
                </p>
              </div>

              <button
                onClick={editing ? handleUpdate : handleCreate}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {editing ? "Updating..." : "Creating..."}
                  </span>
                ) : (
                  editing ? "Update Staff Member" : "Create Staff Member"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
          <div className="flex items-center gap-2">
            <IonIcon icon={peopleOutline} className="text-white text-xl" />
            <h2 className="text-white font-semibold text-lg">
              Staff Members ({filteredStaff.length})
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                  Staff Member
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                  Contact
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                  Role
                </th>
                <th className="text-left p-4 text-sm font-semibold text-gray-600">
                  Status
                </th>
                <th className="text-center p-4 text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && staff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <p className="text-gray-500">Loading staff...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center p-12">
                    <div className="flex flex-col items-center gap-2">
                      <IonIcon icon={peopleOutline} className="text-6xl text-gray-300" />
                      <p className="text-gray-500 text-lg">No staff members found</p>
                      <p className="text-gray-400 text-sm">
                        {searchTerm ? "No results match your search" : "Click 'Add Staff' to create your first team member"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStaff.map((s) => (
                  <tr
                    key={s.user_uuid}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {s.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{s.name}</div>
                          <div className="text-xs text-gray-400 font-mono">
                            ID: {s.user_uuid?.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <IonIcon icon={mailOutline} className="text-xs" />
                        <span>{s.email}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                        s.role === "manager" 
                          ? "bg-purple-100 text-purple-700" 
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        <IonIcon icon={peopleOutline} className="text-xs" />
                        {s.role.charAt(0).toUpperCase() + s.role.slice(1)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        <IonIcon icon={checkmarkCircleOutline} className="text-xs" />
                        Active
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => startEdit(s)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <IonIcon icon={createOutline} className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.user_uuid)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
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
    </div>
  );
}