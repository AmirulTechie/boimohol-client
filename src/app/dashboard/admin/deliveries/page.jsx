"use client";
import { motion } from "motion/react";
import { BadgeDollarSign } from "lucide-react";

const DUMMY_TRANSACTIONS = [
  { id: "TXN-001", userEmail: "reader@gmail.com",  librarianEmail: "lib@boimohol.com", amount: 60,  date: "2026-06-01" },
  { id: "TXN-002", userEmail: "meghna@gmail.com",  librarianEmail: "lib@boimohol.com", amount: 70,  date: "2026-06-05" },
  { id: "TXN-003", userEmail: "rafiq@gmail.com",   librarianEmail: "ali@boimohol.com", amount: 65,  date: "2026-06-10" },
  { id: "TXN-004", userEmail: "nadia@gmail.com",   librarianEmail: "ali@boimohol.com", amount: 80,  date: "2026-06-14" },
  { id: "TXN-005", userEmail: "karim@gmail.com",   librarianEmail: "lib@boimohol.com", amount: 55,  date: "2026-06-18" },
];

export default function AdminDeliveries() {
  const total = DUMMY_TRANSACTIONS.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-xl font-bold text-[#0a5c46]">All Transactions</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {DUMMY_TRANSACTIONS.length} transactions · Total{" "}
          <span className="text-[#008854] font-semibold">৳{total}</span>
        </p>
      </motion.div>

      <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-100 px-4 py-2.5 rounded-xl">
        Demo data — payment integration pending.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
        className="bg-white rounded-2xl p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <BadgeDollarSign size={16} className="text-[#008854]" />
          <h2 className="text-sm font-semibold text-[#0a5c46]">Transaction Log</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                {["Transaction ID", "User", "Librarian", "Amount", "Date"].map((h) => (
                  <th key={h} className="text-left pb-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {DUMMY_TRANSACTIONS.map((t) => (
                <tr key={t.id} className="text-gray-600">
                  <td className="py-3 font-mono text-xs text-gray-400">{t.id}</td>
                  <td className="py-3 text-gray-500">{t.userEmail}</td>
                  <td className="py-3 text-gray-500">{t.librarianEmail}</td>
                  <td className="py-3 font-semibold text-[#008854]">৳{t.amount}</td>
                  <td className="py-3 text-gray-400">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}