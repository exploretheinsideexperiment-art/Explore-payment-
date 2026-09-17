import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  Star,
  ChevronDown,
  HelpCircle,
  FileText,
  Lock,
  Share2,
  ExternalLink,
  QrCode
} from 'lucide-react';
import { Product, CreatorProfile, PaymentPageConfig } from '../types.ts';
import { PaymentModal } from './PaymentModal.tsx';

interface PublicProductPageProps {
  creatorSlug: string;
  productSlug: string;
  onPaymentSuccess: (accessToken: string, orderId: string) => void;
}

export const PublicProductPage: React.FC<PublicProductPageProps> = ({
  creatorSlug,
  productSlug,
  onPaymentSuccess
}) => {
  const [data, setData] = useState<{
    creator: Partial<CreatorProfile>;
    product: Partial<Product>;
    pageConfig: PaymentPageConfig;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    fetchProduct();
  }, [creatorSlug, productSlug]);

  const fetchProduct = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/p/${creatorSlug}/${productSlug}`);
      if (res.ok) {
        const json = await res.json();
        setData(json.data);
      } else {
        setError('Product not found or currently inactive.');
      }
    } catch (e) {
      setError('Failed to load payment page.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Loading Secure Payment Page...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">404: Page Not Found</h3>
          <p className="text-xs text-slate-500">{error || 'The requested creator product does not exist.'}</p>
        </div>
      </div>
    );
  }

  const { creator, product, pageConfig } = data;
  const primaryColor = pageConfig?.primaryColor || '#2563eb';

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 selection:bg-blue-500 selection:text-white pb-20">
      {/* Top verified creator ribbon */}
      <div className="bg-white border-b border-slate-200/80 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src={creator.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={creator.name}
              className="w-7 h-7 rounded-full object-cover border border-slate-200"
            />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">{creator.name}</span>
              {creator.verified && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/60">
                  Verified Creator
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            {copiedLink ? 'Link Copied!' : 'Share'}
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Cover & Hero */}
          <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-900">
            <img
              src={product.coverImage || 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80'}
              alt={product.name}
              className="w-full h-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500/80 backdrop-blur-xs text-[11px] font-bold uppercase tracking-wider">
                {product.category || 'Digital Content'}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
                {product.name}
              </h1>
              <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 max-w-2xl">
                {product.description}
              </p>
            </div>
          </div>

          {/* Pricing & Buy Action Bar */}
          <div className="p-6 bg-slate-50/90 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">
                Instant Access Price
              </div>
              <div className="flex items-baseline gap-3 mt-0.5">
                <span className="text-3xl font-black text-slate-900">
                  ₹{product.price}
                </span>
                {product.discountPrice && (
                  <>
                    <span className="text-sm text-slate-400 line-through">
                      ₹{product.discountPrice}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      {Math.round(((product.discountPrice - (product.price || 0)) / product.discountPrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Access: <strong className="capitalize">{product.accessDuration?.replace('_', ' ') || 'Lifetime'}</strong></span>
                <span>• Inclusive of all taxes</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="paypage-buy-now-btn"
                onClick={() => setIsModalOpen(true)}
                style={{ backgroundColor: primaryColor }}
                className="w-full sm:w-auto px-8 py-3.5 text-white font-bold text-sm rounded-xl shadow-md hover:opacity-95 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                Pay Now & Unlock
              </button>
            </div>
          </div>

          {/* Body content */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Features list */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
                  What's Included
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.features.map((feat: string, i: number) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-700"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Testimonials */}
            {pageConfig?.showTestimonials && pageConfig.testimonials?.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-4">
                  Customer Reviews
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {pageConfig.testimonials.map((test: any, i: number) => (
                    <div key={i} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center gap-1 text-amber-400">
                        {[...Array(test.rating || 5)].map((_, idx) => (
                          <Star key={idx} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                      <p className="text-xs text-slate-600 italic">"{test.comment}"</p>
                      <div className="flex items-center gap-2 pt-1">
                        <img
                          src={test.avatar}
                          alt={test.name}
                          className="w-6 h-6 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-800">{test.name}</div>
                          <div className="text-[10px] text-slate-400">{test.role}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQs */}
            {pageConfig?.showFaq && pageConfig.faqs?.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-2">
                  {pageConfig.faqs.map((faq: any, i: number) => (
                    <div
                      key={i}
                      className="border border-slate-200 rounded-xl overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                        className="w-full p-3.5 text-left text-xs font-bold text-slate-800 flex items-center justify-between bg-slate-50/50 hover:bg-slate-100/60"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform ${
                            openFaqIndex === i ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {openFaqIndex === i && (
                        <div className="p-3.5 text-xs text-slate-600 bg-white border-t border-slate-100 leading-relaxed">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Terms & Refund Policy */}
            <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
              <div><strong>Terms:</strong> {pageConfig?.termsText || 'Personal digital access.'}</div>
              <div><strong>Refund Policy:</strong> {pageConfig?.refundPolicyText || 'Standard satisfaction policy.'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        product={product}
        creator={creator}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPaymentSuccess={onPaymentSuccess}
      />
    </div>
  );
};
