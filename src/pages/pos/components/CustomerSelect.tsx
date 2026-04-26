import { useState, useRef, useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { chevronDownOutline, personOutline, addCircleOutline } from 'ionicons/icons';

interface CustomerSelectProps {
  customers: any[];
  selectedCustomer: any | null;
  onSelectCustomer: (customer: any | null) => void;
  onAddNew: () => void;
}

export default function CustomerSelect({
  customers,
  selectedCustomer,
  onSelectCustomer,
  onAddNew,
}: CustomerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Value Display */}
      <div
        className="w-full border border-gray-700 bg-[#212121] p-3 rounded-xl text-white flex justify-between items-center cursor-pointer hover:border-gray-600 transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <IonIcon icon={personOutline} className="text-gray-400 text-lg" />
          <span>
            {selectedCustomer
              ? `${selectedCustomer.name} ${selectedCustomer.credit_balance > 0 ? `(Due: ₹${selectedCustomer.credit_balance})` : ''}`
              : "Walk-in Customer"
            }
          </span>
        </div>
        <IonIcon
          icon={chevronDownOutline}
          className={`text-gray-400 text-xl transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#212121] border border-gray-700 rounded-xl overflow-hidden z-50 shadow-2xl animate-fadeIn">
          {/* Walk-in Customer Option */}
          <div
            className="p-3 hover:bg-[#2a2a2a] cursor-pointer transition-colors border-b border-gray-700 flex justify-center items-center gap-3"
            onClick={() => {
              onSelectCustomer(null);
              setIsOpen(false);
            }}>
            <IonIcon icon={personOutline} className="text-gray-400 text-2xl" />
            <div className='text-start'>
              <div className="text-white font-medium">Walk-in Customer</div>
              <div className="text-xs text-gray-400">No credit account needed</div>
            </div>
          </div>

          {/* Customers List */}
          <div className="max-h-40 overflow-y-auto scrollbar-hide">
            {customers.map((c) => (
              <div
                key={c.customer_uuid}
                className="p-3 hover:bg-[#2a2a2a] cursor-pointer transition-colors border-b border-gray-700 last:border-b-0"
                onClick={() => {
                  onSelectCustomer(c);
                  setIsOpen(false);
                }}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1 gap-2">
                    <div className="text-white font-medium">{c.name}</div>
                  </div>
                  {c.credit_balance > 0 && (
                    <div className="text-right">
                      <div className="text-xs text-orange-400">Due Amount</div>
                      <div className="text-sm font-semibold text-orange-400">₹{c.credit_balance}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add New Customer Button */}
          <div className="border-t border-gray-700 p-3 bg-[#1a1a1a]">
            <button
              className="w-full text-center text-blue-400 text-sm hover:text-blue-300 transition-colors flex items-center justify-center gap-2 py-1"
              onClick={() => {
                onAddNew();
                setIsOpen(false);
              }}
            >
              <IonIcon icon={addCircleOutline} className="text-lg" />
              <span>Add New Customer</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}