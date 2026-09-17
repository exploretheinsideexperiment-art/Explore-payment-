import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  Eye,
  Palette,
  Layout,
  Type,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2
} from 'lucide-react';
import { PaymentPageConfig, Product } from '../types.ts';

interface PaymentPageBuilderProps {
  product: Product;
  onSaved?: () => void;
  onPreviewPublic?: () => void;
}

export const PaymentPageBuilder: React.FC<PaymentPageBuilderProps> = ({
  product,
  onSaved,
  onPreviewPublic
}) => {
  const [config, setConfig] = useState<PaymentPageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, [product.id]);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payment-pages/${product.id}`);
      if (res.ok) {
        const json = await res.json();
        setConfig(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/payment-pages/${product.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
        onSaved?.();
      }
    } catch (e) {
      alert('Failed to save page configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !config) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        Loading payment page builder...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900">No-Code Payment Page Builder</h2>
          <p className="text-xs text-slate-500">
            Customizing checkout page for: <strong>{product.name}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onPreviewPublic && (
            <button
              onClick={onPreviewPublic}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              Live Preview
            </button>
          )}

          <button
            id="save-page-builder-btn"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
          >
            {saving ? 'Saving...' : saveSuccess ? 'Saved ✓' : 'Save Changes'}
            <Save className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Split screen: Editor Controls (Left) & Live Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Controls Panel */}
        <div className="lg:col-span-6 space-y-5">
          {/* Brand & Identity */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Brand & Aesthetics
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={config.brandName}
                  onChange={e => setConfig({ ...config, brandName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Logo / Avatar URL</label>
                <input
                  type="text"
                  value={config.logoUrl}
                  onChange={e => setConfig({ ...config, logoUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-600 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.primaryColor}
                      onChange={e => setConfig({ ...config, primaryColor: e.target.value })}
                      className="w-8 h-8 rounded-md border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.primaryColor}
                      onChange={e => setConfig({ ...config, primaryColor: e.target.value })}
                      className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Button Corner Style</label>
                  <select
                    value={config.buttonStyle}
                    onChange={e => setConfig({ ...config, buttonStyle: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="rounded_pill">Rounded Pill (24px)</option>
                    <option value="soft_corner">Soft Modern (12px)</option>
                    <option value="sharp_modern">Sharp Edge (4px)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Layout Style</label>
                <select
                  value={config.layout}
                  onChange={e => setConfig({ ...config, layout: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white"
                >
                  <option value="centered_card">Centered Showcase Card</option>
                  <option value="split_showcase">Split Grid Layout</option>
                  <option value="editorial">Editorial Minimal</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section Toggles */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layout className="w-3.5 h-3.5 text-blue-600" />
              Page Sections & Content
            </h3>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">Features Checklist</span>
                  <p className="text-[11px] text-slate-400">Show list of course / product deliverables</p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, showFeatures: !config.showFeatures })}
                  className={`p-1 rounded-md ${config.showFeatures ? 'text-blue-600' : 'text-slate-400'}`}
                >
                  {config.showFeatures ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">Customer Testimonials</span>
                  <p className="text-[11px] text-slate-400">Show social proof reviews and star ratings</p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, showTestimonials: !config.showTestimonials })}
                  className={`p-1 rounded-md ${config.showTestimonials ? 'text-blue-600' : 'text-slate-400'}`}
                >
                  {config.showTestimonials ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">FAQ Accordion</span>
                  <p className="text-[11px] text-slate-400">Answer customer objections and unlock doubts</p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, showFaq: !config.showFaq })}
                  className={`p-1 rounded-md ${config.showFaq ? 'text-blue-600' : 'text-slate-400'}`}
                >
                  {config.showFaq ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">Terms & Refund Policy</span>
                  <p className="text-[11px] text-slate-400">Compliance and licensing information</p>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig({ ...config, showTerms: !config.showTerms })}
                  className={`p-1 rounded-md ${config.showTerms ? 'text-blue-600' : 'text-slate-400'}`}
                >
                  {config.showTerms ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Custom Copy */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Custom Heading & Terms Text
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Page Hero Headline</label>
              <input
                type="text"
                value={config.customHeading || ''}
                placeholder={product.name}
                onChange={e => setConfig({ ...config, customHeading: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-600 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Refund Policy Disclaimer</label>
              <textarea
                rows={2}
                value={config.refundPolicyText}
                onChange={e => setConfig({ ...config, refundPolicyText: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-600 bg-white"
              />
            </div>
          </div>
        </div>

        {/* RIGHT: Live Interactive Preview */}
        <div className="lg:col-span-6">
          <div className="sticky top-20 bg-slate-100 p-4 rounded-3xl border border-slate-300 shadow-inner">
            <div className="flex items-center justify-between mb-3 px-2 text-xs text-slate-500">
              <span className="font-bold flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-blue-600" />
                Live Customer View
              </span>
              <span className="font-mono text-[11px] text-slate-400 truncate max-w-[200px]">
                /pay/vipul/{product.slug}
              </span>
            </div>

            {/* Preview Frame */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-h-[700px] overflow-y-auto">
              {/* Creator top bar */}
              <div className="p-3 bg-white border-b border-slate-100 flex items-center gap-2">
                <img
                  src={config.logoUrl}
                  alt={config.brandName}
                  className="w-6 h-6 rounded-full object-cover border border-slate-200"
                />
                <span className="text-xs font-bold text-slate-900">{config.brandName}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 font-semibold ml-auto">
                  Verified
                </span>
              </div>

              {/* Cover */}
              <div className="relative h-44 bg-slate-900">
                <img
                  src={product.coverImage}
                  alt={product.name}
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <div className="text-base font-extrabold leading-tight">
                    {config.customHeading || product.name}
                  </div>
                  <div className="text-[11px] text-slate-200 line-clamp-1 mt-0.5">
                    {product.description}
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Total Price</div>
                  <div className="text-xl font-extrabold text-slate-900">₹{product.price}</div>
                </div>
                <button
                  style={{
                    backgroundColor: config.primaryColor,
                    borderRadius: config.buttonStyle === 'rounded_pill' ? '9999px' : config.buttonStyle === 'soft_corner' ? '12px' : '4px'
                  }}
                  className="px-5 py-2.5 text-white font-bold text-xs shadow-xs"
                >
                  Pay Now &rarr;
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-4 text-xs">
                {config.showFeatures && product.features && (
                  <div>
                    <div className="font-bold text-slate-800 mb-2">Features</div>
                    <div className="space-y-1.5">
                      {product.features.slice(0, 3).map((feat: string, i: number) => (
                        <div key={i} className="flex items-center gap-1.5 text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {config.showTestimonials && config.testimonials?.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <div className="font-bold text-slate-800 mb-2">Customer Feedback</div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="text-slate-600 italic text-[11px]">
                        "{config.testimonials[0]?.comment}"
                      </div>
                      <div className="text-[10px] font-bold text-slate-800">
                        — {config.testimonials[0]?.name}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
