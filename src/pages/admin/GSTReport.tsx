import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getGSTReport } from "../../renderer/services/reportApi";
import { IonIcon } from "@ionic/react";
import { calendarOutline, downloadOutline, printOutline, refreshOutline } from "ionicons/icons";
import * as XLSX from 'xlsx';

export default function GSTReport() {
    const { t } = useTranslation();
    const currentMonth = new Date().toISOString().slice(0, 7);
    const [month, setMonth] = useState(currentMonth);
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => { load(); }, [month]);

    const load = async () => {
        setLoading(true);
        try {
            const data = await getGSTReport(month);
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

    const monthLabel = new Date(month + '-01').toLocaleDateString('en-IN', {
        month: 'long', year: 'numeric'
    });

    // ── Excel Export ──────────────────────────────────────────
    const handleExcelDownload = () => {
        if (!report) return;
        const wb = XLSX.utils.book_new();

        // Sheet 1: GST Summary by slab
        const slabRows = [
            [t('gstReport.excelTitle', { month: monthLabel })],
            [t('gstReport.shopLabel') + ': ' + (report.shop?.name || 'N/A')],
            [t('gstReport.gstinLabel') + ': ' + (report.shop?.gstin || 'N/A')],
            [],
            [t('gstReport.slabSummaryHeader')],
            [t('gstReport.taxRateHeader'), t('gstReport.invoicesHeader'), t('gstReport.taxableValueHeader'), t('gstReport.cgstHeader'), t('gstReport.sgstHeader'), t('gstReport.totalTaxHeader')],
            ...report.slabs.map((s: any) => [
                s.tax_percent + '%',
                s.invoice_count,
                s.taxable_value?.toFixed(2),
                (s.total_tax / 2)?.toFixed(2),
                (s.total_tax / 2)?.toFixed(2),
                s.total_tax?.toFixed(2),
            ]),
            [],
            [t('gstReport.exemptZeroRated'), '', report.exempt_value?.toFixed(2), 0, 0, 0],
            [],
            [`${t('gstReport.totalLabel')} (${report.summary.total_invoices} ${t('gstReport.billsUnit')})`, '', report.summary.total_taxable?.toFixed(2),
            (report.summary.total_tax / 2)?.toFixed(2),
            (report.summary.total_tax / 2)?.toFixed(2),
            report.summary.total_tax?.toFixed(2)],
        ];
        const ws1 = XLSX.utils.aoa_to_sheet(slabRows);
        ws1['!cols'] = [{ wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, ws1, 'GST Summary');

        // Sheet 2: Invoice list
        const invoiceRows = [
            [t('gstReport.invoiceListTitle', { month: monthLabel })],
            [],
            [t('gstReport.invoiceNoHeader'), t('gstReport.dateHeader'), t('gstReport.customerHeader'), t('gstReport.taxableValueHeader'), t('gstReport.taxHeader'), t('gstReport.grandTotalHeader')],
            ...report.invoices.map((inv: any) => [
                inv.invoice_number,
                new Date(inv.created_at).toLocaleDateString('en-IN'),
                inv.customer_name || t('gstReport.walkInCustomer'),
                inv.total?.toFixed(2),
                inv.tax?.toFixed(2),
                inv.grand_total?.toFixed(2),
            ]),
        ];
        const ws2 = XLSX.utils.aoa_to_sheet(invoiceRows);
        ws2['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 20 }, { wch: 18 }, { wch: 12 }, { wch: 15 }];
        XLSX.utils.book_append_sheet(wb, ws2, 'Invoices');

        XLSX.writeFile(wb, `GST_Report_${month}.xlsx`);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center print:hidden">
                <div>
                    <h1 className="text-3xl font-bold text-white">{t('gstReport.title')}</h1>
                    <p className="text-gray-500 text-sm">{t('gstReport.subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
                        <IonIcon icon={calendarOutline} className="text-gray-400" />
                        <input
                            type="month"
                            value={month}
                            max={currentMonth}
                            onChange={e => setMonth(e.target.value)}
                            className="focus:outline-none text-sm"
                        />
                    </div>
                    <button onClick={load}
                        className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
                        <IonIcon icon={refreshOutline} className="text-gray-600 text-xl" />
                    </button>
                    <button onClick={handleExcelDownload}
                        disabled={!report}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl disabled:opacity-40">
                        <IonIcon icon={downloadOutline} className="text-xl" />
                        {t('gstReport.downloadExcel')}
                    </button>
                    <button onClick={() => window.print()}
                        disabled={!report}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl disabled:opacity-40">
                        <IonIcon icon={printOutline} className="text-xl" />
                        {t('gstReport.printButton')}
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
            ) : !report ? (
                <div className="text-center text-gray-500 py-20">{t('gstReport.noData')}</div>
            ) : !report?.summary ? (
                <div className="text-center text-gray-500 py-20">{t('gstReport.noDataForMonth')}</div>
            ) : (
                <div className="space-y-4" id="gst-print-area">

                    {/* Print header */}
                    <div className="hidden print:block text-center mb-4">
                        <h2 className="text-xl font-bold">{report.shop?.name}</h2>
                        {report.shop?.gstin && <p className="text-sm">{t('gstReport.gstinLabel')}: {report.shop.gstin}</p>}
                        <h3 className="text-lg font-bold mt-2">{t('gstReport.printTitle')} — {monthLabel}</h3>
                    </div>

                    {/* Summary cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: t('gstReport.totalInvoices'), value: report.summary.total_invoices, prefix: '' },
                            { label: t('gstReport.taxableValue'), value: fmt(report.summary.total_taxable), prefix: '₹' },
                            { label: t('gstReport.totalGst'), value: fmt(report.summary.total_tax), prefix: '₹' },
                            { label: t('gstReport.grandTotal'), value: fmt(report.summary.grand_total), prefix: '₹' },
                        ].map((card, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm print:border print:shadow-none">
                                <p className="text-gray-500 text-sm">{card.label}</p>
                                <p className="text-2xl font-bold text-gray-800 mt-1">{card.prefix}{card.value}</p>
                            </div>
                        ))}
                    </div>

                    {/* GST Slab Table */}
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden print:border print:shadow-none">
                        <div className="bg-gray-800 px-6 py-4">
                            <h3 className="text-white font-bold">{t('gstReport.slabSummaryTitle')}</h3>
                            <p className="text-gray-400 text-sm">{t('gstReport.slabSummaryDesc')}</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left p-4 font-semibold text-gray-600">{t('gstReport.taxRateHeader')}</th>
                                        <th className="text-right p-4 font-semibold text-gray-600">{t('gstReport.invoicesHeader')}</th>
                                        <th className="text-right p-4 font-semibold text-gray-600">{t('gstReport.taxableValueHeader')}</th>
                                        <th className="text-right p-4 font-semibold text-gray-600">{t('gstReport.cgstHeader')}</th>
                                        <th className="text-right p-4 font-semibold text-gray-600">{t('gstReport.sgstHeader')}</th>
                                        <th className="text-right p-4 font-semibold text-gray-600">{t('gstReport.totalTaxHeader')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.slabs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center p-8 text-gray-400">{t('gstReport.noGstTransactions')}</td>
                                        </tr>
                                    ) : (
                                        <>
                                            {report.slabs.map((s: any, i: number) => (
                                                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                                                    <td className="p-4 font-semibold text-gray-800">{s.tax_percent}%</td>
                                                    <td className="p-4 text-right text-gray-600">{s.invoice_count}</td>
                                                    <td className="p-4 text-right text-gray-700">₹{fmt(s.taxable_value)}</td>
                                                    <td className="p-4 text-right text-blue-600">₹{fmt(s.total_tax / 2)}</td>
                                                    <td className="p-4 text-right text-blue-600">₹{fmt(s.total_tax / 2)}</td>
                                                    <td className="p-4 text-right font-semibold text-gray-800">₹{fmt(s.total_tax)}</td>
                                                </tr>
                                            ))}
                                            {/* Exempt row */}
                                            {report.exempt_value > 0 && (
                                                <tr className="border-b border-gray-50 hover:bg-gray-50">
                                                    <td className="p-4 font-semibold text-gray-800">0% ({t('gstReport.exemptLabel')})</td>
                                                    <td className="p-4 text-right text-gray-600">—</td>
                                                    <td className="p-4 text-right text-gray-700">₹{fmt(report.exempt_value)}</td>
                                                    <td className="p-4 text-right text-gray-400">₹0.00</td>
                                                    <td className="p-4 text-right text-gray-400">₹0.00</td>
                                                    <td className="p-4 text-right font-semibold text-gray-800">₹0.00</td>
                                                </tr>
                                            )}
                                            {/* Total row */}
                                            <tr className="bg-gray-800 text-white">
                                                <td className="p-4 font-bold">{t('gstReport.totalLabel')}</td>
                                                <td className="p-4 text-right font-bold">{report.summary.total_invoices} {t('gstReport.billsUnit')}</td>
                                                <td className="p-4 text-right font-bold">₹{fmt(report.summary.total_taxable)}</td>
                                                <td className="p-4 text-right font-bold">₹{fmt(report.summary.total_tax / 2)}</td>
                                                <td className="p-4 text-right font-bold">₹{fmt(report.summary.total_tax / 2)}</td>
                                                <td className="p-4 text-right font-bold">₹{fmt(report.summary.total_tax)}</td>
                                            </tr>
                                        </>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Invoice List */}
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden print:border print:shadow-none">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800">{t('gstReport.invoiceListHeader', { count: report.invoices.length })}</h3>
                            <p className="text-sm text-gray-400">{monthLabel}</p>
                        </div>
                        <div className="overflow-x-auto max-h-96 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                                    <tr>
                                        <th className="text-left p-3 font-semibold text-gray-600">{t('gstReport.invoiceNoHeader')}</th>
                                        <th className="text-left p-3 font-semibold text-gray-600">{t('gstReport.dateHeader')}</th>
                                        <th className="text-left p-3 font-semibold text-gray-600">{t('gstReport.customerHeader')}</th>
                                        <th className="text-right p-3 font-semibold text-gray-600">{t('gstReport.taxableHeader')}</th>
                                        <th className="text-right p-3 font-semibold text-gray-600">{t('gstReport.taxHeader')}</th>
                                        <th className="text-right p-3 font-semibold text-gray-600">{t('gstReport.grandTotalHeader')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.invoices.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center p-8 text-gray-400">{t('gstReport.noInvoices')}</td>
                                        </tr>
                                    ) : (
                                        report.invoices.map((inv: any, i: number) => (
                                            <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                                                <td className="p-3 font-mono text-gray-700">{inv.invoice_number}</td>
                                                <td className="p-3 text-gray-600">
                                                    {new Date(inv.created_at).toLocaleDateString('en-IN')}
                                                </td>
                                                <td className="p-3 text-gray-600">{inv.customer_name || t('gstReport.walkInCustomer')}</td>
                                                <td className="p-3 text-right text-gray-700">₹{fmt(inv.total)}</td>
                                                <td className="p-3 text-right text-orange-600">₹{fmt(inv.tax)}</td>
                                                <td className="p-3 text-right font-semibold text-gray-800">₹{fmt(inv.grand_total)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            )}

            {/* Print styles */}
            <style>{`
        @media print {
          @page { size: A4; margin: 15mm; }
          body * { visibility: hidden; }
          #gst-print-area, #gst-print-area * { visibility: visible; }
          #gst-print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>
        </div>
    );
}