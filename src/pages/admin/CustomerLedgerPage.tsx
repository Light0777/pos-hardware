import { useEffect, useState } from "react";
import {
  getCustomerLedger,
  addCustomerPayment,
} from "../../renderer/services/customerApi";
import CustomerStatement from "./CustomerStatement";

export default function CustomerLedgerModal({ customer, onClose }: any) {
  const [ledger, setLedger] = useState<any[]>([]);
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState("cash");

  useEffect(() => {
    load();
  }, [customer]);

  const load = async () => {
    const data = await getCustomerLedger(customer.customer_uuid);
    setLedger(Array.isArray(data) ? data : []);
  };

  const handlePayment = async () => {
    if (!amount) return alert("Enter amount");

    await addCustomerPayment(customer.customer_uuid, {
      amount,
      method,
    });

    setAmount(0);
    await load();
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write("<html><body>");
    printWindow.document.write(
      document.getElementById("print-area")!.innerHTML
    );
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  const sendWhatsApp = () => {
    if (!customer.mobile) {
      return alert("Customer has no mobile number");
    }

    const msg = `
Customer: ${customer.name}
Balance: ₹${customer.credit_balance}

Please clear your dues.

- My Store
  `;

    const url = `https://wa.me/${customer.mobile}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow w-[700px] max-h-[80vh] flex flex-col">

        {/* HEADER */}
        <div className="flex justify-between p-4 border-b">
          <div>
            <div className="font-bold text-lg">{customer.name}</div>
            <div className="text-xs text-gray-500">
              Credit: ₹{customer.credit_balance || 0}
            </div>
          </div>

          <button onClick={onClose}>✕</button>
        </div>

        {/* CONTENT */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">

          {/* PAYMENT */}
          <div className="flex gap-2">
            <input
              type="number"
              className="border p-2 w-full"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />

            <select
              className="border p-2"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
            </select>

            <button
              onClick={handlePayment}
              className="bg-green-600 text-white px-4"
            >
              Pay
            </button>

            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-4"
            >
              Print
            </button>

            <button
              onClick={sendWhatsApp}
              className="bg-green-600 text-white px-4"
            >
              WhatsApp
            </button>
          </div>

          {/* LEDGER */}
          <div className="bg-white rounded shadow">
            <div className="grid grid-cols-4 p-3 border-b font-semibold">
              <span>Type</span>
              <span>Amount</span>
              <span>Note</span>
              <span>Date</span>
            </div>

            {(ledger || []).map((l) => (
              <div
                key={l.id}
                className="grid grid-cols-4 p-3 border-b text-sm"
              >
                <span>{l.type}</span>
                <span>₹{l.amount}</span>
                <span>{l.note}</span>
                <span>
                  {new Date(l.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* PRINT AREA (HIDDEN UI SOURCE) */}
          <div id="print-area" className="hidden">
            <CustomerStatement customer={customer} ledger={ledger} />
          </div>

        </div>
      </div>
    </div>
  );
}