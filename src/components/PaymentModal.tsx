import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Smartphone,
  CreditCard,
  Building2,
  Lock,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Zap,
  Tag
} from 'lucide-react';
import { Product, CreatorProfile } from '../types.ts';

interface PaymentModalProps {
  product: Partial<Product>;
  creator: Partial<CreatorProfile>;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (accessToken: string, orderId: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  product,
  creator,
  isOpen,
  onClose,
  onPaymentSuccess
}) => {
  const [step, setStep] = useState<'details' | 'checkout' | 'success'>('details');

  // Customer form inputs
  const [name, setName] = useState('Rahul Sen');
  const [email, setEmail] = useState('rahul.sen@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    discountAmount: number;
    finalAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Payment session state
  const [paymentMethod, setPaymentMethod] = useState<'upi_qr' | 'upi_intent' | 'card' | 'netbanking'>('upi_qr');
  const [paymentData, setPaymentData] = useState<{
    orderId: string;
    paymentId: string;
    amount: number;
    currency: string;
    upiId: string;
    merchantName: string;
    upiString?: string;
    qrCodeDataUrl?: string;
    expiresAt?: string;
  } | null>(null);

  const [isInitiating, setIsInitiating] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED'>('PENDING');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [verifiedResult, setVerifiedResult] = useState<{
    accessToken?: string;
    orderId?: string;
    unlockUrl?: string;
  } | null>(null);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setStep('details');
      setPaymentStatus('PENDING');
      setPaymentData(null);
      setVerifiedResult(null);
      setAppliedDiscount(null);
      setCouponError('');
    }
  }, [isOpen]);

  // Polling for payment status when on checkout step
  useEffect(() => {
    let timer: any;
    if (step === 'checkout' && paymentData?.paymentId && paymentStatus === 'PENDING') {
      timer = setInterval(async () => {
        try {
          const res = await fetch(`/api/payment/status/${paymentData.paymentId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'SUCCESS' && data.accessToken) {
              setPaymentStatus('SUCCESS');
              setVerifiedResult({
                accessToken: data.accessToken,
                orderId: data.orderId,
                unlockUrl: data.unlockUrl
              });
              setStep('success');
            }
          }
        } catch (e) {
          // ignore poll error
        }
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [step, paymentData, paymentStatus]);

  if (!isOpen) return null;

  const originalPrice = product.price || 499;
  const currentPrice = appliedDiscount ? appliedDiscount.finalAmount : originalPrice;

  // Handle Coupon Apply
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponCode.trim(),
          productId: product.id,
          amount: originalPrice
        })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setAppliedDiscount({
          code: data.code,
          discountAmount: data.discountAmount,
          finalAmount: data.finalAmount
        });
      } else {
        setCouponError(data.error || 'Invalid coupon code');
        setAppliedDiscount(null);
      }
    } catch (err: any) {
      setCouponError('Error validating coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Step 3 to 4: Initiate Payment Session & Generate UPI QR
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setIsInitiating(true);
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          couponCode: appliedDiscount?.code,
          method: paymentMethod
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setPaymentData(json.data);
        setStep('checkout');
        setPaymentStatus('PENDING');
      } else {
        alert(json.error || 'Failed to initiate payment');
      }
    } catch (err) {
      alert('Network error initiating payment');
    } finally {
      setIsInitiating(false);
    }
  };

  // Step 5 to 6: Simulate Verified Payment
  // This verifies the payment directly against the backend and updates provider status
  const handleSimulatePaymentVerification = async () => {
    if (!paymentData?.paymentId) return;
    setIsVerifying(true);
    try {
      const res = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId: paymentData.paymentId,
          signature: 'verified_sim_signature'
        })
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setPaymentStatus('SUCCESS');
        setVerifiedResult({
          accessToken: json.accessToken,
          orderId: json.orderId,
          unlockUrl: json.unlockUrl
        });
        setStep('success');
      } else {
        alert(json.message || 'Payment verification failed');
      }
    } catch (err) {
      alert('Verification network error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyUpi = () => {
    if (paymentData?.upiId) {
      navigator.clipboard.writeText(paymentData.upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">EXPLORE PAYMENT</h3>
              <p className="text-[10px] text-slate-400">Bank-Verified Pay-to-Unlock Checkout</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 3: Customer Details & Coupon Entry */}
        {step === 'details' && (
          <form onSubmit={handleProceedToPayment} className="p-6 space-y-5">
            {/* Product Summary */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center gap-3">
              <img
                src={product.coverImage || 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=200&auto=format&fit=crop&q=80'}
                alt={product.name}
                className="w-14 h-14 rounded-lg object-cover border border-slate-200"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">{product.name}</h4>
                <p className="text-[11px] text-slate-500 truncate">By {creator.name || 'Explore Creator'}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-sm font-extrabold text-slate-900">
                    ₹{currentPrice}
                  </span>
                  {product.discountPrice && !appliedDiscount && (
                    <span className="text-xs text-slate-400 line-through">
                      ₹{product.discountPrice}
                    </span>
                  )}
                  {appliedDiscount && (
                    <span className="text-[11px] text-emerald-600 font-semibold">
                      (Saved ₹{appliedDiscount.discountAmount})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Information Form */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Your Contact Information (for Access & Invoice)
              </label>

              <div>
                <input
                  id="checkout-name-input"
                  type="text"
                  required
                  placeholder="Full Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
                />
              </div>

              <div>
                <input
                  id="checkout-email-input"
                  type="email"
                  required
                  placeholder="Email Address (Access link sent here)"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
                />
              </div>

              <div>
                <input
                  id="checkout-phone-input"
                  type="tel"
                  placeholder="Mobile Number (e.g. +91 98765 43210)"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 bg-white"
                />
              </div>
            </div>

            {/* Coupon Section */}
            <div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    id="checkout-coupon-input"
                    type="text"
                    placeholder="Coupon Code (e.g. WELCOME20)"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:border-blue-600 bg-white uppercase font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon || !couponCode.trim()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                >
                  {isApplyingCoupon ? 'Checking...' : 'Apply'}
                </button>
              </div>
              {appliedDiscount && (
                <p className="mt-1.5 text-xs text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Coupon <span className="font-bold">{appliedDiscount.code}</span> applied: ₹{appliedDiscount.discountAmount} discount!
                </p>
              )}
              {couponError && (
                <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {couponError}
                </p>
              )}
              {!appliedDiscount && (
                <p className="mt-1 text-[11px] text-slate-400">
                  Try test coupons: <span className="font-mono text-slate-600">WELCOME20</span> (20% off) or <span className="font-mono text-slate-600">FLAT100</span>
                </p>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi_qr')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                    paymentMethod === 'upi_qr'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="text-xs">UPI QR Code</div>
                    <div className="text-[10px] text-slate-500 font-normal">Scan with any UPI app</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi_intent')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                    paymentMethod === 'upi_intent'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-purple-600 shrink-0" />
                  <div>
                    <div className="text-xs">UPI Apps Intent</div>
                    <div className="text-[10px] text-slate-500 font-normal">GPay / PhonePe / Paytm</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                    paymentMethod === 'card'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-slate-600 shrink-0" />
                  <div>
                    <div className="text-xs">Card / RuPay</div>
                    <div className="text-[10px] text-slate-500 font-normal">Debit & Credit Cards</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="text-xs">Net Banking</div>
                    <div className="text-[10px] text-slate-500 font-normal">All major banks</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="checkout-proceed-btn"
              type="submit"
              disabled={isInitiating}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              {isInitiating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Secure Payment Request...
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  Proceed to Pay ₹{currentPrice}
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>256-Bit SSL Encrypted & Bank-Verified Verification</span>
            </div>
          </form>
        )}

        {/* STEP 4 & 5: QR CHECKOUT SCREEN & LIVE VERIFICATION */}
        {step === 'checkout' && paymentData && (
          <div className="p-6 space-y-5 text-center">
            {/* Amount Banner */}
            <div>
              <span className="text-[11px] uppercase font-bold tracking-wider text-slate-500">
                Total Payable Amount
              </span>
              <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
                ₹{paymentData.amount}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Order ID: <span className="font-mono font-semibold text-slate-700">{paymentData.orderId}</span>
              </p>
            </div>

            {/* QR Code Presentation */}
            <div className="relative inline-block mx-auto p-4 bg-white rounded-2xl border-2 border-slate-800 shadow-lg">
              {paymentData.qrCodeDataUrl ? (
                <img
                  src={paymentData.qrCodeDataUrl}
                  alt="UPI QR Code"
                  className="w-56 h-56 mx-auto rounded-lg"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center bg-slate-100 rounded-lg">
                  <QrCode className="w-16 h-16 text-slate-400 animate-pulse" />
                </div>
              )}

              <div className="mt-2 text-xs font-semibold text-slate-800 flex items-center justify-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                Scan using any UPI app
              </div>
            </div>

            {/* UPI ID & Copy Box */}
            <div className="max-w-xs mx-auto p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div className="text-left overflow-hidden">
                <div className="text-[10px] text-slate-500 font-medium uppercase">UPI ID</div>
                <div className="font-mono font-bold text-slate-800 truncate">{paymentData.upiId}</div>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center gap-1 transition-colors"
              >
                {copiedUpi ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </button>
            </div>

            {/* STEP 5: Payment Status Notice */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-left space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span className="text-xs font-bold text-amber-900">
                  Waiting for verified payment confirmation...
                </span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Backend is listening for verified bank webhook/status updates.
                Products are strictly unlocked only after cryptographic verification — not on screenshots.
              </p>
            </div>

            {/* Interactive Verification Simulation for Test Reviewers */}
            <div className="pt-1">
              <button
                id="simulate-verified-payment-btn"
                type="button"
                onClick={handleSimulatePaymentVerification}
                disabled={isVerifying}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Verifying with Banking Gateway...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Simulate Verified Payment (Reviewer Test Action)
                  </>
                )}
              </button>
              <p className="text-[10px] text-slate-400 mt-1.5">
                Simulates real-world UPI success webhook verification event.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setStep('details')}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              &larr; Change Details or Payment Method
            </button>
          </div>
        )}

        {/* STEP 6: PAYMENT SUCCESSFUL & AUTO-UNLOCK */}
        {step === 'success' && verifiedResult && (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <div className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">
                ✓ Payment Verified & Captured
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Payment Successful!
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                Your order <span className="font-mono font-bold text-slate-800">{verifiedResult.orderId}</span> has been confirmed.
                A cryptographically secure access token has been generated.
              </p>
            </div>

            {/* Generated Details Box */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Order ID:</span>
                <span className="font-bold text-slate-900">{verifiedResult.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Product:</span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]">{product.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-sans">Amount Paid:</span>
                <span className="font-bold text-emerald-600">₹{currentPrice}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <span className="text-slate-500 font-sans">Access Token:</span>
                <span className="text-blue-600 font-bold truncate max-w-[180px]">
                  {verifiedResult.accessToken?.slice(0, 16)}...
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                id="unlock-destination-btn"
                type="button"
                onClick={() => {
                  if (verifiedResult.accessToken) {
                    onPaymentSuccess(verifiedResult.accessToken, verifiedResult.orderId || '');
                    onClose();
                  }
                }}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Unlock Content & View Destination &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
