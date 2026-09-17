import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ExternalLink,
  Download,
  Receipt,
  AlertTriangle,
  RefreshCw,
  Video,
  FileCode,
  MessageSquare,
  Globe,
  Clock,
  User,
  Copy,
  Check
} from 'lucide-react';
import { InvoiceModal } from './InvoiceModal.tsx';

interface UnlockPortalProps {
  token: string;
  onNavigateHome?: () => void;
}

export const UnlockPortal: React.FC<UnlockPortalProps> = ({ token, onNavigateHome }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accessData, setAccessData] = useState<any>(null);
  const [showInvoice, setShowInvoice] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setError('No access token provided.');
      setLoading(false);
    }
  }, [token]);

  const validateToken = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/access/${token}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setAccessData(json.data);
      } else {
        setError(json.error || 'Access expired or invalid token.');
      }
    } catch (e) {
      setError('Network error validating access token.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Verifying Cryptographic Access Token...</h3>
          <p className="text-xs text-slate-500 font-mono">/api/access/{token ? token.slice(0, 16) + '...' : ''}</p>
        </div>
      </div>
    );
  }

  if (error || !accessData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            {error.includes('expired') ? 'Your access has expired.' : 'Invalid Access Link'}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            {error || 'This access link is invalid, expired, or has been revoked. Please check your purchase confirmation email.'}
          </p>
          <div className="pt-2">
            <button
              onClick={onNavigateHome}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    productName,
    productType,
    customerName,
    customerEmail,
    orderId,
    createdAt,
    expiresAt,
    isLifetime,
    destinationUrl,
    fileDetails,
    order
  } = accessData;

  return (
    <div className="min-h-screen bg-slate-50/70 py-12 px-4 sm:px-6 lg:px-8 text-slate-900">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Top Verified Shield Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    Access Granted
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Order: {orderId}</span>
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
                  {productName}
                </h1>
              </div>
            </div>

            <button
              id="view-invoice-btn"
              onClick={() => setShowInvoice(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors shrink-0"
            >
              <Receipt className="w-4 h-4 text-slate-500" />
              View Tax Invoice
            </button>
          </div>

          {/* Access Info Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-b border-slate-100 text-xs">
            <div>
              <div className="text-slate-400 font-medium">Licensed To</div>
              <div className="font-bold text-slate-800 truncate">{customerName} ({customerEmail})</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Access Duration</div>
              <div className="font-bold text-emerald-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {isLifetime ? 'Lifetime Access' : `Expires: ${expiresAt ? new Date(expiresAt).toLocaleDateString() : ''}`}
              </div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Security Token</div>
              <div className="font-mono text-slate-600 truncate flex items-center gap-1">
                <span>{token.slice(0, 16)}...</span>
                <button
                  onClick={handleCopyToken}
                  className="p-1 text-slate-400 hover:text-slate-800"
                  title="Copy full token"
                >
                  {copiedToken ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>
          </div>

          {/* Main Unlocked Action / Content Delivery */}
          <div className="pt-6 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Unlocked Protected Destination
            </h3>

            {/* Depending on product type */}
            {productType === 'digital_file' || productType === 'pdf' || productType === 'ebook' ? (
              <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-200/70 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">
                      {fileDetails?.fileName || 'ExplorePayment-Protected-Asset.zip'}
                    </div>
                    <div className="text-xs text-slate-500">
                      Size: {fileDetails?.fileSize || '42.8 MB'} • Secure Signed Delivery
                    </div>
                  </div>
                </div>

                <a
                  id="download-protected-file-btn"
                  href={`/api/access/${token}/download`}
                  download
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  Download File
                </a>
              </div>
            ) : productType === 'telegram_community' ? (
              <div className="p-5 bg-sky-50/50 rounded-xl border border-sky-200/70 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-sky-600 text-white flex items-center justify-center">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">
                      Private VIP Community Telegram Group
                    </div>
                    <div className="text-xs text-slate-500">
                      One-time invitation link verified for your account
                    </div>
                  </div>
                </div>

                <a
                  id="join-telegram-btn"
                  href={destinationUrl || 'https://t.me'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  Join VIP Group
                </a>
              </div>
            ) : (
              /* Protected Website / Course Portal */
              <div className="p-6 bg-slate-900 text-white rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-mono text-slate-300">Protected Course Portal</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] border border-emerald-500/30">
                    TOKEN_VERIFIED
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold">Launch Protected Portal</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Your single-sign-on token has been verified. Click below to launch your protected course environment.
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <a
                    id="open-protected-destination-btn"
                    href={destinationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Secret Destination URL
                  </a>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(destinationUrl);
                      alert('Protected destination URL copied to clipboard!');
                    }}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs rounded-xl transition-colors"
                  >
                    Copy URL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security & Re-access Instructions */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>How to re-access this content in the future</span>
          </div>
          <p className="leading-relaxed">
            Bookmark this unique unlock URL or enter your email (<strong>{customerEmail}</strong>) in the{' '}
            <button
              onClick={onNavigateHome}
              className="text-blue-600 underline font-semibold"
            >
              Explore Payment Customer Portal
            </button>{' '}
            at any time to retrieve your courses, downloads, and receipts.
          </p>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoice && orderId && (
        <InvoiceModal orderId={orderId} onClose={() => setShowInvoice(false)} />
      )}
    </div>
  );
};
