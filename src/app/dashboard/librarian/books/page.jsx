/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react/no-unescaped-entities */
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSession } from "@/lib/auth-client";
import {
  Library, Pencil, Trash2, X, Upload,
  ChevronDown, Eye, EyeOff, PackageCheck,
  AlertTriangle, Search, Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GetAllBooks, UpdateBook, DeleteBook } from "@/lib/actions/books";

// ── Constants ────────────────────────────────────────────────
const categories = [
  "All", "Fiction", "Non-Fiction", "Self-Help", "Productivity",
  "Science", "History", "Biography", "Religion", "Children", "Other",
];

const BDT_TO_USD = 110;
const toUSD = (bdt) => (bdt / BDT_TO_USD).toFixed(2);

// ── Helpers ──────────────────────────────────────────────────
const normalize = (id) =>
  typeof id === "object" && id?.$oid ? id.$oid : id;

const statusMeta = {
  Published:        { label: "Published",        bg: "bg-green-100",  text: "text-green-700"  },
  Unpublished:      { label: "Unpublished",       bg: "bg-gray-100",   text: "text-gray-600"   },
  "Pending Approval":{ label: "Pending Approval", bg: "bg-yellow-100", text: "text-yellow-700" },
};

const StatusBadge = ({ status }) => {
  const meta = statusMeta[status] || { label: status, bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${meta.bg} ${meta.text}`}>
      {meta.label}
    </span>
  );
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

// ── Delete Confirmation Modal ────────────────────────────────
function DeleteConfirmModal({ book, onClose, onConfirm, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.18 }}
        className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle size={16} />
            <h2 className="text-sm font-bold">Delete Book</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Book preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
            {book.coverImage ? (
              <Image
                src={book.coverImage} alt={book.title}
                width={44} height={56}
                className="w-11 h-14 object-cover rounded-lg shrink-0"
              />
            ) : (
              <div className="w-11 h-14 rounded-lg bg-gray-200 shrink-0 flex items-center justify-center">
                <Library size={16} className="text-gray-400" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#0a5c46] truncate">{book.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{book.author}</p>
              <StatusBadge status={book.status} />
            </div>
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">
            This will permanently remove the book and can't be undone. Any pending deliveries for this book may be affected.
          </p>

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-medium transition"
            >
              {loading ? "Deleting…" : "Delete Book"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────
export default function ManageInventoryPage() {
  const { data: session } = useSession();
  const librarianId = session?.user?.id;
  const router = useRouter();

  const [books, setBooks]               = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [toDelete, setToDelete]         = useState(null); // book object
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [togglingId, setTogglingId]     = useState(null);

  // ── Fetch ────────────────────────────────────────────────
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const all = await GetAllBooks();
      const mine = all.filter((b) => b.librarianId === librarianId);
      setBooks(mine);
      setFiltered(mine);
    } catch {
      toast.error("Failed to load books.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!librarianId) return;
    fetchBooks();
  }, [librarianId]);

  // ── Filter logic ─────────────────────────────────────────
  useEffect(() => {
    let result = [...books];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.author?.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "All") {
      result = result.filter((b) => b.category === categoryFilter);
    }
    if (statusFilter !== "All") {
      result = result.filter((b) => b.status === statusFilter);
    }
    setFiltered(result);
  }, [search, categoryFilter, statusFilter, books]);

  // ── Toggle publish ───────────────────────────────────────
  const handleTogglePublish = async (book) => {
    if (book.status === "Pending Approval") return;
    const newStatus = book.status === "Published" ? "Unpublished" : "Published";
    setTogglingId(normalize(book._id));
    try {
      await UpdateBook(normalize(book._id), { status: newStatus });
      setBooks((prev) =>
        prev.map((b) =>
          normalize(b._id) === normalize(book._id) ? { ...b, status: newStatus } : b
        )
      );
      toast.success(`Book ${newStatus === "Published" ? "published" : "unpublished"}.`);
    } catch {
      toast.error("Failed to update status.");
    } finally {
      setTogglingId(null);
    }
  };

  // ── Delete ───────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!toDelete) return;
    setDeleteLoading(true);
    try {
      await DeleteBook(normalize(toDelete._id));
      setBooks((prev) => prev.filter((b) => normalize(b._id) !== normalize(toDelete._id)));
      toast.success("Book deleted.");
      setToDelete(null);
    } catch {
      toast.error("Failed to delete book.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Stats ────────────────────────────────────────────────
  const stats = {
    total:    books.length,
    published: books.filter((b) => b.status === "Published").length,
    pending:   books.filter((b) => b.status === "Pending Approval").length,
    unpublished: books.filter((b) => b.status === "Unpublished").length,
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0a5c46]">Manage Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            View, edit, and control visibility of your books.
          </p>
        </div>
      </motion.div>

      {/* Stats row */}
      <motion.div {...fadeUp(0.05)} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Books",   value: stats.total,       color: "text-[#0a5c46]",  bg: "bg-[#008854]/10" },
          { label: "Published",     value: stats.published,   color: "text-green-700",  bg: "bg-green-50"    },
          { label: "Unpublished",   value: stats.unpublished, color: "text-gray-600",   bg: "bg-gray-100"    },
          { label: "Pending Review",value: stats.pending,     color: "text-yellow-700", bg: "bg-yellow-50"   },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-4 ${s.bg}`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div {...fadeUp(0.08)} className="bg-white rounded-2xl p-4 shadow-sm flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or author…"
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#008854] transition"
          />
        </div>

        {/* Category */}
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none pl-3 pr-7 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#008854] transition bg-white"
          >
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Status */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none pl-3 pr-7 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#008854] transition bg-white"
          >
            {["All", "Published", "Unpublished", "Pending Approval"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Clear filters */}
        {(search || categoryFilter !== "All" || statusFilter !== "All") && (
          <button
            onClick={() => { setSearch(""); setCategoryFilter("All"); setStatusFilter("All"); }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition px-2 py-2"
          >
            <X size={12} /> Clear
          </button>
        )}
      </motion.div>

      {/* Table */}
      <motion.div {...fadeUp(0.1)} className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#008854] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
            <Library size={28} className="text-gray-200" />
            <p className="text-sm font-medium text-gray-400">
              {books.length === 0 ? "No books added yet." : "No books match your filters."}
            </p>
            {books.length > 0 && (
              <button
                onClick={() => { setSearch(""); setCategoryFilter("All"); setStatusFilter("All"); }}
                className="text-xs text-[#008854] hover:underline mt-1"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100 bg-gray-50/60">
                  <th className="text-left px-5 py-3 font-medium">Book</th>
                  <th className="text-left px-4 py-3 font-medium">Category</th>
                  <th className="text-left px-4 py-3 font-medium">Fee</th>
                  <th className="text-left px-4 py-3 font-medium">Added</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Visibility</th>
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((book, i) => {
                  const id = normalize(book._id);
                  const isToggling = togglingId === id;
                  const canToggle = book.status !== "Pending Approval";
                  const isPublished = book.status === "Published";

                  return (
                    <motion.tr
                      key={id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: i * 0.03 }}
                      className="group text-gray-600 hover:bg-gray-50/50 transition"
                    >
                      {/* Book cell — cover + title + author */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {book.coverImage ? (
                            <Image
                              src={book.coverImage} alt={book.title}
                              width={36} height={48}
                              className="w-9 h-12 object-cover rounded-lg shrink-0 shadow-sm"
                            />
                          ) : (
                            <div className="w-9 h-12 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center">
                              <Library size={14} className="text-gray-300" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-[#0a5c46] truncate max-w-40">{book.title}</p>
                            <p className="text-xs text-gray-400 truncate max-w-40">{book.author}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-gray-500 text-xs">{book.category || "—"}</td>

                      <td className="px-4 py-3 font-medium text-[#0a5c46]">
                        ${toUSD(book.deliveryFee)}
                      </td>

                      <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                        {book.createdAt
                          ? new Date(book.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric", month: "short", year: "numeric",
                            })
                          : "—"}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge status={book.status} />
                      </td>

                      {/* Visibility toggle */}
                      <td className="px-4 py-3">
                        {!canToggle ? (
                          <span className="text-xs text-gray-300 italic">Awaiting approval</span>
                        ) : (
                          <button
                            onClick={() => handleTogglePublish(book)}
                            disabled={isToggling}
                            title={isPublished ? "Click to unpublish" : "Click to publish"}
                            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition disabled:opacity-50 ${
                              isPublished
                                ? "bg-green-50 text-green-700 hover:bg-green-100"
                                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                            }`}
                          >
                            {isToggling ? (
                              <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                            ) : isPublished ? (
                              <Eye size={12} />
                            ) : (
                              <EyeOff size={12} />
                            )}
                            {isPublished ? "Published" : "Unpublished"}
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* Edit → redirect to book edit page */}
                          <button
                            onClick={() => router.push(`/browse/${id}/edit`)}
                            title="Edit book"
                            className="p-1.5 rounded-lg hover:bg-[#008854]/10 text-gray-400 hover:text-[#008854] transition"
                          >
                            <Pencil size={14} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setToDelete(book)}
                            title="Delete book"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer count */}
            <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
              Showing {filtered.length} of {books.length} book{books.length !== 1 ? "s" : ""}
            </div>
          </div>
        )}
      </motion.div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {toDelete && (
          <DeleteConfirmModal
            book={toDelete}
            onClose={() => setToDelete(null)}
            onConfirm={handleDeleteConfirm}
            loading={deleteLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}