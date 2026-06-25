"use client";
import { motion } from "motion/react";
import { useSession } from "@/lib/auth-client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BookOpen, Truck, BadgeDollarSign, Star, Pencil, Trash2 } from "lucide-react";
import Image from "next/image";

// ── Dummy data ──────────────────────────────────────────────
const spendingData = [
  { month: "Jan", spent: 0 },
  { month: "Feb", spent: 120 },
  { month: "Mar", spent: 80 },
  { month: "Apr", spent: 200 },
  { month: "May", spent: 150 },
  { month: "Jun", spent: 340 },
];

const deliveries = [
  { id: 1, title: "Atomic Habits", fee: "৳60", date: "2026-06-01", status: "Delivered" },
  { id: 2, title: "The Alchemist", fee: "৳50", date: "2026-06-10", status: "Dispatched" },
  { id: 3, title: "Deep Work", fee: "৳70", date: "2026-06-18", status: "Pending" },
  { id: 4, title: "Ikigai", fee: "৳55", date: "2026-06-22", status: "Delivered" },
];

const readingList = [
  { id: 1, title: "Atomic Habits", author: "James Clear", cover: "https://covers.openlibrary.org/b/id/10527843-M.jpg" },
  { id: 2, title: "Ikigai", author: "Héctor García", cover: "https://covers.openlibrary.org/b/id/10388357-M.jpg" },
  { id: 3, title: "Sapiens", author: "Yuval Noah Harari", cover: "https://covers.openlibrary.org/b/id/8739161-M.jpg" },
  { id: 4, title: "The Psychology of Money", author: "Morgan Housel", cover: "https://covers.openlibrary.org/b/id/10361120-M.jpg" },
];

const reviews = [
  { id: 1, book: "Atomic Habits", rating: 5, comment: "Life changing book. Highly recommend to everyone.", date: "2026-06-05" },
  { id: 2, book: "Ikigai", rating: 4, comment: "A beautiful, calming read about purpose and meaning.", date: "2026-06-23" },
];

// ── Helpers ──────────────────────────────────────────────
const statusColor = (status) => {
  if (status === "Delivered") return "bg-green-100 text-green-700";
  if (status === "Dispatched") return "bg-blue-100 text-blue-700";
  return "bg-yellow-100 text-yellow-700";
};

const stats = [
  { label: "Books Read", value: "12", icon: BookOpen, color: "bg-[#008854]/10 text-[#008854]" },
  { label: "Pending Deliveries", value: "1", icon: Truck, color: "bg-yellow-100 text-yellow-700" },
  { label: "Total Spent", value: "৳890", icon: BadgeDollarSign, color: "bg-blue-100 text-blue-700" },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

export default function UserDashboard() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Greeting */}
      <motion.div {...fadeUp(0)}>
        <h1 className="text-xl font-bold text-[#0a5c46]">
          Good to see you, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Here's what's happening with your account.</p>
      </motion.div>

      {/* Stats */}
      <motion.div {...fadeUp(0.05)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0a5c46]">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Spending chart */}
      <motion.div {...fadeUp(0.1)} className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-[#0a5c46] mb-4">Delivery Fee Spending</h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={spendingData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#008854" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#008854" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 10, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
              formatter={(v) => [`৳${v}`, "Spent"]}
            />
            <Area type="monotone" dataKey="spent" stroke="#008854" strokeWidth={2} fill="url(#spendGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Delivery history */}
      <motion.div {...fadeUp(0.15)} className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-[#0a5c46] mb-4">Delivery History</h2>
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
              {deliveries.map((d) => (
                <tr key={d.id} className="text-gray-600">
                  <td className="py-3 font-medium text-[#0a5c46]">{d.title}</td>
                  <td className="py-3">{d.fee}</td>
                  <td className="py-3 text-gray-400">{d.date}</td>
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
      </motion.div>

      {/* Reading list */}
      <motion.div {...fadeUp(0.2)} className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-[#0a5c46] mb-4">My Reading List</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {readingList.map((book) => (
            <div key={book.id} className="group flex flex-col items-center text-center gap-2">
              <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 shadow-sm group-hover:shadow-md transition">
                <Image
                  src={book.cover}
                  alt={book.title}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="text-xs font-semibold text-[#0a5c46] leading-tight">{book.title}</p>
              <p className="text-xs text-gray-400">{book.author}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Reviews */}
      <motion.div {...fadeUp(0.25)} className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-[#0a5c46] mb-4">My Reviews</h2>
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-4 p-4 rounded-xl bg-[#f5f5eb]">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-[#0a5c46]">{r.book}</p>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={11}
                        className={i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{r.comment}</p>
                <p className="text-xs text-gray-400 mt-1">{r.date}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="p-1.5 rounded-lg hover:bg-white transition text-gray-400 hover:text-[#008854]">
                  <Pencil size={14} />
                </button>
                <button className="p-1.5 rounded-lg hover:bg-white transition text-gray-400 hover:text-red-500">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}