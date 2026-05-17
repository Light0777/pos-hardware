// TopBar.tsx
import { IonIcon } from '@ionic/react';
import { pricetagOutline } from 'ionicons/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageToggle from '../../../components/LanguageToggle';
import { useState } from "react";
import { moonOutline } from "ionicons/icons";
import EODModal from "../../../components/EODModal";

interface TopBarProps {
  onShowSales: () => void;
}

export default function TopBar({ onShowSales }: TopBarProps) {
  const [showEOD, setShowEOD] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname;

  return (
    <div className="flex justify-between items-center px-4 py-2 border-b bg-[#141414] shadow-sm">
      <div className="flex gap-1 bg-[#212121] p-1 rounded-full">
        <button
          onClick={() => navigate("/pos")}
          className={`px-2 py-1 xl:px-4 xl:py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === "/pos"
              ? "bg-white text-black shadow-lg"
              : "text-gray-400 hover:text-white hover:bg-gray-700/50"
            }`}
        >
          {t('nav.pos')}
        </button>
        <button
          onClick={() => navigate("/admin/dashboard")}
          className={`px-2 py-1 xl:px-4 xl:py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === "/admin/dashboard"
              ? "bg-blue-500 text-white shadow-lg"
              : "text-gray-400 hover:text-white hover:bg-gray-700/50"
            }`}
        >
          {t('nav.admin')}
        </button>
        <button
          onClick={() => navigate("/admin/products")}
          className={`px-2 py-1 xl:px-4 xl:py-2 rounded-full text-sm font-medium transition-all duration-200 ${activeTab === "/admin/products"
              ? "bg-blue-500 text-white shadow-lg"
              : "text-gray-400 hover:text-white hover:bg-gray-700/50"
            }`}
        >
          {t('nav.products')}
        </button>
      </div>

      <div>
        <button
          onClick={() => setShowEOD(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-full text-sm font-medium transition-colors"
        >
          <IonIcon icon={moonOutline} className="text-lg" />
          <span>End of Day</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <LanguageToggle />
        <button
          className="px-2 py-1 xl:px-4 xl:py-2 bg-green-500 text-white rounded-full font-bold flex gap-1 justify-center items-center hover:bg-green-600 transition-colors"
          onClick={onShowSales}
        >
          <IonIcon icon={pricetagOutline} />
          <span>{t('common.sales')}</span>
        </button>
      </div>
      {showEOD && <EODModal onClose={() => setShowEOD(false)} />}
    </div>
  );
}