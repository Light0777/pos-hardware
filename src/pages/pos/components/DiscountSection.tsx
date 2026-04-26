interface DiscountSectionProps {
  discount: number;
  onDiscountChange: (value: number) => void;
  onApplyDiscount: () => void;
}

export default function DiscountSection({
  discount,
  onDiscountChange,
  onApplyDiscount,
}: DiscountSectionProps) {
  return (
    <div className="bg-[#212121] rounded-xl p-3 border border-gray-700">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium text-gray-300">Apply Discount</span>
      </div>
      
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
          <input
            type="number"
            className="w-full border border-gray-700 bg-[#1a1a1a] p-2 pl-7 rounded-lg text-white focus:border-blue-500 focus:outline-none text-sm"
            placeholder="0"
            value={discount}
            onChange={(e) => onDiscountChange(Number(e.target.value))}
          />
        </div>
        <button
          className="bg-green-500 font-bold text-white hover:text-green-500 px-4 py-2 rounded-lg hover:bg-[#141414] transition text-sm"
          onClick={onApplyDiscount}
        >
          Apply
        </button>
      </div>
    </div>
  );
}