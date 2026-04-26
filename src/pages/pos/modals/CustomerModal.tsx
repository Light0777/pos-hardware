import { useState } from "react";

interface CustomerModalProps {
  onClose: () => void;
  onCreateCustomer: (data: { name: string; mobile: string }) => Promise<void>;
}

export default function CustomerModal({ onClose, onCreateCustomer }: CustomerModalProps) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !mobile) {
      alert("Please fill all fields");
      return;
    }
    setLoading(true);
    await onCreateCustomer({ name, mobile });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Add New Customer</h2>
        
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Customer Name"
            className="w-full border p-2 rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          
          <input
            type="tel"
            placeholder="Mobile Number"
            className="w-full border p-2 rounded"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </div>

        <div className="flex gap-2 mt-6">
          <button
            className="flex-1 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}