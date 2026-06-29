"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { GetMe, UpdateMe } from "@/lib/actions/users";
import { User, Camera, Link as LinkIcon, Upload, ShieldCheck, BookOpen, Users } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

const ROLE_META = {
  admin: {
    label: "Admin",
    icon: ShieldCheck,
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-700",
  },
  librarian: {
    label: "Librarian",
    icon: BookOpen,
    color: "text-[#008854]",
    bg: "bg-[#008854]/5",
    border: "border-[#008854]/20",
    badge: "bg-[#008854]/10 text-[#008854]",
  },
  user: {
    label: "Member",
    icon: Users,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
  },
};

const IMGBB_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

export default function AccountPage() {
  const { data: session } = useSession();
  const role = session?.user?.role || "user";
  const meta = ROLE_META[role] || ROLE_META.user;
  const RoleIcon = meta.icon;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkInput, setLinkInput] = useState("");
  const [preview, setPreview] = useState("");
  const [activeMethod, setActiveMethod] = useState(null); // "link" | "upload"

  const fileRef = useRef(null);

  useEffect(() => {
    GetMe()
      .then((data) => {
        setUser(data);
        setName(data.name || "");
        setImageUrl(data.image || "");
        setPreview(data.image || "");
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  // Upload file to imgbb
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("image", file);
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`, {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!data.success) throw new Error("Upload failed");
      const url = data.data.url;
      setImageUrl(url);
      setPreview(url);
      setActiveMethod("upload");
      toast.success("Image uploaded");
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Handle link input
  const handleLinkChange = (e) => {
    const val = e.target.value;
    setLinkInput(val);
    if (val.trim()) {
      setActiveMethod("link");
      setImageUrl(val.trim());
      setPreview(val.trim());
    } else {
      setActiveMethod(null);
      setImageUrl(user?.image || "");
      setPreview(user?.image || "");
    }
  };

  const clearAvatar = () => {
    setLinkInput("");
    setImageUrl("");
    setPreview("");
    setActiveMethod(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Name can't be empty");
    setSaving(true);
    try {
      await UpdateMe({ name: name.trim(), image: imageUrl });
      toast.success("Profile updated!");
      setUser((prev) => ({ ...prev, name: name.trim(), image: imageUrl }));
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#008854] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Account</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your profile information</p>
      </div>

      {/* Profile Card */}
      <div className={`rounded-2xl border ${meta.border} ${meta.bg} p-6 flex items-center gap-5`}>
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-white shadow-md">
            {preview ? (
              <Image
                src={preview}
                alt={name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                onError={() => setPreview("")}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <User size={32} className="text-gray-400" />
              </div>
            )}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${meta.badge} border border-white`}>
            <RoleIcon size={12} />
          </div>
        </div>

        {/* Info */}
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-gray-800 truncate">{user?.name}</h2>
          <p className="text-sm text-gray-500 truncate">{user?.email}</p>
          <span className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold px-2.5 py-1 rounded-full ${meta.badge}`}>
            <RoleIcon size={11} />
            {meta.label}
          </span>
        </div>

        {/* Joined */}
        <div className="ml-auto text-right shrink-0 hidden sm:block">
          <p className="text-xs text-gray-400">Member since</p>
          <p className="text-sm font-medium text-gray-600">
            {new Date(user?.createdAt).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Edit Profile</h3>

        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-[#008854] transition-colors"
            placeholder="Your name"
          />
        </div>

        {/* Avatar section */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Avatar</label>

          {/* Current preview */}
          {preview && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <Image
                src={preview}
                alt="preview"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                onError={() => setPreview("")}
              />
              <p className="text-xs text-gray-500 flex-1 truncate">Preview</p>
              <button
                onClick={clearAvatar}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          )}

          {/* Option 1 — Paste link */}
          <div className={`rounded-xl border p-4 space-y-2 transition-colors ${activeMethod === "upload" ? "opacity-40 pointer-events-none" : "border-gray-200"}`}>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
              <LinkIcon size={13} />
              Paste image URL
            </div>
            <input
              type="url"
              value={linkInput}
              onChange={handleLinkChange}
              placeholder="https://i.ibb.co/your-image.jpg"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 outline-none focus:border-[#008854] transition-colors"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Option 2 — Upload from PC */}
          <div className={`rounded-xl border p-4 space-y-2 transition-colors ${activeMethod === "link" ? "opacity-40 pointer-events-none" : "border-gray-200"}`}>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
              <Upload size={13} />
              Upload from PC
            </div>
            <label className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border-2 border-dashed text-sm font-medium transition-colors cursor-pointer ${uploading ? "border-gray-200 text-gray-400" : "border-[#008854]/30 text-[#008854] hover:border-[#008854] hover:bg-[#008854]/5"}`}>
              <Camera size={15} />
              {uploading ? "Uploading..." : "Choose image"}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 rounded-xl bg-[#008854] text-white text-sm font-semibold hover:bg-[#006e43] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Read-only info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Account Info</h3>
        <div className="space-y-3">
          {[
            { label: "Email", value: user?.email },
            { label: "Role", value: meta.label },
            { label: "Email Verified", value: user?.emailVerified ? "Yes" : "No" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <span className="text-xs text-gray-400 font-medium">{label}</span>
              <span className="text-sm text-gray-700 font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}