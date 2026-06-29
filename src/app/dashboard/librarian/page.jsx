/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSession } from "@/lib/auth-client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Library, DollarSign, Clock, Pencil, Trash2,
  Plus, PackageCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import {GetAllBooks, UpdateBook, DeleteBook } from "@/lib/actions/books";
import { getClientToken } from "@/lib/client-token";
import AddBookModal from "@/components/shared/BookForm";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const BDT_TO_USD = 110;

const toUSD = (bdt) => (bdt / BDT_TO_USD).toFixed(2);

const statusColor = (status) => {
  if (status === "Published") return "bg-green-100 text-green-700";
  if (status === "Unpublished") return "bg-gray-100 text-gray-600";
  return "bg-yellow-100 text-yellow-700";
};

const deliveryStatusColor = (status) => {
  if (status === "Delivered") return "bg-green-100 text-green-700";
  if (status === "Dispatched") return "bg-blue-100 text-blue-700";
  return "bg-yellow-100 text-yellow-700";
};

const deliveryStatusNext = { Pending: "Dispatched", Dispatched: "Delivered", Delivered: null };

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

// ── Actions ─────────────────────────────────────────────────

const GetLibrarianDeliveries = async (librarianId) => {
  const token = await getClientToken();
  const res = await fetch(`${API}/deliveries/librarian/${librarianId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

const AdvanceDelivery = async (id, status) => {
  const token = await getClientToken();
  const res = await fetch(`${API}/deliveries/${id}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// ── Add Book Modal ──────────────────────────────────────────


// ── Main page ───────────────────────────────────────────────
export default function LibrarianDashboard() {
  const { data: session } = useSession();
  const librarianId = session?.user?.id;

  const [books, setBooks] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingDeliveries, setLoadingDeliveries] = useState(true);
  const [showAddBook, setShowAddBook] = useState(false);

  const fetchBooks = async () => {
    try {
      setLoadingBooks(true);
      const all = await GetAllBooks();
      setBooks(all.filter((b) => b.librarianId === librarianId));
    } catch {
      toast.error("Failed to load books.");
    } finally {
      setLoadingBooks(false);
    }
  };

  const fetchDeliveries = async () => {
    if (!librarianId) return;
    try {
      setLoadingDeliveries(true);
      const data = await GetLibrarianDeliveries(librarianId);
      setDeliveries(data);
    } catch {
      toast.error("Failed to load deliveries.");
    } finally {
      setLoadingDeliveries(false);
    }
  };

  useEffect(() => {
    if (!librarianId) return;
    fetchBooks();
    fetchDeliveries();
  }, [librarianId]);

  // ── Earnings chart — group deliveries by month
  const earningsData = (() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const map = {};
    deliveries.forEach((d) => {
      if (d.status !== "Delivered") return;
      const month = months[new Date(d.createdAt).getMonth()];
      map[month] = (map[month] || 0) + (d.deliveryFee || 0);
    });
    return months
      .filter((m) => map[m])
      .map((m) => ({ month: m, earnings: parseFloat(toUSD(map[m])) }));
  })();

  // ── Most requested books from deliveries
  const topRequested = (() => {
    const map = {};
    deliveries.forEach((d) => {
      if (!d.bookTitle) return;
      map[d.bookTitle] = (map[d.bookTitle] || 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([title, requests]) => ({ title, requests }));
  })();

  const totalEarnings = deliveries
    .filter((d) => d.status === "Delivered")
    .reduce((sum, d) => sum + (d.deliveryFee || 0), 0);

  const pendingCount = deliveries.filter((d) => d.status === "Pending").length;

  // ── Actions
  const handleTogglePublish = async (book) => {
    if (book.status === "Pending Approval") return;
    const newStatus = book.status === "Published" ? "Unpublished" : "Published";
    try {
      await UpdateBook(book._id, { status: newStatus });
      setBooks((prev) => prev.map((b) => b._id === book._id ? { ...b, status: newStatus } : b));
      toast.success(`Book ${newStatus.toLowerCase()}.`);
    } catch {
      toast.error("Failed to update book.");
    }
  };

  const handleDeleteBook = async (id) => {
    try {
      await DeleteBook(id);
      setBooks((prev) => prev.filter((b) => b._id !== id));
      toast.success("Book deleted.");
    } catch {
      toast.error("Failed to delete book.");
    }
  };

  const handleAdvanceDelivery = async (delivery) => {
    const next = deliveryStatusNext[delivery.status];
    if (!next) return;
    try {
      await AdvanceDelivery(delivery._id, next);
      setDeliveries((prev) => prev.map((d) => d._id === delivery._id ? { ...d, status: next } : d));
      toast.success(`Marked as ${next}.`);
    } catch {
      toast.error("Failed to update delivery.");
    }
  };

  const normalize = (id) => (typeof id === "object" && id?.$oid ? id.$oid : id);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

      {/* Greeting */}
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0a5c46]">Librarian Panel</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your books and deliveries.</p>
        </div>
        <button
          onClick={() => setShowAddBook(true)}
          className="flex items-center gap-2 bg-[#008854] hover:bg-[#0a5c46] text-white text-sm font-medium px-4 py-2.5 rounded-xl transition"
        >
          <Plus size={16} /> Add Book
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div {...fadeUp(0.05)} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Books Listed", value: books.length, icon: Library, color: "bg-[#008854]/10 text-[#008854]" },
          { label: "Total Earnings", value: `$${toUSD(totalEarnings)}`, icon: DollarSign, color: "bg-blue-100 text-blue-700" },
          { label: "Pending Requests", value: pendingCount, icon: Clock, color: "bg-yellow-100 text-yellow-700" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
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

      {/* Earnings chart + top requested */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div {...fadeUp(0.1)} className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-[#0a5c46] mb-4">Earnings Overview (USD)</h2>
          {earningsData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-sm text-gray-400">No delivered orders yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={earningsData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#008854" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#008854" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 10, border: "none", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
                  formatter={(v) => [`$${v}`, "Earned"]}
                />
                <Area type="monotone" dataKey="earnings" stroke="#008854" strokeWidth={2} fill="url(#earnGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div {...fadeUp(0.12)} className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-[#0a5c46] mb-4">Most Requested</h2>
          {topRequested.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet</p>
          ) : (
            <div className="space-y-3">
              {topRequested.map((b, i) => (
                <div key={b.title} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#0a5c46] truncate">{b.title}</p>
                    <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#008854] rounded-full" style={{ width: `${(b.requests / 20) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{b.requests}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Manage Inventory */}
      <motion.div {...fadeUp(0.15)} className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-[#0a5c46] mb-4">Manage Inventory</h2>
        {loadingBooks ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-[#008854] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : books.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No books yet. Add your first book!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-3 font-medium">Title</th>
                  <th className="text-left pb-3 font-medium">Author</th>
                  <th className="text-left pb-3 font-medium">Category</th>
                  <th className="text-left pb-3 font-medium">Fee</th>
                  <th className="text-left pb-3 font-medium">Added</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {books.map((b) => (
                  <tr key={normalize(b._id)} className="text-gray-600">
                    <td className="py-3 font-medium text-[#0a5c46]">{b.title}</td>
                    <td className="py-3 text-gray-500">{b.author}</td>
                    <td className="py-3 text-gray-500">{b.category}</td>
                    <td className="py-3">${toUSD(b.deliveryFee)}</td>
                    <td className="py-3 text-gray-400 text-xs">
                      {b.createdAt
                        ? new Date(b.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {b.status !== "Pending Approval" && (
                          <button
                            onClick={() => handleTogglePublish(b)}
                            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition ${
                              b.status === "Published"
                                ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {b.status === "Published" ? "Unpublish" : "Publish"}
                          </button>
                        )}
                        <button className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-[#008854] transition">
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(normalize(b._id))}
                          className="p-1.5 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-red-500 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Manage Deliveries */}
      <motion.div {...fadeUp(0.2)} className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-[#0a5c46] mb-4">Manage Deliveries</h2>
        {loadingDeliveries ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-[#008854] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : deliveries.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No deliveries assigned yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-3 font-medium">Client</th>
                  <th className="text-left pb-3 font-medium">Book</th>
                  <th className="text-left pb-3 font-medium">Fee</th>
                  <th className="text-left pb-3 font-medium">Date</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {deliveries.map((d) => (
                  <tr key={normalize(d._id)} className="text-gray-600">
                    <td className="py-3 font-medium text-[#0a5c46]">{d.userName}</td>
                    <td className="py-3 text-gray-500">{d.bookTitle}</td>
                    <td className="py-3">${toUSD(d.deliveryFee)}</td>
                    <td className="py-3 text-gray-400">{new Date(d.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${deliveryStatusColor(d.status)}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {deliveryStatusNext[d.status] ? (
                        <button
                          onClick={() => handleAdvanceDelivery(d)}
                          className="text-xs px-2.5 py-1 rounded-lg bg-[#008854]/10 text-[#008854] hover:bg-[#008854]/20 font-medium transition"
                        >
                          Mark {deliveryStatusNext[d.status]}
                        </button>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <PackageCheck size={13} /> Done
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Add Book Modal */}
      <AnimatePresence>
        {showAddBook && (
          <AddBookModal
            onClose={() => setShowAddBook(false)}
            onAdded={fetchBooks}
          />
        )}
      </AnimatePresence>
    </div>
  );
}