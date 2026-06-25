"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSession } from "@/lib/auth-client";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Library, BadgeDollarSign, Clock, Pencil, Trash2,
  Plus, X, Upload, ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { CreateBook } from "@/lib/actions/books";

// ── Dummy data ──────────────────────────────────────────────
const earningsData = [
  { month: "Jan", earnings: 0 },
  { month: "Feb", earnings: 300 },
  { month: "Mar", earnings: 480 },
  { month: "Apr", earnings: 220 },
  { month: "May", earnings: 590 },
  { month: "Jun", earnings: 740 },
];

const topRequested = [
  { title: "The Alchemist", requests: 18 },
  { title: "Atomic Habits", requests: 14 },
  { title: "Deep Work", requests: 9 },
];

const dummyBooks = [
  { id: 1, title: "The Alchemist", author: "Paulo Coelho", category: "Fiction", deliveryFee: 60, status: "Published" },
  { id: 2, title: "Atomic Habits", author: "James Clear", category: "Self-Help", deliveryFee: 70, status: "Pending Approval" },
  { id: 3, title: "Deep Work", author: "Cal Newport", category: "Productivity", deliveryFee: 65, status: "Unpublished" },
];

const dummyDeliveries = [
  { id: 1, client: "Amirul Islam", book: "The Alchemist", date: "2026-06-10", status: "Pending" },
  { id: 2, client: "Meghna Rahman", book: "Atomic Habits", date: "2026-06-15", status: "Dispatched" },
  { id: 3, client: "Rafiq Hossain", book: "Deep Work", date: "2026-06-20", status: "Delivered" },
];

const categories = ["Fiction", "Non-Fiction", "Self-Help", "Productivity", "Science", "History", "Biography", "Religion", "Children", "Other"];

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

const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

// ── Add Book Modal ──────────────────────────────────────────
function AddBookModal({ onClose }) {
  const { data: session } = useSession();
  const [form, setForm] = useState({
    title: "", author: "", description: "", category: "", deliveryFee: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024){
        toast.error('Image size could not be bigger than 5MB');
        return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) { toast.error("Please upload a cover image."); return; }
    setUploading(true);
    try {
      // Upload to imgBB
      const formData = new FormData();
      formData.append("image", imageFile);
      const imgRes = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST", body: formData,
      });
      const imgData = await imgRes.json();
      if (!imgData.success) throw new Error("Image upload failed.");
      const coverImage = imgData.data.url;

      const bookData = {
        ...form,
        deliveryFee: Number(form.deliveryFee),
        coverImage,
        status: "Pending Approval",
        librarian: session?.user?.id,
      };
      const res = await CreateBook(bookData);
      if(res.insertedId){
          toast.success("Book submitted for approval.");
          onClose();
      }
    } catch (err) {
      toast.error(err.message || "Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-[#0a5c46]">Add New Book</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Cover image upload */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">Cover Image</label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#008854]/50 transition overflow-hidden relative bg-gray-50">
              {preview ? (
                <Image src={preview} alt="preview" width={200} height={200} className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-400">
                  <Upload size={20} />
                  <span className="text-xs">Click to upload</span>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
            </label>
          </div>

          {[
            { name: "title", label: "Title", type: "text", placeholder: "The Alchemist" },
            { name: "author", label: "Author", type: "text", placeholder: "Paulo Coelho" },
            { name: "deliveryFee", label: "Delivery Fee (৳)", type: "number", placeholder: "60" },
          ].map((field) => (
            <div key={field.name}>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">{field.label}</label>
              <input
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={form[field.name]}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#008854] focus:ring-2 focus:ring-[#008854]/10 transition"
              />
            </div>
          ))}

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">Category</label>
            <div className="relative">
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full appearance-none px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#008854] focus:ring-2 focus:ring-[#008854]/10 transition bg-white"
              >
                <option value="">Select category</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Brief description of the book..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#008854] focus:ring-2 focus:ring-[#008854]/10 transition resize-none"
            />
          </div>

          <p className="text-xs text-gray-400">
            Book will be submitted as <span className="font-medium text-yellow-600">Pending Approval</span> and won't appear publicly until approved by an admin.
          </p>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-[#008854] hover:bg-[#0a5c46] disabled:opacity-50 text-white text-sm font-medium py-3 rounded-xl transition"
          >
            {uploading ? "Uploading..." : "Submit Book"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────
export default function LibrarianDashboard() {
  const { data: session } = useSession();
  const [showAddBook, setShowAddBook] = useState(false);
  const [books, setBooks] = useState(dummyBooks);
  const [deliveries, setDeliveries] = useState(dummyDeliveries);

  const handleTogglePublish = (id) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        if (b.status === "Pending Approval") return b; // blocked
        return { ...b, status: b.status === "Published" ? "Unpublished" : "Published" };
      })
    );
  };

  const handleDeleteBook = (id) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    toast.success("Book deleted.");
  };

  const handleAdvanceDelivery = (id) => {
    setDeliveries((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        const next = deliveryStatusNext[d.status];
        if (!next) return d;
        return { ...d, status: next };
      })
    );
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Greeting */}
      <motion.div {...fadeUp(0)} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#0a5c46]">
            Librarian Panel
          </h1>
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
          { label: "Total Earnings", value: "৳2,330", icon: BadgeDollarSign, color: "bg-blue-100 text-blue-700" },
          { label: "Pending Requests", value: deliveries.filter(d => d.status === "Pending").length, icon: Clock, color: "bg-yellow-100 text-yellow-700" },
        ].map((s) => {
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

      {/* Earnings chart + top requested */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div {...fadeUp(0.1)} className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-[#0a5c46] mb-4">Earnings Overview</h2>
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
                formatter={(v) => [`৳${v}`, "Earned"]}
              />
              <Area type="monotone" dataKey="earnings" stroke="#008854" strokeWidth={2} fill="url(#earnGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div {...fadeUp(0.12)} className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-[#0a5c46] mb-4">Most Requested</h2>
          <div className="space-y-3">
            {topRequested.map((b, i) => (
              <div key={b.title} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#0a5c46] truncate">{b.title}</p>
                  <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#008854] rounded-full"
                      style={{ width: `${(b.requests / 20) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">{b.requests}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Manage Inventory */}
      <motion.div {...fadeUp(0.15)} className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-[#0a5c46] mb-4">Manage Inventory</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left pb-3 font-medium">Title</th>
                <th className="text-left pb-3 font-medium">Author</th>
                <th className="text-left pb-3 font-medium">Category</th>
                <th className="text-left pb-3 font-medium">Fee</th>
                <th className="text-left pb-3 font-medium">Status</th>
                <th className="text-left pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {books.map((b) => (
                <tr key={b.id} className="text-gray-600">
                  <td className="py-3 font-medium text-[#0a5c46]">{b.title}</td>
                  <td className="py-3 text-gray-500">{b.author}</td>
                  <td className="py-3 text-gray-500">{b.category}</td>
                  <td className="py-3">৳{b.deliveryFee}</td>
                  <td className="py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor(b.status)}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      {/* Toggle publish — only if not Pending Approval */}
                      {b.status !== "Pending Approval" && (
                        <button
                          onClick={() => handleTogglePublish(b.id)}
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
                        onClick={() => handleDeleteBook(b.id)}
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
      </motion.div>

      {/* Manage Deliveries */}
      <motion.div {...fadeUp(0.2)} className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-[#0a5c46] mb-4">Manage Deliveries</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left pb-3 font-medium">Client</th>
                <th className="text-left pb-3 font-medium">Book</th>
                <th className="text-left pb-3 font-medium">Date</th>
                <th className="text-left pb-3 font-medium">Status</th>
                <th className="text-left pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {deliveries.map((d) => (
                <tr key={d.id} className="text-gray-600">
                  <td className="py-3 font-medium text-[#0a5c46]">{d.client}</td>
                  <td className="py-3 text-gray-500">{d.book}</td>
                  <td className="py-3 text-gray-400">{d.date}</td>
                  <td className="py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${deliveryStatusColor(d.status)}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="py-3">
                    {deliveryStatusNext[d.status] ? (
                      <button
                        onClick={() => handleAdvanceDelivery(d.id)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-[#008854]/10 text-[#008854] hover:bg-[#008854]/20 font-medium transition"
                      >
                        Mark {deliveryStatusNext[d.status]}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-300">Done</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Add Book Modal */}
      <AnimatePresence>
        {showAddBook && <AddBookModal onClose={() => setShowAddBook(false)} />}
      </AnimatePresence>
    </div>
  );
}