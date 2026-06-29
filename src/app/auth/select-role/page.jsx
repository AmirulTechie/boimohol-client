"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { BookOpen, BookMarked, CheckCircle2 } from "lucide-react";
import { authClient, useSession } from "@/lib/auth-client";
import toast from "react-hot-toast";

const roles = [
  {
    value: "user",
    title: "Reader",
    icon: BookOpen,
    description: "Browse the catalog, request book deliveries, and track your orders.",
    perks: ["Browse all books", "Request deliveries", "Track orders", "Leave reviews"],
  },
  {
    value: "librarian",
    title: "Librarian",
    icon: BookMarked,
    description: "Manage the book catalog, handle delivery requests, and oversee the collection.",
    perks: ["Add & manage books", "Approve requests", "Update delivery status", "Manage inventory"],
  },
];

export default function SelectRolePage() {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, isPending } = useSession();
  useEffect(() => {
  if (isPending) return;

  // Not logged in
  if (!session) {
    router.replace("/auth/login");
    return;
  }

  // User already completed onboarding
  if (session.user.role === "user" || session.user.role === "librarian") {
    router.replace("/");
  }
}, [session, isPending, router]);
  const handleConfirm = async () => {
  if (!selected) return;

  setLoading(true);

  try {
    const { error } = await authClient.updateUser({
      role: selected,
    });

    if (error) {
      toast.error(error.message || "Failed to set role.");
      return;
    }

    toast.success("Welcome to Boimohol!");

    router.replace("/");
  } catch (err) {
    toast.error("Something went wrong.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <BookOpen size={24} className="text-[#008854]" />
            <span className="font-dance text-xl text-[#008854] font-bold">Boimohol</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0a5c46] mb-2">How will you use Boimohol?</h1>
          <p className="text-sm text-gray-500">Pick your role. You can contact support to change it later.</p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {roles.map((role, i) => {
            const Icon = role.icon;
            const isSelected = selected === role.value;
            return (
              <motion.button
                key={role.value}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(role.value)}
                className={`relative text-left rounded-2xl border-2 p-6 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "border-[#008854] bg-[#008854]/5 shadow-md"
                    : "border-gray-200 bg-white hover:border-[#008854]/40 hover:shadow-sm"
                }`}
              >
                {/* Selected check */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4"
                  >
                    <CheckCircle2 size={20} className="text-[#008854]" />
                  </motion.div>
                )}

                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${isSelected ? "bg-[#008854]" : "bg-gray-100"}`}>
                  <Icon size={20} className={isSelected ? "text-white" : "text-gray-500"} />
                </div>

                <h3 className="font-bold text-[#0a5c46] text-base mb-1">{role.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">{role.description}</p>

                <ul className="space-y-1.5">
                  {role.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-xs text-gray-600">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? "bg-[#008854]" : "bg-gray-300"}`} />
                      {perk}
                    </li>
                  ))}
                </ul>
              </motion.button>
            );
          })}
        </div>

        {/* Confirm button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleConfirm}
          disabled={!selected || loading}
          className="w-full bg-[#008854] hover:bg-[#0a5c46] disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl text-sm transition"
        >
          {loading ? "Saving..." : selected ? `Continue as ${roles.find(r => r.value === selected)?.title}` : "Select a role to continue"}
        </motion.button>
      </motion.div>
    </div>
  );
}