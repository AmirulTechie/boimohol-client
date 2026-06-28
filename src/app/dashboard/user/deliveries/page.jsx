"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useSession } from "@/lib/auth-client";
import { GetDeliveriesByUser } from "@/lib/actions/deliveries.js";
import { Truck, PackageCheck, Clock, PackageSearch } from "lucide-react";

// ── Helpers ──────────────────────────────────────────────
const statusMeta = {
  Delivered: {
    label: "Delivered",
    classes: "bg-green-100 text-green-700",
    icon: PackageCheck,
  },
  Dispatched: {
    label: "Dispatched",
    classes: "bg-blue-100 text-blue-700",
    icon: Truck,
  },
  Pending: {
    label: "Pending",
    classes: "bg-yellow-100 text-yellow-700",
    icon: Clock,
  },
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

// ── Summary stat card ─────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, delay }) {
  return (
    <motion.div
      {...fadeUp(delay)}
      className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm"
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}
      >
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-[#0a5c46]">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </motion.div>
  );
}

// ── Status badge ──────────────────────────────────────────
function StatusBadge({ status }) {
  const meta = statusMeta[status] ?? statusMeta.Pending;
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${meta.classes}`}
    >
      <Icon size={11} />
      {meta.label}
    </span>
  );
}

// ── Empty state ───────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#008854]/10 flex items-center justify-center mb-4">
        <PackageSearch size={28} className="text-[#008854]" />
      </div>
      <p className="text-sm font-semibold text-[#0a5c46]">No deliveries yet</p>
      <p className="text-xs text-gray-400 mt-1">
        Request a book to get started — your deliveries will appear here.
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────
export default function DeliveriesPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    GetDeliveriesByUser(userId)
      .then(setDeliveries)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  // Derived stats
  const total = deliveries.length;
  const pending = deliveries.filter((d) => d.status === "Pending").length;
  const dispatched = deliveries.filter((d) => d.status === "Dispatched").length;
  const delivered = deliveries.filter((d) => d.status === "Delivered").length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Heading */}
      <motion.div {...fadeUp(0)}>
        <h1 className="text-xl font-bold text-[#0a5c46]">My Deliveries</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Track every book request from dispatch to your door.
        </p>
      </motion.div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Total Requests"
          value={loading ? "—" : total}
          icon={PackageSearch}
          color="bg-[#008854]/10 text-[#008854]"
          delay={0.05}
        />
        <StatCard
          label="Pending"
          value={loading ? "—" : pending}
          icon={Clock}
          color="bg-yellow-100 text-yellow-700"
          delay={0.1}
        />
        <StatCard
          label="Dispatched"
          value={loading ? "—" : dispatched}
          icon={Truck}
          color="bg-blue-100 text-blue-700"
          delay={0.15}
        />
        <StatCard
          label="Delivered"
          value={loading ? "—" : delivered}
          icon={PackageCheck}
          color="bg-green-100 text-green-700"
          delay={0.2}
        />
      </div>

      {/* Table card */}
      <motion.div {...fadeUp(0.25)} className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-[#0a5c46] mb-4">Delivery History</h2>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-10 rounded-xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-red-500 py-6 text-center">{error}</p>
        ) : deliveries.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-3 font-medium">#</th>
                  <th className="text-left pb-3 font-medium">Book</th>
                  <th className="text-left pb-3 font-medium">Delivery Fee</th>
                  <th className="text-left pb-3 font-medium">Requested</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {deliveries.map((d, i) => (
                  <tr key={d._id} className="text-gray-600">
                    <td className="py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="py-3 font-medium text-[#0a5c46]">
                      {d.bookTitle ?? d.title ?? "—"}
                    </td>
                    <td className="py-3">
                      {d.deliveryFee != null ? `৳${d.deliveryFee}` : "—"}
                    </td>
                    <td className="py-3 text-gray-400 text-xs">
                      {d.createdAt
                        ? new Date(d.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={d.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}