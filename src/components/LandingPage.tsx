import React from 'react';
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  QrCode,
  Lock,
  FileCheck2,
  Users,
  LineChart,
  Tag,
  Receipt,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  ChevronRight,
  Globe
} from 'lucide-react';
import { AppView } from './Navbar.tsx';

interface LandingPageProps {
  onNavigate: (view: AppView) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 selection:bg-blue-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.12),rgba(255,255,255,0))]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            {/* Tagline pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Create. Get Paid. Unlock.</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              Turn your digital content into a{' '}
              <span className="text-blue-600 underline decoration-blue-200 decoration-wavy underline-offset-8">
                business
              </span>
              .
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Explore Payment is the high-conversion monetization engine for teachers, developers, coaches, and creators.
              Accept instant UPI QR payments and automatically unlock protected websites, courses, and digital files.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <button
                id="hero-start-selling-btn"
                onClick={() => onNavigate('dashboard')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all text-sm"
              >
                Start Selling Now
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="hero-live-demo-btn"
                onClick={() => onNavigate('public_pay')}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 shadow-xs transition-all text-sm"
              >
                <QrCode className="w-4 h-4 text-blue-600" />
                Try Live UPI QR Checkout
              </button>
            </div>

            {/* Micro proof badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Zero platform lock-in</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Direct UPI / Bank Settlements</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Cryptographic Pay-to-Unlock</span>
              </div>
            </div>
          </div>

          {/* Interactive Flow Preview Card */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
              <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="font-mono text-slate-400 ml-2">explorepayment.com/pay/vipul/networking-course</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px] border border-emerald-500/30">
                    UPI Verified Gateway Active
                  </span>
                </div>
              </div>

              <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="inline-block px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">
                    Live Product Showcase
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">
                    Premium Networking Course (CCNA Mastery)
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Customer scans the dynamic UPI QR code with any UPI app (GPay, PhonePe, Paytm).
                    Backend verifies payment directly against the provider. No manual screenshot uploads required!
                  </p>
                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-3xl font-extrabold text-slate-900">₹499</span>
                    <span className="text-sm text-slate-400 line-through">₹1,999</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      75% OFF
                    </span>
                  </div>
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={() => onNavigate('public_pay')}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Test Buy Now Flow
                    </button>
                    <button
                      onClick={() => onNavigate('dashboard')}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                    >
                      View Creator Dashboard
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-50 rounded-xl p-5 border border-slate-200/80 text-center">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20">
                    <QrCode className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">Instant Pay-to-Unlock Flow</h4>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Scans QR &rarr; Provider Webhook &rarr; Order & Token Generated &rarr; Destination Content Opened
                  </p>
                  <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700 text-left space-y-1">
                    <div className="text-emerald-600 font-semibold">✓ Payment Verified: ₹499</div>
                    <div className="text-slate-600">Order: EXP-2026-000001</div>
                    <div className="text-blue-600 truncate">Token: ep_tok_89a... (Signed)</div>
                    <div className="text-purple-600">Action: Access Granted</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-Step How It Works Section */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              Simple 5-Step Workflow
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              How Explore Payment Works
            </h3>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Go from idea to verified customer payments in under three minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {[
              {
                step: '01',
                title: 'Create Your Product',
                desc: 'Attach protected URLs, courses, digital files, private Telegram groups, or custom content.'
              },
              {
                step: '02',
                title: 'Set Your Price',
                desc: 'Define price in INR (e.g. ₹499), discount prices, and configure optional discount coupons.'
              },
              {
                step: '03',
                title: 'Share Payment Link',
                desc: 'Get your customized branded payment page link to share on social media or email.'
              },
              {
                step: '04',
                title: 'Get Verified Payments',
                desc: 'Customers pay via UPI QR, Intent, or Card. Direct provider webhook checks verify authenticity.'
              },
              {
                step: '05',
                title: 'Automatically Unlock',
                desc: 'Generate signed access tokens, tax invoices, and immediately redirect customer to secret destination.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/20 transition-all group"
              >
                <div className="text-2xl font-black text-blue-600 font-mono mb-2">
                  {item.step}
                </div>
                <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-blue-600 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
              Production Architecture
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Everything Creators & Sellers Need
            </h3>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Built for speed, bank-grade verification, and seamless pay-to-access delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                <QrCode className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-slate-900 mb-2">UPI QR & Direct Intent</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dynamic QR codes generated with exact rupee amounts. Scan using any UPI app with one-click copy UPI ID and intent triggers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-slate-900 mb-2">Cryptographic Pay-to-Unlock</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Destination URLs and downloads are never exposed before payment. Secret tokens with HMAC-SHA256 signatures ensure zero leakages.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-slate-900 mb-2">Anti-Fraud Webhooks</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Never unlock on fake screenshots. Verification happens through signed webhook events with replay protection and idempotency keys.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <Tag className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-slate-900 mb-2">Coupons & Discounts</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Create percentage or fixed amount discounts with minimum order thresholds, usage caps, and expiration schedules.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <Receipt className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-slate-900 mb-2">Automated GST Invoicing</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every purchase automatically creates a compliant tax invoice complete with GST calculation, transaction ID, and downloadable receipt.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
                <LineChart className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-base text-slate-900 mb-2">Real-Time Analytics</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track revenue over time, conversion funnels, visitor drop-offs, top revenue-generating products, and customer repeat purchases.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-extrabold tracking-tight">
            Ready to monetize your digital content?
          </h3>
          <p className="mt-3 text-blue-100 text-sm sm:text-base max-w-xl mx-auto">
            Create your first product in 60 seconds and start receiving direct verified payments today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-3.5 rounded-xl bg-white text-blue-600 font-bold text-sm shadow-md hover:bg-blue-50 transition-colors"
            >
              Open Creator Dashboard
            </button>
            <button
              onClick={() => onNavigate('public_pay')}
              className="px-6 py-3.5 rounded-xl bg-blue-700/80 border border-blue-400 text-white font-bold text-sm hover:bg-blue-700 transition-colors"
            >
              Experience Customer Checkout
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-slate-200">Explore Payment</span>
            <span>— Create. Get Paid. Unlock.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-500">© 2026 Explore Payment Inc. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
