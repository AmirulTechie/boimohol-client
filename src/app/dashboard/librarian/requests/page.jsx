/* eslint-disable react-hooks/static-components */
"use client";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSession } from "@/lib/auth-client";
import { Truck, Clock, PackageCheck, ChevronRight, PackageSearch } from "lucide-react";
import {
  GetDeliveriesByLibrarian,
  UpdateDeliveryStatus,
} from "@/lib/actions/deliveries.js";
import Image from "next/image";

// ── Helpers ───────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

const STATUS_FLOW = ["Pending", "Dispatched", "Delivered"];

const STATUS_META = {
  Pending:    { classes: "bg-yellow-100 text-yellow-700", icon: Clock },
  Dispatched: { classes: "bg-blue-100 text-blue-700",    icon: Truck },
  Delivered:  { classes: "bg-green-100 text-green-700",  icon: PackageCheck },
};

function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.Pending;
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${meta.classes}`}>
      <Icon size={11} />
      {status}
    </span>
  );
}

function nextStatus(current) {
  const idx = STATUS_FLOW.indexOf(current);
  return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null;
}

// ── Stat card ─────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, delay }) {
  return (
    <motion.div {...fadeUp(delay)} className="bg-white rounded-2xl p-5 flex items-center gap-4 shadow-sm">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-[#0a5c46]">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </motion.div>
  );
}

// ── Empty state ───────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#008854]/10 flex items-center justify-center mb-4">
        <PackageSearch size={28} className="text-[#008854]" />
      </div>
      <p className="text-sm font-semibold text-[#0a5c46]">No deliveries assigned</p>
      <p className="text-xs text-gray-400 mt-1">
        Deliveries assigned to you will appear here.
      </p>
    </div>
  );
}

// ── Filter tab ────────────────────────────────────────────

function FilterTabs({ active, onChange, counts }) {
  const tabs = ["All", ...STATUS_FLOW];
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`text-xs font-medium px-3 py-1.5 rounded-full transition ${
            active === tab
              ? "bg-[#008854] text-white"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
          }`}
        >
          {tab}
          <span className={`ml-1.5 ${active === tab ? "text-white/70" : "text-gray-400"}`}>
            {counts[tab] ?? 0}
          </span>
        </button>
      ))}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────

export default function LibrarianDeliveriesPage() {
  const { data: session } = useSession();
  const librarianId = session?.user?.id;

  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [filter, setFilter]         = useState("All");
  const [updating, setUpdating]     = useState(null); // id of row being updated

  useEffect(() => {
    if (!librarianId) return;
    GetDeliveriesByLibrarian(librarianId)
      .then(setDeliveries)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [librarianId]);

  // ── Counts for filter tabs
  const counts = useMemo(() => {
    const c = { All: deliveries.length };
    STATUS_FLOW.forEach((s) => {
      c[s] = deliveries.filter((d) => d.status === s).length;
    });
    return c;
  }, [deliveries]);

  // ── Filtered list
  const filtered = useMemo(() =>
    filter === "All"
      ? deliveries
      : deliveries.filter((d) => d.status === filter),
    [deliveries, filter]
  );

  // ── Status update
  const handleAdvance = async (delivery) => {
    const next = nextStatus(delivery.status);
    if (!next) return;
    setUpdating(delivery._id);
    try {
      await UpdateDeliveryStatus(delivery._id, next);
      setDeliveries((prev) =>
        prev.map((d) => d._id === delivery._id ? { ...d, status: next } : d)
      );
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  };

  // ── Skeleton
  const Skeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
      ))}
    </div>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

      {/* Heading */}
      <motion.div {...fadeUp(0)}>
        <h1 className="text-xl font-bold text-[#0a5c46]">Manage Deliveries</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Advance delivery status from Pending through to Delivered.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Pending"
          value={loading ? "—" : counts.Pending}
          icon={Clock}
          color="bg-yellow-100 text-yellow-700"
          delay={0.05}
        />
        <StatCard
          label="Dispatched"
          value={loading ? "—" : counts.Dispatched}
          icon={Truck}
          color="bg-blue-100 text-blue-700"
          delay={0.1}
        />
        <StatCard
          label="Delivered"
          value={loading ? "—" : counts.Delivered}
          icon={PackageCheck}
          color="bg-green-100 text-green-700"
          delay={0.15}
        />
      </div>

      {/* Table card */}
      <motion.div {...fadeUp(0.2)} className="bg-white rounded-2xl p-6 shadow-sm">

        {/* Filter tabs */}
        {!loading && !error && deliveries.length > 0 && (
          <div className="mb-5">
            <FilterTabs active={filter} onChange={setFilter} counts={counts} />
          </div>
        )}

        {loading ? (
          <Skeleton />
        ) : error ? (
          <p className="text-sm text-red-500 py-6 text-center">{error}</p>
        ) : deliveries.length === 0 ? (
          <EmptyState />
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 py-10 text-center">
            No {filter.toLowerCase()} deliveries.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-3 font-medium">#</th>
                  <th className="text-left pb-3 font-medium">Client</th>
                  <th className="text-left pb-3 font-medium">Book</th>
                  <th className="text-left pb-3 font-medium">Requested</th>
                  <th className="text-left pb-3 font-medium">Status</th>
                  <th className="text-left pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence mode="popLayout">
                  {filtered.map((d, i) => {
                    const next       = nextStatus(d.status);
                    const isUpdating = updating === d._id;

                    return (
                      <motion.tr
                        key={d._id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-gray-600"
                      >
                        <td className="py-3 text-gray-400 text-xs">{i + 1}</td>

                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            {d.userImage ? (
                              <Image
                                src={d.userImage}
                                alt={d.userName}
                                width={28}
                                height={28}
                                className="w-7 h-7 rounded-full object-cover shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-[#008854]/10 flex items-center justify-center shrink-0 text-[10px] font-bold text-[#008854]">
                                {d.userName?.charAt(0)?.toUpperCase() ?? "?"}
                              </div>
                            )}
                            <span className="font-medium text-[#0a5c46] text-xs">
                              {d.userName ?? "—"}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 font-medium text-[#0a5c46]">
                          {d.bookTitle ?? d.title ?? "—"}
                        </td>

                        <td className="py-3 text-gray-400 text-xs">
                          {d.createdAt
                            ? new Date(d.createdAt).toLocaleDateString("en-GB", {
                                day: "2-digit", month: "short", year: "numeric",
                              })
                            : "—"}
                        </td>

                        <td className="py-3">
                          <StatusBadge status={d.status} />
                        </td>

                        <td className="py-3">
                          {next ? (
                            <button
                              onClick={() => handleAdvance(d)}
                              disabled={isUpdating}
                              className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-[#008854]/10 text-[#008854] hover:bg-[#008854] hover:text-white transition disabled:opacity-50"
                            >
                              {isUpdating ? "Updating..." : (
                                <>
                                  Mark {next}
                                  <ChevronRight size={12} />
                                </>
                              )}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-300 font-medium">Completed</span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}