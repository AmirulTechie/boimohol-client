"use client";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Trash2, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import { GetAllUsers } from "@/lib/actions/users";
import { UpdateUserRole, DeleteUser } from "@/lib/actions/admin";

const ROLES = ["user", "librarian", "admin"];

const normalize = (id) => {
  if (!id) return "";
  if (typeof id === "object" && id.$oid) return id.$oid;
  return id.toString();
};

function RoleBadge({ role }) {
  const map = {
    admin:     "bg-purple-100 text-purple-700",
    librarian: "bg-blue-100 text-blue-700",
    user:      "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${map[role] ?? "bg-gray-100 text-gray-500"}`}>
      {role}
    </span>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetAllUsers()
      .then(setUsers)
      .catch(() => toast.error("Failed to load users."))
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      await UpdateUserRole(userId, role);
      setUsers((prev) => prev.map((u) => normalize(u._id) === userId ? { ...u, role } : u));
      toast.success(`Role updated to ${role}.`);
    } catch { toast.error("Failed to update role."); }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await DeleteUser(userId);
      setUsers((prev) => prev.filter((u) => normalize(u._id) !== userId));
      toast.success("User deleted.");
    } catch { toast.error("Failed to delete user."); }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-[#0a5c46] text-sm animate-pulse">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-xl font-bold text-[#0a5c46]">Manage Users</h1>
        <p className="text-sm text-gray-500 mt-0.5">{users.length} registered users.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                {["User", "Email", "Role", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left pb-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => {
                const id = normalize(u._id);
                return (
                  <tr key={id} className="text-gray-600">
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {u.image ? (
                          <Image
                            src={u.image} alt={u.name}
                            width={28} height={28}
                            className="rounded-full w-7 h-7 object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#008854]/10 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-[#008854]">
                              {u.name?.[0]?.toUpperCase() ?? "?"}
                            </span>
                          </div>
                        )}
                        <span className="font-medium text-[#0a5c46] truncate max-w-[100px]">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-gray-500 truncate max-w-[180px]">{u.email}</td>
                    <td className="py-3"><RoleBadge role={u.role ?? "user"} /></td>
                    <td className="py-3 text-gray-400 text-xs">
                      {u.createdAt
                        ? new Date(u.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                        : "—"}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <select
                            defaultValue={u.role ?? "user"}
                            onChange={(e) => handleRoleChange(id, e.target.value)}
                            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 focus:outline-none focus:border-[#008854] transition appearance-none pr-6 cursor-pointer"
                          >
                            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                          <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                        <button
                          onClick={() => handleDeleteUser(id)}
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