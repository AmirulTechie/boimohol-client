"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { FiArrowRight } from "react-icons/fi";
import { PiBookOpenTextLight } from "react-icons/pi";
import { HiOutlineBookOpen } from "react-icons/hi";
import { LuBookMarked, LuTruck, LuStar } from "react-icons/lu";

const floatingBooks = [
  { icon: HiOutlineBookOpen, x: "8%", y: "20%", size: 28, delay: 0, rotate: -15 },
  { icon: LuBookMarked, x: "88%", y: "15%", size: 22, delay: 0.4, rotate: 12 },
  { icon: PiBookOpenTextLight, x: "5%", y: "65%", size: 32, delay: 0.8, rotate: -8 },
  { icon: HiOutlineBookOpen, x: "91%", y: "60%", size: 24, delay: 0.2, rotate: 18 },
  { icon: LuBookMarked, x: "80%", y: "78%", size: 20, delay: 1, rotate: -20 },
  { icon: LuStar, x: "15%", y: "80%", size: 16, delay: 0.6, rotate: 0 },
  { icon: LuStar, x: "85%", y: "38%", size: 14, delay: 1.2, rotate: 0 },
];

const stats = [
  { label: "Books Available", value: "2,000+" },
  { label: "Happy Readers", value: "500+" },
  { label: "Categories", value: "6" },
  { label: "Delivery Cities", value: "12" },
];

export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-[#0a5c46] via-[#008854] to-[#0d7a4e] min-h-[88vh] flex items-center">

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Soft glow blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full bg-[#0F6E56] opacity-30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-60px] w-[350px] h-[350px] rounded-full bg-[#0a5c46] opacity-40 blur-3xl pointer-events-none" />

      {/* Floating icons */}
      {floatingBooks.map(({ icon: Icon, x, y, size, delay, rotate }, i) => (
        <motion.div
          key={i}
          className="absolute text-white/20 pointer-events-none"
          style={{ left: x, top: y, rotate }}
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3.5 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay }}
        >
          <Icon size={size} />
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 py-20 flex flex-col items-center text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-medium px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm"
        >
          <LuTruck size={13} />
          Fast delivery to your doorstep
        </motion.div>

        {/* Tagline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight max-w-3xl font-dance"
        >
          Your Local Library,{" "}
          <span className="relative inline-block">
            <span className="relative z-10">Delivered</span>
            <motion.span
              className="absolute bottom-1 left-0 h-[6px] w-full bg-white/25 rounded-full -z-0"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
              style={{ transformOrigin: "left" }}
            />
          </span>
        </motion.h1>

        {/* Sub-copy */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="mt-5 text-white/75 text-base sm:text-lg max-w-xl leading-relaxed"
        >
          Discover thousands of books across every genre. Order online and get them delivered straight to your door — no membership card needed.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 bg-white text-[#0F6E56] font-semibold text-sm px-6 py-3 rounded-xl hover:bg-green-50 transition-colors shadow-lg shadow-black/10"
          >
            Browse Books
            <FiArrowRight size={16} />
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-white/10 border border-white/25 text-white font-medium text-sm px-6 py-3 rounded-xl hover:bg-white/20 transition-colors backdrop-blur-sm"
          >
            Get started free
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden border border-white/10 w-full max-w-2xl"
        >
          {stats.map(({ label, value }) => (
            <div key={label} className="flex flex-col items-center py-5 px-4 bg-white/5 backdrop-blur-sm">
              <span className="text-2xl font-bold text-white">{value}</span>
              <span className="text-xs text-white/60 mt-1">{label}</span>
            </div>
          ))}
        </motion.div>

      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" className="w-full block">
          <path d="M0,32 C360,56 1080,0 1440,32 L1440,56 L0,56 Z" fill="white" fillOpacity="0.04" />
          <path d="M0,44 C480,20 960,56 1440,44 L1440,56 L0,56 Z" fill="white" fillOpacity="0.06" />
        </svg>
      </div>

    </section>
  );
}