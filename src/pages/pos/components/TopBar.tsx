import { useState } from 'react';
import { IonIcon } from '@ionic/react';
import { pricetagOutline } from 'ionicons/icons';

interface TopBarProps {
  onNavigate: (path: string) => void;
  onShowSales: () => void;
}

export default function TopBar({ onNavigate, onShowSales }: TopBarProps) {
  const [activeTab, setActiveTab] = useState("/pos");

  const handleNavigate = (path: string) => {
    setActiveTab(path);
    onNavigate(path);
  };

  return (
    <div className="flex justify-between items-center px-4 py-2 border-b bg-[#141414] shadow-sm">
      {/* Navigation Tabs */}
      <div className="flex gap-1 bg-[#212121] p-1 rounded-full">
        <button
          onClick={() => handleNavigate("/pos")}
          className={` px-2 py-1 xl:px-4 xl:py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === "/pos"
              ? "bg-white text-black shadow-lg"
              : "text-black"
            }`}
        >
          POS
        </button>
        <button
          onClick={() => handleNavigate("/admin/dashboard")}
          className={`px-2 py-1 xl:px-4 xl:py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === "/admin/dashboard"
              ? "bg-blue-500 text-white shadow-lg"
              : "text-gray-400 hover:text-white hover:bg-gray-700/50"
            }`}
        >
          Admin
        </button>
        <button
          onClick={() => handleNavigate("/admin/products")}
          className={`px-2 py-1 xl:px-4 xl:py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === "/admin/products"
              ? "bg-blue-500 text-white shadow-lg"
              : "text-gray-400 hover:text-white hover:bg-gray-700/50"
            }`}
        >
          Products
        </button>
      </div>

      {/* Sales Button */}
      <button
        className="px-2 py-1 xl:px-4 xl:py-2 bg-green-500 text-white rounded-full font-bold flex gap-1 justify-center items-center hover:bg-green-600 transition-colors"
        onClick={onShowSales}
      >
        <IonIcon icon={pricetagOutline} />
        <span>Sales</span>
      </button>
    </div>
  );
}