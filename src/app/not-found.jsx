"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden"
      style={{ backgroundColor: "#f5f0e8" }}
    >
      {/* Ambient floating blobs */}
      <motion.div
        className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full opacity-10 pointer-events-none"
        style={{ backgroundColor: "#1a5c3f" }}
        animate={{ scale: [1, 1.12, 1], x: [0, 15, 0], y: [0, 10, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-60px] right-[-60px] w-56 h-56 rounded-full opacity-10 pointer-events-none"
        style={{ backgroundColor: "#2d8c62" }}
        animate={{ scale: [1, 1.08, 1], x: [0, -10, 0], y: [0, -12, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Book SVG — floats gently */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg
            width="240"
            height="170"
            viewBox="0 0 240 170"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Drop shadow */}
            <ellipse cx="112" cy="155" rx="75" ry="7" fill="#c8bfa8" opacity="0.45" />

            {/* Book spine */}
            <rect x="106" y="18" width="12" height="128" rx="3" fill="#14472f" />

            {/* Left page */}
            <path
              d="M106 24 Q64 30 32 42 L32 140 Q64 128 106 134 Z"
              fill="#ffffff"
              stroke="#d6cfc0"
              strokeWidth="1.5"
            />
            {/* Left page ruled lines */}
            <line x1="50" y1="70" x2="94" y2="67" stroke="#e0d8cc" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="48" y1="83" x2="93" y2="80" stroke="#e0d8cc" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="49" y1="96" x2="93" y2="93" stroke="#e0d8cc" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="50" y1="109" x2="92" y2="106" stroke="#e0d8cc" strokeWidth="1.4" strokeLinecap="round" />
            {/* Left "4" */}
            <text
              x="52"
              y="63"
              fontFamily="Georgia, serif"
              fontSize="30"
              fontWeight="bold"
              fill="#1a5c3f"
              opacity="0.9"
            >
              4
            </text>

            {/* Right page */}
            <path
              d="M118 24 Q158 30 192 42 L192 140 Q158 128 118 134 Z"
              fill="#ffffff"
              stroke="#d6cfc0"
              strokeWidth="1.5"
            />
            {/* Right page ruled lines */}
            <line x1="128" y1="70" x2="174" y2="67" stroke="#e0d8cc" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="128" y1="83" x2="176" y2="80" stroke="#e0d8cc" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="128" y1="96" x2="176" y2="93" stroke="#e0d8cc" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="128" y1="109" x2="174" y2="106" stroke="#e0d8cc" strokeWidth="1.4" strokeLinecap="round" />
            {/* Right "04" */}
            <text
              x="126"
              y="63"
              fontFamily="Georgia, serif"
              fontSize="30"
              fontWeight="bold"
              fill="#1a5c3f"
              opacity="0.9"
            >
              04
            </text>

            {/* Bookmark left */}
            <motion.polygon
              points="76,18 86,18 86,44 81,39 76,44"
              fill="#2d8c62"
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
            {/* Bookmark right */}
            <motion.polygon
              points="140,18 150,18 150,44 145,39 140,44"
              fill="#2d8c62"
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* Text block */}
      <motion.div
        className="flex flex-col items-center text-center mt-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
      >
        <h1
          className="text-7xl sm:text-8xl font-bold tracking-tight leading-none mb-3"
          style={{ color: "#1a5c3f", fontFamily: "Georgia, serif" }}
        >
          404
        </h1>

        <p
          className="text-xl sm:text-2xl font-semibold mb-3"
          style={{ color: "#1a1a1a", fontFamily: "Georgia, serif" }}
        >
          This Page Has Gone Off the Shelf
        </p>

        <p
          className="text-base sm:text-lg max-w-sm leading-relaxed mb-10"
          style={{ color: "#5a5a5a" }}
        >
          Looks like this page was borrowed and never returned. Let&apos;s
          get you back to the main collection.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md text-white font-semibold text-sm transition-opacity hover:opacity-90 shadow-sm"
              style={{ backgroundColor: "#1a5c3f" }}
            >
              <Home size={17} />
              Back to Home
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/browse-books"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-semibold text-sm border transition-colors"
              style={{
                color: "#1a5c3f",
                borderColor: "#1a5c3f",
                backgroundColor: "transparent",
              }}
            >
              <BookOpen size={17} />
              Browse Books
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom divider */}
      <motion.div
        className="mt-16 flex items-center gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <div className="h-px w-14" style={{ backgroundColor: "#1a5c3f" }} />
        <BookOpen size={15} color="#1a5c3f" />
        <div className="h-px w-14" style={{ backgroundColor: "#1a5c3f" }} />
      </motion.div>

      <motion.p
        className="mt-3 text-xs"
        style={{ color: "#9a9a9a" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        © {new Date().getFullYear()} Boimohol. All rights reserved.
      </motion.p>
    </div>
  );
}