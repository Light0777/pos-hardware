import { useEffect, useState } from "react";
import { getDashboardReport } from "../../renderer/services/reportApi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { getSalesTrend } from "../../renderer/services/reportApi";
import { getProfitTrend } from "../../renderer/services/reportApi";
import { getCustomerSummary } from "../../renderer/services/customerApi";
import { IonIcon } from "@ionic/react";
import {
  trendingUpOutline,
  cashOutline,
  cartOutline,
  peopleOutline,
  warningOutline,
  cubeOutline,
  timeOutline,
  checkmarkCircleOutline,
} from "ionicons/icons";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profitTrend, setProfitTrend] = useState<any[]>([]);
  const [trend, setTrend] = useState<any[]>([]);
  const [customerSummary, setCustomerSummary] = useState<any>(null);

  useEffect(() => {
    getCustomerSummary().then(setCustomerSummary);
  }, []);

  useEffect(() => {
  // Load dashboard report with proper data handling
  getDashboardReport()
    .then((result) => {
      console.log('Dashboard data received:', result); // Debug log
      if (result) {
        setData(result);
      } else {
        console.error('No data received from dashboard API');
        setData({
          today_sales: 0,
          month_sales: 0,
          total_sales: 0,
          total_orders: 0,
          low_stock: [],
          recent_sales: [],
          recent_purchases: [],
          top_products: [],
        });
      }
    })
    .catch((err) => {
      console.error('Dashboard report error:', err);
      setData({
        today_sales: 0,
        month_sales: 0,
        total_sales: 0,
        total_orders: 0,
        low_stock: [],
        recent_sales: [],
        recent_purchases: [],
        top_products: [],
      });
    })
    .finally(() => setLoading(false));

  // Load sales trend
  getSalesTrend()
    .then((res) => {
      if (res && Array.isArray(res)) {
        const formatted = res.map((d: any) => ({
          ...d,
          date: d.date ? new Date(d.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          }) : "Invalid Date",
        }));
        setTrend(formatted);
      } else {
        setTrend([]);
      }
    })
    .catch((err) => {
      console.error('Sales trend error:', err);
      setTrend([]);
    });

  // Load profit trend
  getProfitTrend()
    .then((res) => {
      if (res && Array.isArray(res)) {
        const formatted = res.map((d: any) => ({
          ...d,
          date: d.date ? new Date(d.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          }) : "Invalid Date",
        }));
        setProfitTrend(formatted);
      } else {
        setProfitTrend([]);
      }
    })
    .catch((err) => {
      console.error('Profit trend error:', err);
      setProfitTrend([]);
    });
}, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );

  if (!data) return (
    <div className="text-red-500 text-center p-8">Failed to load data</div>
  );

  // Color palette for charts
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // KPI Card Component
  const getGradient = (color: string) => {
    const gradients: Record<string, string> = {
      'text-green-600': 'from-green-500 to-green-600',
      'text-blue-600': 'from-blue-500 to-blue-600',
      'text-purple-600': 'from-purple-500 to-purple-600',
      'text-orange-600': 'from-orange-500 to-orange-600',
      'text-red-600': 'from-red-500 to-red-600',
    };
    return gradients[color] || 'from-gray-500 to-gray-600';
  };

  const KPICard = ({ title, value, icon, color, subtitle }: any) => (
    <div className={`bg-gradient-to-br ${getGradient(color)} rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div className="text-start">
          <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">₹{Number(value).toLocaleString()}</p>
          {subtitle && <p className="text-white/80 text-xs mt-2">{subtitle}</p>}
        </div>
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
          <IonIcon icon={icon} className="text-2xl text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="p-3 rounded-2xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="7" height="9" x="3" y="3" rx="1" />
              <rect width="7" height="5" x="14" y="3" rx="1" />
              <rect width="7" height="9" x="14" y="12" rx="1" />
              <rect width="7" height="5" x="3" y="16" rx="1" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white font-inter">Dashboard</h1>
          </div>
        </div>
      </div>

      {/* 🔥 KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Today's Sales"
          value={data.today_sales || 0}
          icon={cashOutline}
          color="text-green-600"
        />

        <KPICard
          title="Monthly Sales"
          value={data.month_sales || 0}
          icon={trendingUpOutline}
          color="text-blue-600"
        />

        <KPICard
          title="Total Sales"
          value={data.total_sales || 0}
          icon={cartOutline}
          color="text-purple-600"
        />

        <KPICard
          title="Total Orders"
          value={data.total_orders || 0}
          icon={cubeOutline}
          color="text-orange-600"
          subtitle={`${data.total_orders || 0} orders processed`}
        />
      </div>

      {/* Credit Summary Row - Bento Box Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

        {/* Left Column - Credit Cards Stack */}
        <div className="lg:col-span-1 space-y-3">
          {/* Credit Card */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white text-start font-inter hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <p className="text-red-100 text-sm font-medium">Total Credit Given</p>
                <p className="text-4xl font-bold mt-2">₹{customerSummary?.total_credit || 0}</p>
                <p className="text-red-100 text-sm mt-2">
                  {customerSummary?.customers_with_credit || 0} customers have outstanding dues
                </p>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <IonIcon icon={peopleOutline} className="text-2xl" />
              </div>
            </div>
          </div>

          {/* Top Debtors */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <IonIcon icon={warningOutline} className="text-red-500" />
              Top Debtors
            </h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-hide">
              {customerSummary?.top_debtors?.length > 0 ? (
                customerSummary.top_debtors.map((c: any, i: number) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 hover:bg-gray-50 px-2 rounded-lg transition">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${i === 0 ? 'bg-yellow-100 text-yellow-600' :
                        i === 1 ? 'bg-gray-100 text-gray-600' :
                          i === 2 ? 'bg-orange-100 text-orange-600' :
                            'bg-gray-100 text-gray-600'
                        }`}>
                        {i + 1}
                      </div>
                      <span className="text-gray-700 font-medium">{c.name}</span>
                    </div>
                    <span className="font-semibold text-red-600">₹{c.credit_balance.toLocaleString()}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-center py-8 flex flex-col items-center gap-2">
                  <IonIcon icon={checkmarkCircleOutline} className="text-4xl text-green-500" />
                  <p>No debtors found</p>
                  <p className="text-xs">All customers have cleared their dues</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Profit Trend Chart (Spans 2 columns) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 h-full">
            <div className="flex justify-between items-center mb-6">
              <div className="font-inter text-start">
                <h2 className="font-semibold text-gray-800 text-lg font-inter">Profit Analysis</h2>
                <p className="text-xs text-gray-400 mt-1 font-inter">Last 7 days performance</p>
              </div>
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-green-100 text-green-600 text-xs rounded-full flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Revenue
                </div>
                <div className="px-3 py-1 bg-red-100 text-red-600 text-xs rounded-full flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  Cost
                </div>
                <div className="px-3 py-1 bg-purple-100 text-purple-600 text-xs rounded-full flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  Profit
                </div>
              </div>
            </div>

            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={profitTrend} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                  <defs>
                    {/* Revenue Gradient */}
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>

                    {/* Cost Gradient */}
                    <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>

                    {/* Profit Gradient */}
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>

                    {/* Drop Shadow Filters */}
                    <filter id="revenueShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#10b981" floodOpacity="0.3" />
                    </filter>
                    <filter id="costShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#ef4444" floodOpacity="0.3" />
                    </filter>
                    <filter id="profitShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#8b5cf6" floodOpacity="0.4" />
                    </filter>
                  </defs>

                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />

                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                    dx={-10}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      borderRadius: '12px',
                      border: 'none',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)',
                      padding: '12px',
                      fontSize: '12px',
                      textAlign: 'start'
                    }}
                    formatter={(value: any, name: string) => [
                      `₹${Number(value).toLocaleString()}`,
                      name.charAt(0).toUpperCase() + name.slice(1)
                    ]}
                    labelFormatter={(label) => ` ${label}`}
                    cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '5 5' }}
                  />

                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    iconSize={10}
                    formatter={(value) => <span className="text-xs font-medium text-gray-600">{value}</span>}
                  />

                  {/* Revenue Area with Inner Shadow */}
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#revenueGradient)"
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                    filter="url(#revenueShadow)"
                  />

                  {/* Cost Area with Inner Shadow */}
                  <Area
                    type="monotone"
                    dataKey="cost"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    fill="url(#costGradient)"
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
                    filter="url(#costShadow)"
                  />

                  {/* Profit Line with Glow Effect */}
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#8b5cf6"
                    strokeWidth={3.5}
                    dot={{ fill: '#8b5cf6', strokeWidth: 3, r: 5, stroke: '#fff' }}
                    activeDot={{ r: 7, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 3 }}
                    filter="url(#profitShadow)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 font-inter">
        {/* Sales Trend Chart */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800 font-inter">Sales Trend</h2>
            <div className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">Last 7 Days</div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.6} />
                  </linearGradient>
                  <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#3b82f6" floodOpacity="0.3" />
                  </filter>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Sales']}
                  labelFormatter={(label) => ` ${label}`}
                  cursor={{ fill: '#f0f9ff' }}
                />
                <Bar
                  dataKey="total"
                  fill="url(#barGradient)"
                  radius={[8, 8, 0, 0]}
                  barSize={40}
                  filter="url(#barShadow)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4 font-inter">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2 font-inter">
              <IonIcon icon={warningOutline} className="text-orange-500" />
              Low Stock Alert
            </h2>
            <span className="text-xs text-orange-500">⚠️ Needs attention</span>
          </div>
          <div className="space-y-2">
            {data.low_stock?.length === 0 ? (
              <div className="text-green-500 text-center py-8 flex items-center justify-center gap-2">
                <IonIcon icon={checkmarkCircleOutline} className="text-xl" />
                All stock levels are good
              </div>
            ) : (
              data.low_stock?.slice(0, 5).map((p: any) => (
                <div key={p.product_uuid} className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-800">{p.name}</p>
                    <p className="text-xs text-gray-400">Product ID: {p.product_uuid?.slice(0, 8)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-red-600 font-semibold">{p.stock} left</span>
                    <div className="w-20 h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min((p.stock / 20) * 100, 100)}%` }}></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Recent Sales */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2 font-inter">
              <IonIcon icon={cartOutline} className="text-blue-500" />
              Recent Sales
            </h2>
            <span className="text-xs text-gray-400">Last 5 transactions</span>
          </div>
          <div className="space-y-2">
            {data.recent_sales?.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No recent sales</div>
            ) : (
              data.recent_sales?.slice(0, 5).map((s: any) => (
                <div key={s.sale_uuid} className="flex justify-between items-center py-3 border-b border-gray-100 hover:bg-gray-50 px-2 rounded-lg transition">
                  <div>
                    <p className="font-medium text-gray-800">{s.invoice_number}</p>
                    <p className="text-xs text-gray-400">{new Date(s.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="font-semibold text-green-600">₹{Number(s.grand_total).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Purchases */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2 font-inter">
            <IonIcon icon={cubeOutline} className="text-purple-500" />
            Recent Purchases
          </h2>
          <div className="space-y-2">
            {data.recent_purchases?.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No purchases recorded</div>
            ) : (
              data.recent_purchases?.slice(0, 5).map((p: any) => (
                <div key={p.purchase_uuid} className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-800">{p.supplier?.name || "Supplier"}</p>
                    <p className="text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className="font-semibold text-purple-600">₹{Number(p.total).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}