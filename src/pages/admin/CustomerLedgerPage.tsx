import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getCustomerLedger,
  addCustomerPayment,
} from "../../renderer/services/customerApi";
import CustomerStatement from "./CustomerStatement";

export default function CustomerLedgerModal({ customer, onClose }: any) {
  const { t } = useTranslation();
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
    if (!amount) return alert(t('customerLedger.enterAmount'));

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
      return alert(t('customerLedger.noMobileNumber'));
    }

    const msg = `${t('customerLedger.whatsappMessage', { 
      name: customer.name, 
      balance: customer.credit_balance || 0 
    })}

- ${t('customerLedger.storeName')}
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
              {t('customerLedger.creditLabel')}: ₹{customer.credit_balance || 0}
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
              placeholder={t('customerLedger.amountPlaceholder')}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />

            <select
              className="border p-2"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            >
              <option value="cash">{t('customerLedger.methodCash')}</option>
              <option value="upi">{t('customerLedger.methodUPI')}</option>
              <option value="card">{t('customerLedger.methodCard')}</option>
            </select>

            <button
              onClick={handlePayment}
              className="bg-green-600 text-white px-4"
            >
              {t('customerLedger.payButton')}
            </button>

            <button
              onClick={handlePrint}
              className="bg-blue-600 text-white px-4"
            >
              {t('customerLedger.printButton')}
            </button>

            <button
              onClick={sendWhatsApp}
              className="bg-green-600 text-white px-4"
            >
              {t('customerLedger.whatsappButton')}
            </button>
          </div>

          {/* LEDGER */}
          <div className="bg-white rounded shadow">
            <div className="grid grid-cols-4 p-3 border-b font-semibold">
              <span>{t('customerLedger.tableType')}</span>
              <span>{t('customerLedger.tableAmount')}</span>
              <span>{t('customerLedger.tableNote')}</span>
              <span>{t('customerLedger.tableDate')}</span>
            </div>

            {(ledger || []).map((l) => (
              <div
                key={l.id}
                className="grid grid-cols-4 p-3 border-b text-sm"
              >
                <span>{l.type === 'credit' ? t('customerLedger.creditType') : t('customerLedger.debitType')}</span>
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