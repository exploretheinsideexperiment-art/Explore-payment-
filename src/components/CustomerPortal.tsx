import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  KeyRound,
  Download,
  Receipt,
  ExternalLink,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { InvoiceModal } from './InvoiceModal.tsx';

interface CustomerPortalProps {
  onOpenUnlockPage: (token: string) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ onOpenUnlockPage }) => {
  const [email, setEmail] = useState('rahul.sen@example.com');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeInvoiceOrderId, setActiveInvoiceOrderId] = useState<string | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/customer/orders?email=${encodeURIComponent(email.trim())}`);
      if (res.ok) {
        const json = await res.json();
        setOrders(json.data || []);
      } else {
        setOrders([]);
      }
    } catch (e) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-12 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Customer Purchase Vault</h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Retrieve your active courses, pay-to-unlock tokens, downloadable files, and tax invoices.
          </p>
        </div>

        {/* Email Lookup Box */}
        <form
          onSubmit={handleLookup}
          className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto space-y-3"
        >
          <label className="block text-xs font-bold text-slate-700">
            Enter your purchase email
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              required
              placeholder="e.g. rahul.sen@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:border-blue-600 bg-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Finding...' : 'Search Vault'}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Instant look-up of all verified purchases tied to this email.
          </p>
        </form>

        {/* Results List */}
        {hasSearched && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-2 text-xs text-slate-500">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="font-bold text-slate-700">No purchases found for "{email}"</div>
                <p>Ensure you entered the exact email used during checkout.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Found {orders.length} Verified {orders.length === 1 ? 'Order' : 'Orders'}
                </div>

                {orders.map(order => (
                  <div
                    key={order.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{order.id}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          ✓ Verified Purchase
                        </span>
                      </div>
                      <h3 className="font-extrabold text-sm text-slate-900">{order.productName}</h3>
                      <div className="text-xs text-slate-500">
                        Paid: <strong>₹{order.amount}</strong> • Date: {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {order.accessToken && (
                        <button
                          id={`customer-unlock-btn-${order.id}`}
                          onClick={() => onOpenUnlockPage(order.accessToken)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          Launch Content
                        </button>
                      )}

                      <button
                        id={`customer-invoice-btn-${order.id}`}
                        onClick={() => setActiveInvoiceOrderId(order.id)}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        Invoice
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {activeInvoiceOrderId && (
        <InvoiceModal orderId={activeInvoiceOrderId} onClose={() => setActiveInvoiceOrderId(null)} />
      )}
    </div>
  );
};
