"use client";
import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Users, Library, Truck, BadgeDollarSign } from "lucide-react";
import toast from "react-hot-toast";
import { GetAllBooks } from "@/lib/actions/books";
import { GetAllUsers } from "@/lib/actions/users";
import { GetAllDeliveries } from "@/lib/actions/deliveries";

const CATEGORY_COLORS = [
  "#008854", "#0a5c46", "#e9c46a", "#f4a261",
  "#e76f51", "#264653", "#2a9d8f", "#a8dadc",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

export default function AdminOverview() {
  const [books, setBooks] = useState([]);
  const [users, setUsers] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [b, u, d] = await Promise.all([
          GetAllBooks(),
          GetAllUsers(),
          GetAllDeliveries(),
        ]);
        setBooks(b);
        setUsers(u);
        setDeliveries(d);
      } catch (err) {
        toast.error("Failed to load data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── Derived stats ─────────────────────────────────────────────────────────

  const totalRevenue = useMemo(
    () => deliveries.reduce((sum, d) => sum + (d.deliveryFee || 0), 0),
    [deliveries]
  );

  // Group deliveries by month for the current year, sum revenue
  const revenueChartData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const map = {};

    deliveries.forEach((d) => {
      if (!d.createdAt) return;
      const date = new Date(d.createdAt);
      if (date.getFullYear() !== currentYear) return;
      const month = MONTHS[date.getMonth()];
      map[month] = (map[month] || 0) + (d.deliveryFee || 0);
    });

    // Return all 12 months so the chart always has a full x-axis
    return MONTHS.map((month) => ({
      month,
      revenue: map[month] || 0,
    }));
  }, [deliveries]);

  // Books by category for pie chart
  const categoryData = useMemo(() => {
    const map = {};
    books.forEach((b) => {
      if (!b.category) return;
      map[b.category] = (map[b.category] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [books]);

  // Delivery status breakdown
  const deliveryStats = useMemo(() => {
    const pending = deliveries.filter((d) => d.status === "Pending").length;
    const dispatched = deliveries.filter((d) => d.status === "Dispatched").length;
    const delivered = deliveries.filter((d) => d.status === "Delivered").length;
    return { pending, dispatched, delivered };
  }, [deliveries]);

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-[#0a5c46] text-sm animate-pulse">Loading...</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

      <motion.div {...fadeUp(0)}>
        <h1 className="text-xl font-bold text-[#0a5c46]">Admin Panel</h1>
        <p className="text-sm text-gray-500 mt-0.5">Platform-wide overview.</p>
      </motion.div>

      {/* Top stats */}
      <motion.div {...fadeUp(0.05)} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Users",
            value: users.length,
            icon: Users,
            color: "bg-purple-100 text-purple-700",
          },
          {
            label: "Total Books",
            value: books.length,
            icon: Library,
            color: "bg-[#008854]/10 text-[#008854]",
          },
          {
            label: "Total Deliveries",
            value: deliveries.length,
            icon: Truck,
            color: "bg-blue-100 text-blue-700",
          },
          {
            label: "Total Revenue",
            value: `$${totalRevenue.toFixed(2)}`,
            icon: BadgeDollarSign,
            color: "bg-yellow-100 text-yellow-700",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                <Icon size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-[#0a5c46] truncate">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Delivery status pills */}
      <motion.div {...fadeUp(0.08)} className="grid grid-cols-3 gap-4">
        {[
          { label: "Pending",    value: deliveryStats.pending,    bg: "bg-yellow-50", text: "text-yellow-700", dot: "bg-yellow-400" },
          { label: "Dispatched", value: deliveryStats.dispatched, bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-400"   },
          { label: "Delivered",  value: deliveryStats.delivered,  bg: "bg-green-50",  text: "text-green-700",  dot: "bg-green-500"  },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl px-5 py-4 flex items-center gap-3 shadow-sm`}>
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${s.dot}`} />
            <div>
              <p className={`text-xl font-bold ${s.text}`}>{s.value}</p>
              <p className="text-xs text-gray-500">{s.label} Deliveries</p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Revenue chart */}
        <motion.div {...fadeUp(0.1)} className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#0a5c46]">Revenue Overview</h2>
            <span className="text-xs text-gray-400">{new Date().getFullYear()}</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={revenueChartData}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#008854" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#008854" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 10,
                  border: "none",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                }}
                formatter={(v) => [`$${v}`, "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#008854"
                strokeWidth={2}
                fill="url(#revGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category pie */}
        <motion.div {...fadeUp(0.12)} className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-[#0a5c46] mb-4">Books by Category</h2>
          {categoryData.length === 0 ? (
            <p className="text-xs text-gray-400 text-center mt-10">No data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 10,
                    border: "none",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

      </div>

    </div>
  );
}