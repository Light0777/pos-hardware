import React, { useEffect } from 'react';
import { IonIcon } from '@ionic/react';
import { storefrontOutline, checkmarkCircleOutline, printOutline, closeOutline } from 'ionicons/icons';

interface InvoiceReceiptProps {
  invoice: any;
  onClose: () => void;
}

export default function InvoiceReceipt({ invoice, onClose }: InvoiceReceiptProps) {
  // Remove the auto-print useEffect

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 print:static print:bg-white print:p-0">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto print:max-h-none print:overflow-visible">
        {/* Header - Hidden when printing */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center print:hidden">
          <h2 className="text-xl font-bold text-black">Invoice Preview</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <IonIcon icon={printOutline} />
              Print
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <IonIcon icon={closeOutline} />
              Close
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-8 print:p-4 max-w-[400px] mx-auto font-mono text-sm">
          {/* Shop Header */}
          <div className="text-center border-b pb-4 mb-4">
            <div className="flex justify-center mb-2">
              <div className="bg-gradient-to-br from-green-600 to-green-700 p-2 rounded-xl inline-block">
                <IonIcon icon={storefrontOutline} className="text-3xl text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{invoice.shop?.name || 'My Store'}</h1>
            <p className="text-xs text-gray-600 mt-1">{invoice.shop?.address || 'Chennai, Tamil Nadu'}</p>
            <p className="text-xs text-gray-600">GSTIN: {invoice.shop?.gstin || '33ABCDE1234F1Z5'}</p>
            <p className="text-xs text-gray-500 mt-2">Phone: {invoice.shop?.mobile || '9876543210'}</p>
          </div>

          {/* Invoice Info */}
          <div className="border-b pb-3 mb-3">
            <div className="flex justify-between mb-1">
              <span className="font-semibold">Invoice No:</span>
              <span>{invoice.invoice_number || 'N/A'}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="font-semibold">Date:</span>
              <span>{formatDate(invoice.created_at || new Date())}</span>
            </div>
            {(invoice.customer || invoice.customer_name) && (
              <div className="mt-2 pt-2 border-t">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold">Customer:</span>
                  <span>{invoice.customer?.name || invoice.customer_name || 'Guest'}</span>
                </div>
                {(invoice.customer?.mobile || invoice.customer_mobile) && (
                  <div className="flex justify-between">
                    <span className="font-semibold">Mobile:</span>
                    <span>{invoice.customer?.mobile || invoice.customer_mobile}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="mb-4">
            <table className="w-full text-xs">
              <thead className="border-b">
                <tr className="text-left">
                  <th className="pb-2">Item</th>
                  <th className="pb-2 text-center">Qty</th>
                  <th className="pb-2 text-right">Price</th>
                  <th className="pb-2 text-right">Total</th>
                 </tr>
              </thead>
              <tbody>
                {(invoice.items || invoice.cart?.items || []).map((item: any, index: number) => (
                  <tr key={index} className="border-b border-dotted">
                    <td className="py-2">
                      <div className="font-medium">{item.name || item.product?.name}</div>
                      {item.gst_percent > 0 && (
                        <div className="text-xs text-gray-500">GST: {item.gst_percent}%</div>
                      )}
                    </td>
                    <td className="py-2 text-center">{item.qty || item.quantity}</td>
                    <td className="py-2 text-right">₹{formatNumber(item.price)}</td>
                    <td className="py-2 text-right font-medium">₹{formatNumber(item.total || (item.price * (item.qty || item.quantity)))}</td>
                   </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="border-t pt-3 mb-3">
            <div className="flex justify-between mb-1">
              <span>Subtotal:</span>
              <span>₹{formatNumber(invoice.summary?.total || invoice.total_amount || 0)}</span>
            </div>
            {(invoice.summary?.tax > 0 || invoice.tax > 0) && (
              <div className="flex justify-between mb-1">
                <span>GST ({invoice.gst_percent || 18}%):</span>
                <span>₹{formatNumber(invoice.summary?.tax || invoice.tax || 0)}</span>
              </div>
            )}
            {invoice.discount > 0 && (
              <div className="flex justify-between mb-1">
                <span>Discount:</span>
                <span>-₹{formatNumber(invoice.discount)}</span>
              </div>
            )}
            <div className="flex justify-between mt-2 pt-2 border-t text-base font-bold">
              <span>Grand Total:</span>
              <span>₹{formatNumber(invoice.summary?.grand_total || invoice.grand_total || 0)}</span>
            </div>
          </div>

          {/* Payments */}
          {(invoice.payments || []).length > 0 && (
            <div className="border-t pt-3 mb-3">
              <div className="font-semibold mb-2">Payment Details</div>
              {(invoice.payments || []).map((payment: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="capitalize">{payment.method}:</span>
                  <span>₹{formatNumber(payment.amount)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="text-center border-t pt-4 mt-4">
            <div className="flex justify-center mb-2">
              <IonIcon icon={checkmarkCircleOutline} className="text-green-600 text-xl" />
            </div>
            <p className="text-xs font-semibold text-green-600 mb-1">Payment Successful!</p>
            <p className="text-xs text-gray-600">Thank you for shopping with us!</p>
            <p className="text-xs text-gray-500 mt-2">*** This is a computer generated invoice ***</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 0mm;
          }
          body {
            margin: 0mm;
            padding: 0mm;
          }
          .fixed {
            position: relative !important;
          }
          .print\\:static {
            position: static !important;
          }
          button {
            display: none !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-4 {
            padding: 0.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}