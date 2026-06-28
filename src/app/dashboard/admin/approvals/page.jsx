"use client";
import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { Trash2, CheckCircle, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { GetAllBooks } from "@/lib/actions/books";
import { UpdateBook, DeleteBook } from "@/lib/actions/books";

const normalize = (id) => {
  if (!id) return "";
  if (typeof id === "object" && id.$oid) return id.$oid;
  return id.toString();
};

export default function AdminApprovals() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetAllBooks()
      .then(setBooks)
      .catch(() => toast.error("Failed to load books."))
      .finally(() => setLoading(false));
  }, []);

  const pendingBooks = useMemo(
    () => books.filter((b) => b.status === "Pending Approval"),
    [books]
  );

  const handleApprove = async (id) => {
    try {
      await UpdateBook(id, { status: "Published" });
      setBooks((prev) =>
        prev.map((b) => normalize(b._id) === id ? { ...b, status: "Published" } : b)
      );
      toast.success("Book approved and published.");
    } catch {
      toast.error("Failed to approve.");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this book?")) return;
    try {
      await DeleteBook(id);
      setBooks((prev) => prev.filter((b) => normalize(b._id) !== id));
      toast.success("Book deleted.");
    } catch {
      toast.error("Failed to delete.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-[#0a5c46] text-sm animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl font-bold text-[#0a5c46]">Book Approvals</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {pendingBooks.length} book{pendingBooks.length !== 1 ? "s" : ""} waiting for approval.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={16} className="text-[#008854]" />
          <h2 className="text-sm font-semibold text-[#0a5c46]">
            Pending Approval
            <span className="ml-2 text-xs font-normal text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
              {pendingBooks.length} pending
            </span>
          </h2>
        </div>

        {pendingBooks.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-2">
            <CheckCircle size={32} className="text-green-400" />
            <p className="text-sm text-gray-400">No books pending approval. All clear!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  {["Title", "Author", "Category", "Fee", "Librarian", "Actions"].map((h) => (
                    <th key={h} className="text-left pb-3 font-medium pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {pendingBooks.map((b) => {
                  const id = normalize(b._id);
                  return (
                    <tr key={id} className="text-gray-600">
                      <td className="py-3 pr-4 font-medium text-[#0a5c46] max-w-40 truncate">{b.title}</td>
                      <td className="py-3 pr-4 text-gray-500">{b.author}</td>
                      <td className="py-3 pr-4 text-gray-500">{b.category ?? "—"}</td>
                      <td className="py-3 pr-4">৳{b.deliveryFee}</td>
                      <td className="py-3 pr-4 text-gray-500">
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
    </div>
  );
}