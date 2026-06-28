"use client";
import { useState, useEffect, useMemo } from "react";
import { motion } from "motion/react";
import { BadgeDollarSign } from "lucide-react";
import toast from "react-hot-toast";
import { GetAllDeliveries } from "@/lib/actions/deliveries";

const normalize = (id) => {
  if (!id) return "";
  if (typeof id === "object" && id.$oid) return id.$oid;
  return id.toString();
};

export default function AdminTransactions() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    GetAllDeliveries()
      .then(setDeliveries)
      .catch(() => toast.error("Failed to load transactions."))
      .finally(() => setLoading(false));
  }, []);

  const total = useMemo(
    () => deliveries.reduce((sum, d) => sum + (d.deliveryFee || 0), 0),
    [deliveries]
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-[#0a5c46] text-sm animate-pulse">Loading transactions...</p>
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
        <h1 className="text-xl font-bold text-[#0a5c46]">All Transactions</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {deliveries.length} transactions · Total{" "}
          <span className="text-[#008854] font-semibold">৳{total.toFixed(2)}</span>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <BadgeDollarSign size={16} className="text-[#008854]" />
          <h2 className="text-sm font-semibold text-[#0a5c46]">Transaction Log</h2>
        </div>

        {deliveries.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No transactions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  {["Transaction ID", "Book", "User", "Amount", "Status", "Date"].map((h) => (
                    <th key={h} className="text-left pb-3 font-medium pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {deliveries.map((d) => {
                  const id = normalize(d._id);
                  const shortId = id.slice(-8).toUpperCase();
                  const date = d.createdAt
                    ? new Date(d.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "short", year: "numeric",
                      })
                    : "—";

                  const statusColors = {
                    Pending:    "bg-yellow-100 text-yellow-700",
                    Dispatched: "bg-blue-100 text-blue-700",
                    Delivered:  "bg-green-100 text-green-700",
                  };

                  return (
                    <tr key={id} className="text-gray-600">
                      <td className="py-3 pr-4 font-mono text-xs text-gray-400">
                        #{shortId}
                      </td>
                      <td className="py-3 pr-4 text-gray-700 font-medium max-w-40 truncate">
                        {d.bookTitle || "—"}
                      </td>
                      <td className="py-3 pr-4 text-gray-500 text-xs">
                        <div>{d.userName || "—"}</div>
                        <div className="text-gray-400">{d.userEmail || ""}</div>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-[#008854]">
                        ৳{d.deliveryFee ?? "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                          statusColors[d.status] || "bg-gray-100 text-gray-500"
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="py-3 text-gray-400 text-xs whitespace-nowrap">{date}</td>
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