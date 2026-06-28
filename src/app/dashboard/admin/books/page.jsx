"use client";
import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { Trash2, CheckCircle, ShieldCheck, Library } from "lucide-react";
import toast from "react-hot-toast";
import { GetAllBooks } from "@/lib/actions/books";
import { UpdateBookStatus, DeleteBook } from "@/lib/actions/admin";

const normalize = (id) => {
  if (!id) return "";
  if (typeof id === "object" && id.$oid) return id.$oid;
  return id.toString();
};

function StatusBadge({ status }) {
  const map = {
    "Published":        "bg-green-100 text-green-700",
    "Pending Approval": "bg-yellow-100 text-yellow-700",
    "Unpublished":      "bg-gray-100 text-gray-500",
    "Checked Out":      "bg-red-100 text-red-600",
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {status}
    </span>
  );
}

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetAllBooks()
      .then(setBooks)
      .catch(() => toast.error("Failed to load books."))
      .finally(() => setLoading(false));
  }, []);

  const pendingBooks = useMemo(() => books.filter((b) => b.status === "Pending Approval"), [books]);

  const handleApprove = async (bookId) => {
    try {
      await UpdateBookStatus(bookId, "Published");
      setBooks((prev) => prev.map((b) => normalize(b._id) === bookId ? { ...b, status: "Published" } : b));
      toast.success("Book approved and published.");
    } catch { toast.error("Failed to approve."); }
  };

  const handleUnpublish = async (bookId) => {
    try {
      await UpdateBookStatus(bookId, "Unpublished");
      setBooks((prev) => prev.map((b) => normalize(b._id) === bookId ? { ...b, status: "Unpublished" } : b));
      toast.success("Book unpublished.");
    } catch { toast.error("Failed to unpublish."); }
  };

  const handleDelete = async (bookId) => {
    try {
      await DeleteBook(bookId);
      setBooks((prev) => prev.filter((b) => normalize(b._id) !== bookId));
      toast.success("Book deleted.");
    } catch { toast.error("Failed to delete."); }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-[#0a5c46] text-sm animate-pulse">Loading books...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-xl font-bold text-[#0a5c46]">Manage Books</h1>
        <p className="text-sm text-gray-500 mt-0.5">{books.length} books platform-wide.</p>
      </motion.div>

      {/* Approval Queue */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={16} className="text-[#008854]" />
          <h2 className="text-sm font-semibold text-[#0a5c46]">
            Approval Queue
            <span className="ml-2 text-xs font-normal text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
              {pendingBooks.length} pending
            </span>
          </h2>
        </div>

        {pendingBooks.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">No books pending approval. All clear!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  {["Title", "Author", "Category", "Fee", "Librarian", "Actions"].map((h) => (
                    <th key={h} className="text-left pb-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingBooks.map((b) => {
                  const id = normalize(b._id);
                  return (
                    <tr key={id} className="text-gray-600">
                      <td className="py-3 font-medium text-[#0a5c46] max-w-40 truncate">{b.title}</td>
                      <td className="py-3 text-gray-500">{b.author}</td>
                      <td className="py-3 text-gray-500">{b.category ?? "—"}</td>
                      <td className="py-3">৳{b.deliveryFee}</td>
                      <td className="py-3 text-gray-500">
                        {typeof b.librarian === "object" ? b.librarian?.name ?? "—" : "—"}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleApprove(id)}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 font-medium transition"
                          >
                            <CheckCircle size={13} /> Approve & Publish
                          </button>
                          <button
                            onClick={() => handleDelete(id)}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 font-medium transition"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* All Books */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <Library size={16} className="text-[#008854]" />
          <h2 className="text-sm font-semibold text-[#0a5c46]">All Books</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                {["Title", "Author", "Category", "Fee", "Status", "Actions"].map((h) => (
                  <th key={h} className="text-left pb-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {books.map((b) => {
                const id = normalize(b._id);
                return (
                  <tr key={id} className="text-gray-600">
                    <td className="py-3 font-medium text-[#0a5c46] max-w-40 truncate">{b.title}</td>
                    <td className="py-3 text-gray-500">{b.author}</td>
                    <td className="py-3 text-gray-500">{b.category ?? "—"}</td>
                    <td className="py-3">৳{b.deliveryFee}</td>
                    <td className="py-3"><StatusBadge status={b.status} /></td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {b.status === "Published" && (
                          <button
                            onClick={() => handleUnpublish(id)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium transition"
                          >
                            Unpublish
                          </button>
                        )}
                        {(b.status === "Unpublished" || b.status === "Pending Approval") && (
                          <button
                            onClick={() => handleApprove(id)}
                            className="text-xs px-2.5 py-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 font-medium transition"
                          >
                            Publish
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}