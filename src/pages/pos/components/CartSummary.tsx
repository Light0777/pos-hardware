interface CartSummaryProps {
  total: number;
  tax: number;
  grandTotal: number;
}

export default function CartSummary({ total, tax, grandTotal }: CartSummaryProps) {
  return (
    <div className="text-sm space-y-1 font-normal">
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>₹{total.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span>Tax (GST)</span>
        <span>₹{tax.toLocaleString()}</span>
      </div>
      <div className="flex justify-between font-bold text-lg border-t border-gray-600 pt-1 mt-1">
        <span>Grand Total</span>
        <span className="text-green-400">₹{grandTotal.toLocaleString()}</span>
      </div>
    </div>
  );
}