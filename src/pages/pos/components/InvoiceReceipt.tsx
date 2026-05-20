import { IonIcon } from '@ionic/react';
import { printOutline, closeOutline, logoWhatsapp } from 'ionicons/icons';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface InvoiceReceiptProps {
  invoice: any;
  onClose: () => void;
  autoPrint?: boolean;
}

export default function InvoiceReceipt({ invoice, onClose, autoPrint }: InvoiceReceiptProps) {
  const { t } = useTranslation();

  useEffect(() => {
    if (autoPrint) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrint, invoice]);

  useEffect(() => {
    const handleEnterKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handlePrint();
      }
    };
    window.addEventListener('keydown', handleEnterKey);
    return () => window.removeEventListener('keydown', handleEnterKey);
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num || 0);
  };

  const handlePrint = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/printing/print-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice),
      });
      const result = await response.json();
      if (result.success && result.printed) {
        console.log('✅ Printed to thermal printer');
        onClose();
      } else if (result.useBrowserPrint || result.fallback) {
        console.warn('⚠️ Thermal printer not available, using browser print:', result.message);
        window.print();
      }
    } catch (error) {
      console.error('❌ Print error:', error);
      window.print();
    }
  };

  const handleWhatsApp = () => {
    const phone = invoice.customer?.mobile
      ? `91${invoice.customer.mobile.replace(/\D/g, '')}`
      : '';
    const shopName = invoice.shop?.name || 'Our Store';
    const invoiceNo = invoice.invoice_number || 'N/A';
    const date = formatDate(invoice.date || invoice.created_at || new Date().toISOString());

    const itemLines = (invoice.items || [])
      .map((item: any) => `  • ${item.name} x${item.qty} = ₹${formatNumber(item.total)}`)
      .join('\n');
    const paymentLines = (invoice.payments || [])
      .map((p: any) => `  ${p.method.toUpperCase()}: ₹${formatNumber(p.amount)}`)
      .join('\n');

    const message = [
      `${shopName}`,
      `Invoice: ${invoiceNo}`,
      `Date: ${date}`,
      invoice.customer?.name ? `Customer: ${invoice.customer.name}` : null,
      ``,
      `Items:`,
      itemLines,
      ``,
      `Subtotal: ₹${formatNumber(invoice.summary?.total || 0)}`,
      (invoice.summary?.tax || 0) > 0 ? `GST: ₹${formatNumber(invoice.summary.tax)}` : null,
      (invoice.discount || 0) > 0 ? `Discount: -₹${formatNumber(invoice.discount)}` : null,
      `Total: ₹${formatNumber(invoice.summary?.grand_total || 0)}`,
      ``,
      `Payment:`,
      paymentLines,
      ``,
      `Thank you for shopping with us! 🙏`,
    ]
      .filter(line => line !== null)
      .join('\n');

    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    const handleShortcuts = (e: KeyboardEvent) => {
      if (e.key === '1') {
        e.preventDefault();
        handleWhatsApp();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, [handleWhatsApp, onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 print:static print:bg-white print:p-0">
      {/* Floating action buttons */}
      <div className="print:hidden fixed top-4 right-4 flex gap-2 z-50">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-lg transition-colors"
        >
          <IonIcon icon={printOutline} />
          {t('receipt.print')}
        </button>
        <button
          onClick={handleWhatsApp}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 shadow-lg transition-colors"
        >
          <IonIcon icon={logoWhatsapp} />
          WhatsApp
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 shadow-lg transition-colors"
        >
          <IonIcon icon={closeOutline} />
          {t('common.close')}
        </button>
      </div>

      {/* Improved Receipt Paper */}
      <div
        id="receipt"
        className="bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none"
        style={{
          width: '340px',
          maxWidth: 'calc(100% - 2rem)',
          fontFamily: "'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, sans-serif",
          fontSize: '12px',
          lineHeight: '1.5',
          color: '#1e293b',
        }}
      >
        {/* Inner content with padding */}
        <div className="p-5 print:p-3">
          {/* Shop Header */}
          <div className="text-center border-b border-gray-200 pb-3 mb-3">
            <div className="text-xl font-bold tracking-tight text-gray-800">
              {invoice.shop?.name || 'MY STORE'}
            </div>
            {invoice.shop?.address && (
              <div className="text-xs text-gray-500 mt-1">{invoice.shop.address}</div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              {invoice.shop?.mobile && `${t('receipt.phoneLabel')}: ${invoice.shop.mobile}`}
              {invoice.shop?.gstin && `  |  GST: ${invoice.shop.gstin}`}
            </div>
          </div>

          {/* Invoice Info Grid */}
          <div className="grid grid-cols-2 grid-rows-[1.5fr,2fr,1fr,0fr]">
            <span className="text-gray-500">{t('receipt.invoiceNo')}:</span>
            <span className="font-semibold text-left">{invoice.invoice_number || 'N/A'}</span>
            <span className="text-gray-500">{t('receipt.date')}:</span>
            <span className="text-left">{formatDate(invoice.date || invoice.created_at || new Date().toISOString())}</span>
            {invoice.customer?.name && (
              <>
                <span className="text-gray-500">{t('receipt.customer')}:</span>
                <span className="font-medium text-right">{invoice.customer.name}</span>
              </>
            )}
            {invoice.customer?.mobile && (
              <>
                <span className="text-gray-500">{t('receipt.mobile')}:</span>
                <span className="text-right">{invoice.customer.mobile}</span>
              </>
            )}
          </div>

          {/* TAX INVOICE Label */}
          <div className="text-center bg-gray-100 py-1 rounded-md text-sm font-semibold text-gray-700 mb-3">
            {t('receipt.taxInvoice')}
          </div>

          {/* Items Header */}
          <div className="grid grid-cols-[0fr,0.7fr,0.8fr,1fr] text-xs font-bold border-b border-gray-200 pb-2 mb-2 text-gray-600">
            <span>{t('receipt.item')}</span>
            <span className="text-center">{t('receipt.qty')}</span>
            <span className="text-right">{t('receipt.rate')}</span>
            <span className="text-right">{t('receipt.amt')}</span>
          </div>

          {/* Items List */}
          <div className="space-y-2 mb-3">
            {(invoice.items || []).map((item: any, idx: number) => (
              <div key={idx}>
                <div className="grid grid-cols-[0fr,0.7fr,0.8fr,1fr] text-xs">
                  <span className="font-medium text-gray-800">{item.name}</span>
                  <span className="text-center text-gray-600">{item.qty}</span>
                  <span className="text-right text-gray-600">₹{formatNumber(item.price)}</span>
                  <span className="text-right font-semibold text-gray-800">₹{formatNumber(item.total)}</span>
                </div>
                {(item.hsn_code || item.tax_percent > 0) && (
                  <div className="text-[10px] text-gray-400 mt-0.5 pl-1">
                    {item.hsn_code && <span>{t('receipt.hsn')}:{item.hsn_code} </span>}
                    {item.tax_percent > 0 && (
                      <span>
                        {item.tax_percent}% GST (CGST:{formatNumber(item.cgst)} | SGST:{formatNumber(item.sgst)})
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="border-t border-gray-200 pt-2 mb-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">{t('receipt.subtotal')}:</span>
              <span>₹{formatNumber(invoice.summary?.total || 0)}</span>
            </div>
            {(invoice.summary?.tax || 0) > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('receipt.cgst')}:</span>
                  <span>₹{formatNumber(invoice.summary?.cgst || invoice.summary?.tax / 2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t('receipt.sgst')}:</span>
                  <span>₹{formatNumber(invoice.summary?.sgst || invoice.summary?.tax / 2)}</span>
                </div>
              </>
            )}
            {(invoice.discount || 0) > 0 && (
              <div className="flex justify-between text-red-600">
                <span>{t('receipt.discount')}:</span>
                <span>-₹{formatNumber(invoice.discount)}</span>
              </div>
            )}
          </div>

          {/* Grand Total */}
          <div className="flex justify-between text-base font-bold border-t-2 border-gray-300 pt-2 mb-3">
            <span>{t('receipt.total')}:</span>
            <span>₹{formatNumber(invoice.summary?.grand_total || 0)}</span>
          </div>

          {/* Payments */}
          {(invoice.payments || []).length > 0 && (
            <div className="bg-gray-50 p-2 rounded-lg mb-3 text-xs">
              <div className="font-semibold text-gray-700 mb-1">{t('receipt.payment')}:</div>
              {(invoice.payments || []).map((payment: any, idx: number) => (
                <div key={idx} className="flex justify-between">
                  <span className="capitalize">{String(t(`receipt.paymentMethods.${payment.method}`, { defaultValue: payment.method }))}:</span>
                  <span>₹{formatNumber(payment.amount)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 border-t border-gray-200 pt-3 mt-2">
            <div className="font-medium text-gray-600">{t('receipt.thankYou')}</div>
            <div className="mt-1">{t('receipt.visitAgain')}</div>
            <div className="mt-1 text-[10px]">{t('receipt.computerGenerated')}</div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
          body * {
            visibility: hidden;
          }
          #receipt, #receipt * {
            visibility: visible;
          }
          #receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm !important;
            padding: 0;
            margin: 0;
            border-radius: 0;
            box-shadow: none;
            background: white;
          }
          #receipt > div {
            padding: 0.5rem !important;
          }
          .print\\:hidden, button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}