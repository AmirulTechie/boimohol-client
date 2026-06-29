"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Telescope, Brain, BookMarked, Landmark, Rocket, HeartHandshake } from "lucide-react";

const categories = [
  { name: "Fiction", icon: BookMarked, count: "120+ Books", color: "bg-blue-50 text-blue-600" },
  { name: "Science", icon: Telescope, count: "85+ Books", color: "bg-purple-50 text-purple-600" },
  { name: "Academic", icon: Brain, count: "200+ Books", color: "bg-amber-50 text-amber-600" },
  { name: "History", icon: Landmark, count: "64+ Books", color: "bg-orange-50 text-orange-600" },
  { name: "Sci-Fi", icon: Rocket, count: "92+ Books", color: "bg-indigo-50 text-indigo-600" },
  { name: "Self-Help", icon: HeartHandshake, count: "115+ Books", color: "bg-rose-50 text-rose-600" },
];

export default function PopularCategories() {
  return (
    <section className="py-20 ">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Popular Categories</h2>
            <p className="text-slate-600 max-w-xl">
              Explore our vast collection of books tailored to your unique reading preferences.
            </p>
          </div>
          <Link href="/browse" className="text-[#008854] font-medium hover:underline mt-4 md:mt-0">
            View All Categories &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, index) => {
            const Icon = cat.icon;
            return (
              <Link key={cat.name} href={`/browse?category=${cat.name.toLowerCase()}`}>
                <motion.div
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-slate-50 border border-slate-100 rounded-xl p-6 flex flex-col items-center text-center cursor-pointer hover:border-[#008854] hover:shadow-md transition-all h-full"
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${cat.color}`}>
                    <Icon size={28} />
                  </div>
                  <h3 className="font-bold text-slate-800 mb-1">{cat.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{cat.count}</p>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}