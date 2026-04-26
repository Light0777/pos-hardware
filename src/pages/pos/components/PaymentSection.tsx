import { IonIcon } from '@ionic/react';
import { trashBin, checkmarkCircle, cardOutline, qrCodeOutline, cashOutline } from 'ionicons/icons';
import { useState } from 'react';

interface PaymentSectionProps {
  payments: Array<{ method: string; amount: number }>;
  onPaymentChange: (index: number, field: string, value: any) => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  totalPaid: number;
  balance: number;
}

export default function PaymentSection({
  payments,
  onPaymentChange,
  onAddRow,
  onRemoveRow,
  totalPaid,
  balance,
}: PaymentSectionProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>(payments[0]?.method || "cash");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    onPaymentChange(0, "method", method);
  };

  const handleAmountChange = (amount: number) => {
    onPaymentChange(0, "amount", amount);
  };

  return (
    <div className="space-y-4">
      <div className="font-medium text-sm text-gray-300">Payment Methods</div>
      
      {/* Payment Method Selector as Cards */}
      <div className="grid grid-cols-3 gap-2">
        {/* Cash Option */}
        <div
          className={`border-2 rounded-xl p-3 cursor-pointer transition-all ${
            selectedMethod === "cash"
              ? "border-green-500 bg-green-500/10"
              : "border-gray-700 bg-[#212121] hover:border-gray-600"
          }`}
          onClick={() => handleMethodSelect("cash")}
        >
          <div className="flex flex-col items-center gap-1">
            <span className={`text-sm font-medium ${selectedMethod === "cash" ? "text-green-500" : "text-white"}`}>Cash</span>
          </div>
        </div>

        {/* UPI Option */}
        <div
          className={`border-2 rounded-xl p-3 cursor-pointer transition-all ${
            selectedMethod === "upi"
              ? "border-purple-500 bg-purple-500/10"
              : "border-gray-700 bg-[#212121] hover:border-gray-600"
          }`}
          onClick={() => handleMethodSelect("upi")}
        >
          <div className="flex flex-col items-center gap-1">
            <span className={`text-sm font-medium ${selectedMethod === "upi" ? "text-purple-500" : "text-white"}`}>UPI</span>
            {selectedMethod === "upi" && (
              <IonIcon icon={checkmarkCircle} className="text-purple-500 text-xs absolute top-2 right-2" />
            )}
          </div>
        </div>

        {/* Card Option */}
        <div
          className={`border-2 rounded-xl p-3 cursor-pointer transition-all ${
            selectedMethod === "card"
              ? "border-blue-500 bg-blue-500/10"
              : "border-gray-700 bg-[#212121] hover:border-gray-600"
          }`}
          onClick={() => handleMethodSelect("card")}
        >
          <div className="flex flex-col items-center gap-1">
            <span className={`text-sm font-medium ${selectedMethod === "card" ? "text-blue-500" : "text-white"}`}>Card</span>
            {selectedMethod === "card" && (
              <IonIcon icon={checkmarkCircle} className="text-blue-500 text-xs absolute top-2 right-2" />
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="text-sm border-t border-gray-700 pt-3 mt-2">
        <div className="flex justify-between items-center py-1">
          <span className="text-gray-400">Total Paid</span>
          <span className="font-bold text-white text-lg">₹{totalPaid.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="text-gray-400">Balance</span>
          <span className={balance < 0 ? "text-red-500 font-bold text-lg" : "text-green-500 font-bold text-lg"}>
            {balance < 0 ? `Due: ₹${Math.abs(balance)}` : `Change: ₹${balance}`}
          </span>
        </div>
      </div>
    </div>
  );
}