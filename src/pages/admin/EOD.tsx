import { useState } from "react";
import { useTranslation } from "react-i18next";
import EODModal from "../../components/EODModal";

export default function EODPage() {
  const { t } = useTranslation();
  const [show, setShow] = useState(true);
  return (
    <div>
      {show && <EODModal onClose={() => setShow(false)} />}
      {!show && (
        <div className="flex items-center justify-center h-64">
          <button
            onClick={() => setShow(true)}
            className="bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold"
          >
            {t('eodPage.viewButton')}
          </button>
        </div>
      )}
    </div>
  );
}