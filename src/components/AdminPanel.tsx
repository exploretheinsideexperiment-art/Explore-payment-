import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Package,
  CreditCard,
  AlertTriangle,
  FileCode,
  Sliders,
  DollarSign,
  Activity,
  CheckCircle2
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'creators' | 'fraud' | 'fees' | 'webhooks'>('overview');
  const [platformFee, setPlatformFee] = useState('2.5');
  const [feeSaveSuccess, setFeeSaveSuccess] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-8 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold">Super Admin Infrastructure Console</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  SYSTEM_HEALTHY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Explore Payment SaaS Gateway & Settlement Engine
              </p>
            </div>
          </div>

          {/* Quick Nav */}
          <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl text-xs">
            {(['overview', 'creators', 'fraud', 'fees', 'webhooks'] as const).map(t => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-colors ${
                  activeTab === t ? 'bg-blue-600 text-white font-bold' : 'text-slate-300 hover:text-white'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-bold uppercase text-slate-400">Active Creators</div>
                <div className="text-2xl font-black text-slate-900 mt-1">1,482</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">99.2% verified</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-bold uppercase text-slate-400">Total Volume</div>
                <div className="text-2xl font-black text-slate-900 mt-1">₹4.82 Cr</div>
                <div className="text-[11px] text-slate-500 mt-1">Direct bank settlements</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-bold uppercase text-slate-400">Gateway Uptime</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">99.99%</div>
                <div className="text-[11px] text-slate-500 mt-1">0 webhook drops</div>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-bold uppercase text-slate-400">Platform Take Rate</div>
                <div className="text-2xl font-black text-blue-600 mt-1">{platformFee}%</div>
                <div className="text-[11px] text-slate-500 mt-1">Net SaaS revenue</div>
              </div>
            </div>

            {/* Providers Status */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Payment Gateway Integrations</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>UPI QR & Direct Intent</span>
                    <span className="text-emerald-600 text-[11px]">ACTIVE</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Dynamic amount generation via NPCI spec</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>Razorpay & Cashfree PG</span>
                    <span className="text-emerald-600 text-[11px]">STANDBY</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Authorized payment provider fallback</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>Simulator Gateway</span>
                    <span className="text-blue-600 text-[11px]">ENABLED</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">Instant verified webhook tester for preview</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Platform Fees */}
        {activeTab === 'fees' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Platform Monetization & Take Rate</h3>
            <p className="text-slate-600">
              Set the platform commission deducted automatically on successful creator sales.
            </p>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Commission Rate (%)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  value={platformFee}
                  onChange={e => setPlatformFee(e.target.value)}
                  className="w-32 px-3 py-2 rounded-lg border border-slate-300 font-bold"
                />
                <button
                  onClick={() => {
                    setFeeSaveSuccess(true);
                    setTimeout(() => setFeeSaveSuccess(false), 2000);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                >
                  {feeSaveSuccess ? 'Updated ✓' : 'Update Commission'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Fraud Monitoring */}
        {activeTab === 'fraud' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Anti-Fraud & Replay Defense</h3>
            </div>
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-2 leading-relaxed">
              <strong>Cryptographic Verification Rules Enforced:</strong>
              <ul className="list-disc pl-4 space-y-1">
                <li>No access is granted based on client-side state declarations or transaction screenshot uploads.</li>
                <li>Webhook replay prevention: Every webhook `event_id` is cached and deduplicated.</li>
                <li>Access tokens are HMAC-SHA256 signed and tied to exact Order ID, Customer Email, and expiry timestamps.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab: Webhook Logs */}
        {activeTab === 'webhooks' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs font-mono">
            <h3 className="text-sm font-bold text-slate-900 font-sans">Recent Webhook Ingress Logs</h3>
            <div className="space-y-2">
              <div className="p-3 bg-slate-900 text-slate-300 rounded-xl text-[11px] space-y-1">
                <div className="text-emerald-400 font-bold">200 OK — POST /api/payment/webhook</div>
                <div>Event: payment.captured | ID: evt_sim_1726589000 | Order: EXP-2026-000001</div>
                <div className="text-slate-500">HMAC-SHA256 signature verified • Token issued in 8ms</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
