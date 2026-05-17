import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { IonIcon } from "@ionic/react";
import { closeOutline, printOutline, refreshOutline, moonOutline } from "ionicons/icons";
import { getDailyReport } from "../renderer/services/reportApi";

export default function EODModal({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getDailyReport(today);
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2, maximumFractionDigits: 2
  }).format(n || 0);

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case 'cash': return t('eodModal.paymentMethods.cash');
      case 'upi': return t('eodModal.paymentMethods.upi');
      case 'card': return t('eodModal.paymentMethods.card');
      case 'pay_later': return t('eodModal.paymentMethods.payLater');
      default: return method;
    }
  };

  const paymentColors: Record<string, string> = {
    cash: 'bg-green-100 text-green-700',
    upi: 'bg-blue-100 text-blue-700',
    card: 'bg-purple-100 text-purple-700',
    pay_later: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 print:hidden-overlay">

      {/* Print button outside modal */}
      <div className="print:hidden fixed top-4 right-4 flex gap-2 z-50 hidden" id="eod-print-buttons">
        <button onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg">
          <IonIcon icon={printOutline} />
          {t('eodModal.printButton')}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" id="eod-modal">

        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white rounded-t-2xl flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-xl">
                <IonIcon icon={moonOutline} className="text-2xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{t('eodModal.title')}</h2>
                <p className="text-gray-300 text-sm mt-0.5">
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={load} className="p-2 hover:bg-white/10 rounded-full transition">
                <IonIcon icon={refreshOutline} className="text-lg" />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
                <IonIcon icon={closeOutline} className="text-xl" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800"></div>
          </div>
        ) : !report ? (
          <div className="flex items-center justify-center h-64 text-gray-400">
            {t('eodModal.noData')}
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 p-6 space-y-5" id="eod-content">

            {/* Shop name for print */}
            <div className="hidden print:block text-center mb-2">
              <p className="font-bold text-lg">{report.shop?.name || t('eodModal.myStore')}</p>
              <p className="text-sm text-gray-500">{t('eodModal.printSubtitle')} — {today}</p>
            </div>

            {/* Key Numbers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-gray-800">{report.summary.total_bills}</p>
                <p className="text-sm text-gray-500 mt-1">{t('eodModal.billsGenerated')}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-green-600">₹{fmt(report.summary.grand_total)}</p>
                <p className="text-sm text-gray-500 mt-1">{t('eodModal.totalSales')}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">₹{fmt(report.summary.subtotal)}</p>
                <p className="text-sm text-gray-500 mt-1">{t('eodModal.subtotal')}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 text-center">
                <p className="text-3xl font-bold text-orange-600">₹{fmt(report.summary.total_tax)}</p>
                <p className="text-sm text-gray-500 mt-1">{t('eodModal.gstCollected')}</p>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div>
              <h3 className="font-bold text-gray-700 mb-3">{t('eodModal.paymentBreakdown')}</h3>
              {report.payments.length === 0 ? (
                <p className="text-gray-400 text-sm">{t('eodModal.noPayments')}</p>
              ) : (
                <div className="space-y-2">
                  {report.payments.map((p: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className={`text-sm font-medium px-2 py-1 rounded-lg ${paymentColors[p.method] || 'bg-gray-100 text-gray-700'}`}>
                        {getPaymentLabel(p.method)}
                      </span>
                      <span className="font-bold text-gray-800">₹{fmt(p.total)}</span>
                    </div>
                  ))}
                  {/* Total collected */}
                  <div className="flex justify-between items-center p-3 bg-green-600 rounded-xl text-white mt-1">
                    <span className="font-semibold">{t('eodModal.totalCollected')}</span>
                    <span className="font-bold text-lg">
                      ₹{fmt(report.payments.reduce((s: number, p: any) => s + p.total, 0))}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Top 5 Products */}
            {report.top_products.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-700 mb-3">{t('eodModal.topProducts')}</h3>
                <div className="space-y-2">
                  {report.top_products.slice(0, 5).map((p: any, i: number) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-gray-200 rounded-full text-xs flex items-center justify-center font-bold text-gray-600">
                          {i + 1}
                        </span>
                        <span className="text-sm text-gray-700 font-medium">{p.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">₹{fmt(p.revenue)}</p>
                        <p className="text-xs text-gray-400">{t('eodModal.qtyLabel')}: {p.qty_sold}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bills list */}
            {report.bills.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-700 mb-3">{t('eodModal.billsHeader', { count: report.bills.length })}</h3>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {report.bills.map((b: any, i: number) => (
                    <div key={i} className="flex justify-between items-center px-3 py-2 hover:bg-gray-50 rounded-lg">
                      <div>
                        <span className="text-sm font-mono text-gray-700">{b.invoice_number}</span>
                        {b.customer_name && (
                          <span className="text-xs text-gray-400 ml-2">{b.customer_name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">
                          {new Date(b.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </span>
                        <span className="text-sm font-semibold text-gray-800">₹{fmt(b.grand_total)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {!loading && report && (
          <div className="p-4 border-t border-gray-100 flex gap-3 flex-shrink-0 print:hidden">
            <button
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold"
            >
              <IonIcon icon={printOutline} />
              {t('eodModal.printSummary')}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold"
            >
              {t('common.close')}
            </button>
          </div>
        )}
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #eod-content, #eod-content * { visibility: visible; }
          #eod-modal {
            position: absolute;
            left: 50%;
            top: 0;
            transform: translateX(-50%);
            width: 80mm;
            box-shadow: none;
          }
          @page { size: A4; margin: 10mm; }
        }
      `}</style>
    </div>
  );
}