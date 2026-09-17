import React, { useState, useEffect } from 'react';
import { X, Printer, ShieldCheck, Download, CheckCircle2 } from 'lucide-react';
import { Invoice } from '../types.ts';

interface InvoiceModalProps {
  orderId: string;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ orderId, onClose }) => {
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoice();
  }, [orderId]);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/invoice`);
      if (res.ok) {
        const json = await res.json();
        setInvoice(json.invoice);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Controls Bar */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Explore Payment Tax Invoice</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Generating invoice statement...
          </div>
        ) : !invoice ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Invoice not found.
          </div>
        ) : (
          <div className="p-8 space-y-6 text-slate-900 font-sans" id="printable-invoice">
            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b border-slate-200 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-sm">
                    EP
                  </div>
                  <span className="font-extrabold text-lg text-slate-900 tracking-tight">
                    EXPLORE <span className="text-blue-600">PAYMENT</span>
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Creator Digital Monetization Platform
                </p>
                <div className="mt-2 text-xs text-slate-600">
                  <strong>Merchant:</strong> {invoice.creator.merchantName} ({invoice.creator.name})<br />
                  <strong>UPI VPA:</strong> {invoice.creator.upiId}<br />
                  <strong>Email:</strong> {invoice.creator.email}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                  Tax Invoice
                </span>
                <div className="text-xl font-mono font-black text-slate-900 mt-0.5">
                  {invoice.invoiceNumber}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  <strong>Date:</strong> {new Date(invoice.date).toLocaleDateString()}<br />
                  <strong>Order ID:</strong> {invoice.orderId}
                </p>
                <div className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/60">
                  <CheckCircle2 className="w-3 h-3" />
                  PAID IN FULL
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">
                Billed To
              </div>
              <div className="font-bold text-slate-800 text-sm">{invoice.customer.name}</div>
              <div className="text-slate-600 font-mono mt-0.5">{invoice.customer.email}</div>
              {invoice.customer.phone && (
                <div className="text-slate-600 mt-0.5">{invoice.customer.phone}</div>
              )}
            </div>

            {/* Line Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100/70 border-b border-slate-200 font-bold text-slate-700">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-center">Type</th>
                    <th className="p-3 text-right">Amount ({invoice.pricing.currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{invoice.product.name}</div>
                      <div className="text-[11px] text-slate-500">Digital Access License</div>
                    </td>
                    <td className="p-3 text-center capitalize text-slate-600">
                      {invoice.product.type.replace('_', ' ')}
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      ₹{invoice.pricing.subtotal}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pricing Breakdown */}
            <div className="flex justify-end">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{invoice.pricing.subtotal}</span>
                </div>
                {invoice.pricing.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount:</span>
                    <span className="font-mono">-₹{invoice.pricing.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Taxable Value:</span>
                  <span className="font-mono">₹{invoice.pricing.taxableAmount}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>GST (18% inclusive):</span>
                  <span className="font-mono">₹{invoice.pricing.taxes}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-black text-sm border-t border-slate-200 pt-2">
                  <span>Total Paid:</span>
                  <span className="font-mono text-base text-blue-600">₹{invoice.pricing.total}</span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
              <div><strong>Payment Ref:</strong> {invoice.payment.id}</div>
              <div><strong>Provider:</strong> {invoice.payment.provider} ({invoice.payment.method})</div>
              <div><strong>Verification:</strong> Cryptographically verified banking settlement</div>
            </div>

            {/* Footer */}
            <div className="text-center text-[10px] text-slate-400 border-t border-slate-100 pt-4">
              Explore Payment Technologies • Thank you for supporting independent digital creators!
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
