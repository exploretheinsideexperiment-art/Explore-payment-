import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  CreditCard,
  ShoppingBag,
  Users,
  ArrowUpDown,
  BarChart3,
  Landmark,
  Tag,
  FolderLock,
  Settings,
  Terminal,
  LifeBuoy,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  Copy,
  Check,
  Search,
  Receipt,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Code
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Product,
  Order,
  Transaction,
  Customer,
  Coupon,
  AnalyticsStats,
  ProductType,
  AccessDuration
} from '../types.ts';
import { PaymentPageBuilder } from './PaymentPageBuilder.tsx';
import { InvoiceModal } from './InvoiceModal.tsx';

interface CreatorDashboardProps {
  onOpenPublicPayPage: (productSlug: string) => void;
  onOpenUnlockPage: (token: string) => void;
}

type DashboardTab =
  | 'overview'
  | 'products'
  | 'page_builder'
  | 'orders'
  | 'customers'
  | 'transactions'
  | 'analytics'
  | 'payouts'
  | 'coupons'
  | 'files'
  | 'api_docs'
  | 'support';

export const CreatorDashboard: React.FC<CreatorDashboardProps> = ({
  onOpenPublicPayPage,
  onOpenUnlockPage
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [analytics, setAnalytics] = useState<AnalyticsStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedProductForBuilder, setSelectedProductForBuilder] = useState<Product | null>(null);
  const [activeInvoiceOrderId, setActiveInvoiceOrderId] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<'today' | '7d' | '30d' | '90d'>('7d');

  // New Product Modal
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('499');
  const [newProductDiscount, setNewProductDiscount] = useState('1499');
  const [newProductCategory, setNewProductCategory] = useState('Courses & Education');
  const [newProductType, setNewProductType] = useState<ProductType>('protected_website');
  const [newProductDestUrl, setNewProductDestUrl] = useState('https://vipulcloud.dev/courses/ccna-vault');
  const [newProductDuration, setNewProductDuration] = useState<AccessDuration>('lifetime');
  const [newProductCover, setNewProductCover] = useState('https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80');

  // Seller Config State
  const [sellerConfig, setSellerConfig] = useState<any>({
    provider: 'simulator',
    upiId: 'vipul@okaxis',
    merchantName: 'Vipul Cloud Academy',
    accountHolderName: 'Vipul Sharma',
    bankName: 'HDFC Bank',
    accountNumberMasked: '•••• •••• 8842',
    ifscCode: 'HDFC0001234'
  });
  const [configSaveSuccess, setConfigSaveSuccess] = useState(false);

  // New Coupon State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('20');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponMinOrder, setNewCouponMinOrder] = useState('200');

  // Webhook Simulator State
  const [testWebhookPayload, setTestWebhookPayload] = useState({
    event: 'payment.captured',
    event_id: `evt_sim_${Date.now()}`,
    order_id: '',
    payment_id: '',
    amount: 499
  });
  const [webhookTestResult, setWebhookTestResult] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [resAnalytics, resProducts, resOrders, resTxns, resCoupons, resConfig] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/transactions'),
        fetch('/api/coupons'),
        fetch('/api/seller-config')
      ]);

      if (resAnalytics.ok) setAnalytics((await resAnalytics.json()).data);
      if (resProducts.ok) {
        const pList = (await resProducts.json()).data;
        setProducts(pList);
        if (pList.length > 0 && !selectedProductForBuilder) {
          setSelectedProductForBuilder(pList[0]);
        }
      }
      if (resOrders.ok) {
        const oList = (await resOrders.json()).data;
        setOrders(oList);
        if (oList.length > 0) {
          setTestWebhookPayload(prev => ({
            ...prev,
            order_id: oList[0].id,
            payment_id: oList[0].paymentId,
            amount: oList[0].amount
          }));
        }
      }
      if (resTxns.ok) setTransactions((await resTxns.json()).data);
      if (resCoupons.ok) setCoupons((await resCoupons.json()).data);
      if (resConfig.ok) setSellerConfig((await resConfig.json()).data);
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newProductName,
          description: newProductDesc,
          price: Number(newProductPrice),
          discountPrice: newProductDiscount ? Number(newProductDiscount) : undefined,
          category: newProductCategory,
          productType: newProductType,
          destinationUrl: newProductDestUrl,
          accessDuration: newProductDuration,
          coverImage: newProductCover,
          features: [
            'Instant Digital Access with Single-Sign-On Token',
            'Verified Banking Gateway Protection',
            'Automated GST Tax Invoicing'
          ]
        })
      });

      if (res.ok) {
        setShowCreateProductModal(false);
        setNewProductName('');
        fetchDashboardData();
        alert('Product created successfully! You can now customize its payment page.');
      }
    } catch (e) {
      alert('Error creating product');
    }
  };

  const handleSaveSellerConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/seller-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sellerConfig)
      });
      if (res.ok) {
        setConfigSaveSuccess(true);
        setTimeout(() => setConfigSaveSuccess(false), 2500);
      }
    } catch (e) {
      alert('Failed to save config');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCouponCode,
          discountType: newCouponType,
          discountValue: Number(newCouponDiscount),
          minOrderAmount: Number(newCouponMinOrder)
        })
      });
      if (res.ok) {
        setNewCouponCode('');
        fetchDashboardData();
      }
    } catch (e) {
      alert('Failed to create coupon');
    }
  };

  const handleRefund = async (orderId: string, paymentId: string) => {
    if (!confirm(`Are you sure you want to issue a refund for order ${orderId}? This will automatically revoke customer access.`)) return;
    try {
      const res = await fetch('/api/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, paymentId, reason: 'Creator initiated refund' })
      });
      if (res.ok) {
        alert('Refund processed successfully. Access token has been revoked.');
        fetchDashboardData();
      }
    } catch (e) {
      alert('Error processing refund');
    }
  };

  const handleTriggerTestWebhook = async () => {
    try {
      const res = await fetch('/api/payment/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-provider-signature': 'simulated_hmac_signature'
        },
        body: JSON.stringify({
          ...testWebhookPayload,
          event_id: `evt_${Date.now()}`
        })
      });
      const data = await res.json();
      setWebhookTestResult(data);
      fetchDashboardData();
    } catch (e) {
      setWebhookTestResult({ status: 'error', error: 'Request failed' });
    }
  };

  const exportTransactionsCsv = () => {
    const headers = 'Transaction ID,Order ID,Customer,Product,Amount,Method,Status,Date\n';
    const rows = transactions.map(t =>
      `"${t.id}","${t.orderId}","${t.customerName}","${t.productName}","${t.amount}","${t.paymentMethod}","${t.status}","${t.date}"`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ExplorePayment-Transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              EP
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Creator Studio</div>
              <div className="text-[11px] text-slate-400">@vipul</div>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1 flex-1 text-xs font-semibold overflow-y-auto">
          {[
            { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'page_builder', label: 'Payment Pages', icon: CreditCard },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'customers', label: 'Customers', icon: Users },
            { id: 'transactions', label: 'Transactions', icon: ArrowUpDown },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'payouts', label: 'Payouts & UPI Setup', icon: Landmark },
            { id: 'coupons', label: 'Coupons', icon: Tag },
            { id: 'files', label: 'Files & Assets', icon: FolderLock },
            { id: 'api_docs', label: 'API & Webhooks', icon: Terminal },
            { id: 'support', label: 'Support & Help', icon: LifeBuoy }
          ].map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-${item.id}-btn`}
                onClick={() => setActiveTab(item.id as DashboardTab)}
                className={`w-full px-3 py-2 rounded-xl flex items-center gap-2.5 transition-colors text-left ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Quick Product Preview Link */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/70 m-3 rounded-xl text-xs space-y-2">
          <div className="font-bold text-slate-800 flex items-center justify-between">
            <span>Live Checkout</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-[11px] text-slate-500">
            Open customer-facing payment page for test checkout.
          </p>
          <button
            onClick={() => onOpenPublicPayPage('networking-course')}
            className="w-full py-1.5 px-2 bg-white border border-slate-200 hover:border-slate-300 text-blue-600 font-bold rounded-lg flex items-center justify-center gap-1 transition-colors"
          >
            <span>Open /pay/vipul/networking-course</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-6xl">
        {/* --- OVERVIEW TAB --- */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Dashboard Overview</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time sales, UPI conversion, and automated unlock health.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="dashboard-new-product-btn"
                  onClick={() => setShowCreateProductModal(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  + Create Product
                </button>
              </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-bold uppercase text-slate-400">Total Sales</div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  ₹{analytics?.totalRevenue?.toLocaleString('en-IN') || 0}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +18.4% from last week
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-bold uppercase text-slate-400">Today's Sales</div>
                <div className="text-2xl font-black text-slate-900 mt-1">
                  ₹{analytics?.todayRevenue?.toLocaleString('en-IN') || 0}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Verified settlements
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-bold uppercase text-slate-400">Successful Payments</div>
                <div className="text-2xl font-black text-emerald-600 mt-1">
                  {analytics?.successfulPayments || 0}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Pending: {analytics?.pendingPayments || 0}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-[11px] font-bold uppercase text-slate-400">Conversion Rate</div>
                <div className="text-2xl font-black text-blue-600 mt-1">
                  {analytics?.conversionRate || 0}%
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {analytics?.visitorsCount || 0} visitors tracked
                </div>
              </div>
            </div>

            {/* Revenue Over Time Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Revenue & Orders Over Time</h3>
                  <p className="text-xs text-slate-500">Daily bank-verified payment settlements</p>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
                  {(['today', '7d', '30d', '90d'] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setTimeFilter(f)}
                      className={`px-2.5 py-1 rounded-lg uppercase text-[11px] ${
                        timeFilter === f ? 'bg-white text-blue-600 shadow-xs font-bold' : 'hover:text-slate-900'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics?.revenueByDay || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      tickFormatter={val => `₹${val}`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff' }}
                      formatter={(val: any) => [`₹${val}`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Orders & Top Products Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Recent Orders</h3>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    View All &rarr;
                  </button>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {orders.slice(0, 4).map(o => (
                    <div key={o.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{o.productName}</div>
                        <div className="text-slate-500 text-[11px]">
                          {o.id} • {o.customerName}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-slate-900">₹{o.amount}</div>
                        <span className="inline-block text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
                          {o.paymentStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Products */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">Top Revenue Products</h3>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="text-xs text-blue-600 hover:underline font-semibold"
                  >
                    Manage &rarr;
                  </button>
                </div>

                <div className="divide-y divide-slate-100 text-xs">
                  {products.map(p => (
                    <div key={p.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={p.coverImage}
                          alt={p.name}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{p.name}</div>
                          <div className="text-slate-500 text-[11px] capitalize">
                            {p.productType.replace('_', ' ')} • ₹{p.price}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">{p.salesCount} sales</div>
                        <div className="font-mono text-[11px] text-emerald-600">
                          ₹{(p.salesCount * p.price).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- PRODUCTS TAB --- */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Product Catalog</h1>
                <p className="text-xs text-slate-500">
                  Manage digital courses, protected websites, downloads, and community links.
                </p>
              </div>

              <button
                onClick={() => setShowCreateProductModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                + Create Product
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {products.map(p => (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="relative h-40 bg-slate-900">
                      <img
                        src={p.coverImage}
                        alt={p.name}
                        className="w-full h-full object-cover opacity-90"
                      />
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-slate-900/80 text-white font-mono text-[10px] font-bold">
                        ₹{p.price}
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">
                        {p.productType.replace('_', ' ')}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{p.description}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <button
                      onClick={() => onOpenPublicPayPage(p.slug)}
                      className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 font-semibold text-slate-700 rounded-lg flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Page
                    </button>

                    <button
                      onClick={() => {
                        setSelectedProductForBuilder(p);
                        setActiveTab('page_builder');
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 font-bold text-white rounded-lg transition-colors"
                    >
                      Customize &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- NO-CODE PAGE BUILDER TAB --- */}
        {activeTab === 'page_builder' && selectedProductForBuilder && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500">Editing Product:</span>
              <select
                value={selectedProductForBuilder.id}
                onChange={e => {
                  const p = products.find(prod => prod.id === e.target.value);
                  if (p) setSelectedProductForBuilder(p);
                }}
                className="text-xs font-bold border border-slate-300 rounded-lg px-2.5 py-1 bg-white"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                ))}
              </select>
            </div>

            <PaymentPageBuilder
              product={selectedProductForBuilder}
              onPreviewPublic={() => onOpenPublicPayPage(selectedProductForBuilder.slug)}
            />
          </div>
        )}

        {/* --- ORDERS TAB --- */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Orders & Access Grants</h1>
                <p className="text-xs text-slate-500">
                  Every order includes verified payment status and issued cryptographic access token.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3.5">Order ID</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Product</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Access Token</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50/60">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{o.id}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{o.customerName}</div>
                        <div className="text-slate-400 text-[11px]">{o.customerEmail}</div>
                      </td>
                      <td className="p-3.5 max-w-[180px] truncate">{o.productName}</td>
                      <td className="p-3.5 font-mono font-bold text-slate-900">₹{o.amount}</td>
                      <td className="p-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.paymentStatus === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-blue-600">
                        {o.accessToken ? (
                          <button
                            onClick={() => onOpenUnlockPage(o.accessToken!)}
                            className="underline hover:text-blue-800 font-semibold"
                          >
                            {o.accessToken.slice(0, 12)}...
                          </button>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => setActiveInvoiceOrderId(o.id)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-md"
                        >
                          Invoice
                        </button>
                        {o.paymentStatus === 'SUCCESS' && (
                          <button
                            onClick={() => handleRefund(o.id, o.paymentId)}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-md"
                          >
                            Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TRANSACTIONS TAB --- */}
        {activeTab === 'transactions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Transactions Ledger</h1>
                <p className="text-xs text-slate-500">
                  Bank-verified payment transactions, gateway reference IDs, and refund logs.
                </p>
              </div>

              <button
                onClick={exportTransactionsCsv}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3.5">Transaction ID</th>
                    <th className="p-3.5">Order Ref</th>
                    <th className="p-3.5">Provider</th>
                    <th className="p-3.5">Method</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {transactions.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/60 font-sans">
                      <td className="p-3.5 font-mono font-bold text-slate-900">{t.id}</td>
                      <td className="p-3.5 font-mono text-slate-600">{t.orderId}</td>
                      <td className="p-3.5 capitalize text-slate-700 font-sans">{t.provider}</td>
                      <td className="p-3.5 uppercase text-slate-500 text-[11px] font-mono">{t.paymentMethod}</td>
                      <td className="p-3.5 font-mono font-bold text-slate-900">₹{t.amount}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 text-[11px] font-sans">
                        {new Date(t.date).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- PAYOUTS & SELLER PAYMENT CONFIG TAB --- */}
        {activeTab === 'payouts' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Seller Payment Configuration</h1>
              <p className="text-xs text-slate-500">
                Configure your verified business payment account and authorized gateway keys.
              </p>
            </div>

            {/* Direct Bank / UPI Security Notice */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
              <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1 leading-relaxed">
                <strong>Direct Bank & UPI Strict Security Policy:</strong>
                <p>
                  Explore Payment strictly never collects or stores sensitive banking credentials
                  (such as UPI PIN, Netbanking passwords, OTPs, or Card PINs). Payments settle directly
                  through licensed payment gateways and authorized NPCI UPI merchant networks.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSellerConfig} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5 max-w-2xl">
              <h3 className="text-sm font-bold text-slate-900">Payment Gateway & UPI Identity</h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Active Payment Provider</label>
                  <select
                    value={sellerConfig.provider}
                    onChange={e => setSellerConfig({ ...sellerConfig, provider: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white font-bold"
                  >
                    <option value="simulator">Interactive Simulator Gateway (Instant verified testing)</option>
                    <option value="direct_upi">Direct NPCI UPI QR (Direct creator settlement)</option>
                    <option value="razorpay">Razorpay Authorized Gateway</option>
                    <option value="cashfree">Cashfree Payments PG</option>
                    <option value="phonepe">PhonePe Payment Gateway</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Merchant UPI ID / VPA (Where customers send UPI payments)
                  </label>
                  <input
                    type="text"
                    required
                    value={sellerConfig.upiId}
                    onChange={e => setSellerConfig({ ...sellerConfig, upiId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white font-mono font-bold"
                    placeholder="creator@okhdfcbank"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Used to generate real-time UPI QR codes with exact order amounts.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Registered Business / Merchant Name</label>
                  <input
                    type="text"
                    required
                    value={sellerConfig.merchantName}
                    onChange={e => setSellerConfig({ ...sellerConfig, merchantName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white font-bold"
                    placeholder="Vipul Cloud Academy"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={sellerConfig.bankName || ''}
                      onChange={e => setSellerConfig({ ...sellerConfig, bankName: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                      placeholder="HDFC Bank"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={sellerConfig.ifscCode || ''}
                      onChange={e => setSellerConfig({ ...sellerConfig, ifscCode: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono uppercase"
                      placeholder="HDFC0001234"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  {configSaveSuccess ? 'Saved Successfully ✓' : 'Save Seller Payment Settings'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- COUPONS TAB --- */}
        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Discount Coupons</h1>
                <p className="text-xs text-slate-500">
                  Create promotional codes for special discounts and affiliate campaigns.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form */}
              <form onSubmit={handleCreateCoupon} className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <h3 className="font-bold text-slate-900 text-sm mb-2">+ Create New Coupon</h3>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FLASH50"
                    value={newCouponCode}
                    onChange={e => setNewCouponCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 uppercase font-mono font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Type</label>
                    <select
                      value={newCouponType}
                      onChange={e => setNewCouponType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                    >
                      <option value="percentage">% Percentage</option>
                      <option value="fixed">Fixed ₹</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Value</label>
                    <input
                      type="number"
                      required
                      value={newCouponDiscount}
                      onChange={e => setNewCouponDiscount(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={newCouponMinOrder}
                    onChange={e => setNewCouponMinOrder(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl mt-2 shadow-xs transition-colors"
                >
                  Create Coupon Code
                </button>
              </form>

              {/* List */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="p-3.5">Code</th>
                      <th className="p-3.5">Discount</th>
                      <th className="p-3.5">Min Order</th>
                      <th className="p-3.5">Used</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {coupons.map(c => (
                      <tr key={c.id}>
                        <td className="p-3.5 font-mono font-bold text-slate-900">{c.code}</td>
                        <td className="p-3.5 font-semibold text-emerald-600">
                          {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                        </td>
                        <td className="p-3.5">₹{c.minOrderAmount}</td>
                        <td className="p-3.5">{c.usedCount} / {c.maxUses}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- API & WEBHOOK SIMULATOR TAB --- */}
        {activeTab === 'api_docs' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">API Docs & Webhook Simulator</h1>
              <p className="text-xs text-slate-500">
                Test banking webhooks with HMAC signatures, idempotency, and replay protection.
              </p>
            </div>

            {/* Interactive Webhook Simulator */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-bold font-mono">POST /api/payment/webhook</h3>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] border border-emerald-500/30">
                  IDEMPOTENCY_ACTIVE
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Test how your banking provider verifies payment and triggers automated order creation and access token issuance.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <label className="block text-slate-400 mb-1">Target Order ID</label>
                  <input
                    type="text"
                    value={testWebhookPayload.order_id}
                    onChange={e => setTestWebhookPayload({ ...testWebhookPayload, order_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Event Type</label>
                  <input
                    type="text"
                    value={testWebhookPayload.event}
                    onChange={e => setTestWebhookPayload({ ...testWebhookPayload, event: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleTriggerTestWebhook}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Dispatch Test Signed Webhook
                </button>
              </div>

              {webhookTestResult && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-emerald-400">
                  <pre>{JSON.stringify(webhookTestResult, null, 2)}</pre>
                </div>
              )}
            </div>

            {/* API Endpoints Reference */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">Public & Creator REST Endpoints</h3>
              <div className="space-y-2 font-mono text-[11px]">
                <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between">
                  <div><strong className="text-blue-600">GET</strong> /api/p/:creatorSlug/:productSlug</div>
                  <span className="text-slate-500 font-sans">Public payment page (Redacted URL)</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between">
                  <div><strong className="text-emerald-600">POST</strong> /api/payment/create</div>
                  <span className="text-slate-500 font-sans">Initiate UPI payment & QR code</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between">
                  <div><strong className="text-purple-600">GET</strong> /api/access/:token</div>
                  <span className="text-slate-500 font-sans">Validate token & return protected content</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between">
                  <div><strong className="text-amber-600">POST</strong> /api/payment/webhook</div>
                  <span className="text-slate-500 font-sans">Provider webhook with HMAC signature</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- CUSTOMERS TAB --- */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-extrabold text-slate-900">Customer Directory</h1>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3.5">Customer Name</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Phone</th>
                    <th className="p-3.5">Orders</th>
                    <th className="p-3.5">Total Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td className="p-3.5 font-bold text-slate-900">{o.customerName}</td>
                      <td className="p-3.5 font-mono text-slate-600">{o.customerEmail}</td>
                      <td className="p-3.5 text-slate-500">{o.customerPhone || 'N/A'}</td>
                      <td className="p-3.5">1 order</td>
                      <td className="p-3.5 font-mono font-bold text-slate-900">₹{o.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- FILES TAB --- */}
        {activeTab === 'files' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Protected Digital Files & Assets</h1>
              <p className="text-xs text-slate-500">
                Safe storage for course files, code repositories, PDFs, and video bundles.
              </p>
            </div>

            <div className="p-6 bg-white rounded-2xl border border-slate-200 space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    ZIP
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Explore-SaaS-Design-System-v4.2.zip</div>
                    <div className="text-[11px] text-slate-400">42.8 MB • 89 downloads • SHA-256 Verified</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200/60">
                  Protected Asset
                </span>
              </div>
            </div>
          </div>
        )}

        {/* --- SUPPORT TAB --- */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-extrabold text-slate-900">Explore Payment Creator Support</h1>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Need assistance with payment settlements, webhook configuration, or custom domain routing?
                Our engineering team is ready to help.
              </p>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 space-y-1">
                <div><strong>Support Email:</strong> support@explorepayment.dev</div>
                <div><strong>Live Status:</strong> All systems operational (100% gateway uptime)</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- CREATE PRODUCT MODAL --- */}
      {showCreateProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">+ Create New Monetized Product</h3>
              <button onClick={() => setShowCreateProductModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master CCNA & Network Engineering"
                  value={newProductName}
                  onChange={e => setNewProductName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="What will customers learn or receive?"
                  value={newProductDesc}
                  onChange={e => setNewProductDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={newProductPrice}
                    onChange={e => setNewProductPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Original / Strikethrough Price</label>
                  <input
                    type="number"
                    value={newProductDiscount}
                    onChange={e => setNewProductDiscount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product Type</label>
                  <select
                    value={newProductType}
                    onChange={e => setNewProductType(e.target.value as ProductType)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white capitalize"
                  >
                    <option value="protected_website">1. Protected Website</option>
                    <option value="digital_file">2. Digital File / ZIP</option>
                    <option value="video">3. Video</option>
                    <option value="course">4. Course</option>
                    <option value="pdf">5. PDF</option>
                    <option value="ebook">6. E-book</option>
                    <option value="membership">7. Membership</option>
                    <option value="telegram_community">8. Telegram Community</option>
                    <option value="custom_url">9. Custom URL</option>
                    <option value="custom_content">10. Custom Content</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Access Duration</label>
                  <select
                    value={newProductDuration}
                    onChange={e => setNewProductDuration(e.target.value as AccessDuration)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="lifetime">Lifetime</option>
                    <option value="1_day">1 Day</option>
                    <option value="7_days">7 Days</option>
                    <option value="30_days">30 Days</option>
                    <option value="90_days">90 Days</option>
                  </select>
                </div>
              </div>

              {/* Secret Destination URL */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Protected Secret Destination (Revealed ONLY after verified payment)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/private-vault"
                  value={newProductDestUrl}
                  onChange={e => setNewProductDestUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-blue-600 font-semibold"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  🔒 Kept strictly secret on backend until cryptographically unlocked.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateProductModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                >
                  Publish Product & Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invoice Modal View */}
      {activeInvoiceOrderId && (
        <InvoiceModal orderId={activeInvoiceOrderId} onClose={() => setActiveInvoiceOrderId(null)} />
      )}
    </div>
  );
};
