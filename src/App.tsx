import React, { useState, useEffect } from 'react';
import { Navbar, AppView } from './components/Navbar.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { CreatorDashboard } from './components/CreatorDashboard.tsx';
import { PublicProductPage } from './components/PublicProductPage.tsx';
import { UnlockPortal } from './components/UnlockPortal.tsx';
import { CustomerPortal } from './components/CustomerPortal.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [creatorSlug, setCreatorSlug] = useState('vipul');
  const [productSlug, setProductSlug] = useState('networking-course');
  const [activeAccessToken, setActiveAccessToken] = useState<string>('ep_tok_ccna_lifetime_vault_2026');

  // Parse path on initial load if user navigated with hash or URL
  useEffect(() => {
    const handleUrlRouting = () => {
      const path = window.location.pathname;
      if (path.startsWith('/pay/')) {
        const parts = path.split('/').filter(Boolean);
        if (parts.length >= 3) {
          setCreatorSlug(parts[1]);
          setProductSlug(parts[2]);
          setCurrentView('public_pay');
        }
      } else if (path.startsWith('/unlock/')) {
        const parts = path.split('/').filter(Boolean);
        if (parts.length >= 2) {
          setActiveAccessToken(parts[1]);
          setCurrentView('unlock_portal');
        }
      }
    };

    handleUrlRouting();
    window.addEventListener('popstate', handleUrlRouting);
    return () => window.removeEventListener('popstate', handleUrlRouting);
  }, []);

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenPublicPayPage = (slug: string) => {
    setProductSlug(slug);
    setCurrentView('public_pay');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenUnlockPage = (token: string) => {
    setActiveAccessToken(token);
    setCurrentView('unlock_portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSuccess = (token: string, orderId: string) => {
    setActiveAccessToken(token);
    setCurrentView('unlock_portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        activeProductSlug={productSlug}
        activeCreatorSlug={creatorSlug}
        activeAccessToken={activeAccessToken}
      />

      <div className="flex-1">
        {currentView === 'landing' && (
          <LandingPage onNavigate={handleNavigate} />
        )}

        {currentView === 'dashboard' && (
          <CreatorDashboard
            onOpenPublicPayPage={handleOpenPublicPayPage}
            onOpenUnlockPage={handleOpenUnlockPage}
          />
        )}

        {currentView === 'public_pay' && (
          <PublicProductPage
            creatorSlug={creatorSlug}
            productSlug={productSlug}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}

        {currentView === 'unlock_portal' && (
          <UnlockPortal
            token={activeAccessToken}
            onNavigateHome={() => handleNavigate('landing')}
          />
        )}

        {currentView === 'customer_portal' && (
          <CustomerPortal onOpenUnlockPage={handleOpenUnlockPage} />
        )}

        {currentView === 'admin' && (
          <AdminPanel />
        )}
      </div>
    </div>
  );
}
