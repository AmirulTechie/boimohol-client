/* eslint-disable react/no-unescaped-entities */
import { ChevronDown, Upload, X } from "lucide-react";
import Image from "next/image";
import { CreateBook} from "@/lib/actions/books";
import { motion } from "motion/react";
import { useSession } from "@/lib/auth-client";
import { useState } from "react";
import toast from "react-hot-toast";
const IMGBB_API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
 export default function AddBookModal({ onClose, onAdded }) {
  const { data: session } = useSession();
  const [form, setForm] = useState({
    title: "", author: "", description: "", category: "", deliveryFee: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const categories = ["Fiction", "Non-Fiction", "Self-Help", "Productivity", "Science", "History", "Biography", "Religion", "Children", "Other"];
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error("Image too large (max 10MB)"); return; }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) { toast.error("Please upload a cover image."); return; }

    // Guard: session must be ready
    if (!session?.user?.id) { toast.error("Session not ready. Please try again."); return; }

    setUploading(true);
    try {
      // Upload cover image to imgbb
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
        librarianId: session.user.id,
        librarianName: session.user.name,
        createdAt: new Date().toISOString(),
      };

      // CreateBook throws on failure — no need to check a return value
      await CreateBook(bookData);
      toast.success("Book submitted for approval.");
      onAdded();
      onClose();
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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
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
            { name: "deliveryFee", label: "Delivery Fee ($)", type: "number", placeholder: "60" },
          ].map((field) => (
            <div key={field.name}>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">{field.label}</label>
              <input
                name={field.name} type={field.type} placeholder={field.placeholder}
                value={form[field.name]} onChange={handleChange} required
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#008854] transition"
              />
            </div>
          ))}

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">Category</label>
            <div className="relative">
              <select name="category" value={form.category} onChange={handleChange} required
                className="w-full appearance-none px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#008854] transition bg-white">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
              placeholder="Brief description of the book..."
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#008854] transition resize-none" />
          </div>

          <p className="text-xs text-gray-400">
            Book will be submitted as <span className="font-medium text-yellow-600">Pending Approval</span> and won't appear publicly until approved by an admin.
          </p>

          <button type="submit" disabled={uploading}
            className="w-full bg-[#008854] hover:bg-[#0a5c46] disabled:opacity-50 text-white text-sm font-medium py-3 rounded-xl transition">
            {uploading ? "Uploading..." : "Submit Book"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}