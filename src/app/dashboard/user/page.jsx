/* eslint-disable react-hooks/static-components */
/* eslint-disable react/no-unescaped-entities */
"use client";
import { useEffect, useState, useMemo } from "react";
import { motion } from "motion/react";
import { useSession } from "@/lib/auth-client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import {
  BookOpen, Truck, BadgeDollarSign, Star,
  Pencil, Trash2, PackageCheck, Clock,
} from "lucide-react";
import Image from "next/image";
import { GetDeliveriesByUser } from "@/lib/actions/deliveries.js";
import { GetBookById } from "@/lib/actions/books.js";

// ── Helpers ───────────────────────────────────────────────

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const statusColor = (status) => {
  if (status === "Delivered")  return "bg-green-100 text-green-700";
  if (status === "Dispatched") return "bg-blue-100 text-blue-700";
  return "bg-yellow-100 text-yellow-700";
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

// Dummy reviews — replace once review server action is ready
const dummyReviews = [
  { id: 1, book: "Atomic Habits", rating: 5, comment: "Life changing book. Highly recommend to everyone.", date: "2026-06-05" },
  { id: 2, book: "Ikigai",        rating: 4, comment: "A beautiful, calming read about purpose and meaning.", date: "2026-06-23" },
];

// ── Sub-components ────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-[#0a5c46]">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────

export default function UserDashboard() {
  const { data: session } = useSession();
  const user = session?.user;

  const [deliveries, setDeliveries]     = useState([]);
  const [readingList, setReadingList]   = useState([]);
  const [loading, setLoading]           = useState(true);

  // ── Fetch deliveries ──────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    GetDeliveriesByUser(user.id)
      .then(setDeliveries)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  // ── Derive stats ──────────────────────────────────────
  const stats = useMemo(() => {
    const booksRead  = deliveries.filter(d => d.status === "Delivered").length;
    const pending    = deliveries.filter(d => d.status === "Pending").length;
    const totalSpent = deliveries
      .filter(d => d.status === "Delivered")
      .reduce((sum, d) => sum + (Number(d.deliveryFee) || 0), 0);
    return { booksRead, pending, totalSpent };
  }, [deliveries]);

  // ── Derive spending chart data (last 6 months) ────────
  const spendingData = useMemo(() => {
    const now       = new Date();
    const buckets   = {};
    for (let i = 5; i >= 0; i--) {
      const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      buckets[key] = { month: MONTHS[d.getMonth()], spent: 0 };
    }
    deliveries
      .filter(d => d.status === "Delivered" && d.createdAt)
      .forEach(d => {
        const date = new Date(d.createdAt);
        const key  = `${date.getFullYear()}-${date.getMonth()}`;
        if (buckets[key]) buckets[key].spent += Number(d.deliveryFee) || 0;
      });
    return Object.values(buckets);
  }, [deliveries]);

  // ── Recent deliveries (last 4) ────────────────────────
  const recentDeliveries = useMemo(() =>
    [...deliveries]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 4),
    [deliveries]
  );

  // ── Reading list: fetch book details for Delivered ────
  useEffect(() => {
    const delivered = deliveries.filter(d => d.status === "Delivered" && d.bookId);
    if (!delivered.length) return;

    // Deduplicate by bookId
    const uniqueIds = [...new Map(delivered.map(d => [d.bookId, d])).values()];

    Promise.all(
      uniqueIds.slice(0, 6).map(d =>
        GetBookById(d.bookId).catch(() => null)
      )
    ).then(books => setReadingList(books.filter(Boolean)));
  }, [deliveries]);

  // ── Skeleton helper ───────────────────────────────────
  const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

      {/* Greeting */}
      <motion.div {...fadeUp(0)}>
        <h1 className="text-xl font-bold text-[#0a5c46]">
          Good to see you, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Here's what's happening with your account.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div {...fadeUp(0.05)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? (
          <>
            <Skeleton className="h-19" />
            <Skeleton className="h-19" />
            <Skeleton className="h-19" />
          </>
        ) : (
          <>
            <StatCard
              label="Books Read"
              value={stats.booksRead}
              icon={BookOpen}
              color="bg-[#008854]/10 text-[#008854]"
            />
            <StatCard
              label="Pending Deliveries"
              value={stats.pending}
              icon={Truck}
              color="bg-yellow-100 text-yellow-700"
            />
            <StatCard
              label="Total Spent on Fees"
              value={`$${stats.totalSpent}`}
              icon={BadgeDollarSign}
              color="bg-blue-100 text-blue-700"
            />
          </>
        )}
      </motion.div>

      {/* Spending chart */}
      <motion.div {...fadeUp(0.1)} className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-[#0a5c46] mb-4">
          Delivery Fee Spending (Last 6 Months)
        </h2>
        {loading ? (
          <Skeleton className="h-50 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={spendingData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#008854" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#008854" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false} tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 12, borderRadius: 10,
                  border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                }}
                formatter={(v) => [`$${v}`, "Spent"]}
              />
              <Area
                type="monotone"
                dataKey="spent"
                stroke="#008854"
                strokeWidth={2}
                fill="url(#spendGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Recent delivery history */}
      <motion.div {...fadeUp(0.15)} className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-[#0a5c46] mb-4">Recent Deliveries</h2>
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10" />)}
          </div>
        ) : recentDeliveries.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">No deliveries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-3 font-medium">Book</th>
                  <th className="text-left pb-3 font-medium">Fee</th>
                  <th className="text-left pb-3 font-medium">Date</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentDeliveries.map((d) => (
                  <tr key={d._id} className="text-gray-600">
                    <td className="py-3 font-medium text-[#0a5c46]">
                      {d.bookTitle ?? d.title ?? "—"}
                    </td>
                    <td className="py-3">
                      {d.deliveryFee != null ? `$${d.deliveryFee}` : "—"}
                    </td>
                    <td className="py-3 text-gray-400">
                      {d.createdAt
                        ? new Date(d.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit", month: "short", year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(d.status)}`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

    </div>
  );
}