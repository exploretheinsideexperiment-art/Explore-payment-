import React from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  CreditCard,
  KeyRound,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  ExternalLink,
  Laptop
} from 'lucide-react';

export type AppView =
  | 'landing'
  | 'dashboard'
  | 'public_pay'
  | 'unlock_portal'
  | 'customer_portal'
  | 'admin';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  activeProductSlug?: string;
  activeCreatorSlug?: string;
  activeAccessToken?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  activeProductSlug = 'networking-course',
  activeCreatorSlug = 'vipul',
  activeAccessToken
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('landing')}>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  EXPLORE <span className="text-blue-600">PAYMENT</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                  SaaS
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                Create. Get Paid. Unlock.
              </p>
            </div>
          </div>

          {/* Navigation Views */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100/80 rounded-xl border border-slate-200/70 text-xs font-semibold text-slate-600">
            <button
              id="nav-landing-btn"
              onClick={() => onNavigate('landing')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                currentView === 'landing'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Home
            </button>

            <button
              id="nav-dashboard-btn"
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                currentView === 'dashboard'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Creator Studio
            </button>

            <button
              id="nav-paypage-btn"
              onClick={() => onNavigate('public_pay')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                currentView === 'public_pay'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              Live Checkout
            </button>

            <button
              id="nav-unlock-btn"
              onClick={() => onNavigate('unlock_portal')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                currentView === 'unlock_portal'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              Pay-to-Unlock
            </button>

            <button
              id="nav-customer-btn"
              onClick={() => onNavigate('customer_portal')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                currentView === 'customer_portal'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              My Purchases
            </button>

            <button
              id="nav-admin-btn"
              onClick={() => onNavigate('admin')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                currentView === 'admin'
                  ? 'bg-white text-blue-600 shadow-xs font-bold'
                  : 'hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Admin
            </button>
          </nav>

          {/* Quick CTA */}
          <div className="flex items-center gap-2">
            <button
              id="header-launch-checkout-btn"
              onClick={() => onNavigate('public_pay')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Test Checkout
            </button>

            <button
              id="header-studio-btn"
              onClick={() => onNavigate('dashboard')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Laptop className="w-3.5 h-3.5" />
              Creator Hub
            </button>
          </div>
        </div>

        {/* Mobile Navigation sub-row */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-100 overflow-x-auto gap-2 text-xs">
          <button
            onClick={() => onNavigate('landing')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              currentView === 'landing' ? 'bg-blue-600 text-white font-medium' : 'text-slate-600'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onNavigate('dashboard')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              currentView === 'dashboard' ? 'bg-blue-600 text-white font-medium' : 'text-slate-600'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate('public_pay')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              currentView === 'public_pay' ? 'bg-blue-600 text-white font-medium' : 'text-slate-600'
            }`}
          >
            Checkout
          </button>
          <button
            onClick={() => onNavigate('unlock_portal')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              currentView === 'unlock_portal' ? 'bg-blue-600 text-white font-medium' : 'text-slate-600'
            }`}
          >
            Unlock
          </button>
          <button
            onClick={() => onNavigate('customer_portal')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              currentView === 'customer_portal' ? 'bg-blue-600 text-white font-medium' : 'text-slate-600'
            }`}
          >
            Purchases
          </button>
          <button
            onClick={() => onNavigate('admin')}
            className={`px-2.5 py-1 rounded-md whitespace-nowrap ${
              currentView === 'admin' ? 'bg-blue-600 text-white font-medium' : 'text-slate-600'
            }`}
          >
            Admin
          </button>
        </div>
      </div>
    </header>
  );
};
