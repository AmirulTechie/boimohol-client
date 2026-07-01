"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LuSearch, LuSlidersHorizontal, LuX,
  LuChevronDown, LuChevronLeft, LuChevronRight,
} from "react-icons/lu";
import BookCard from "@/components/shared/BookCard";
import Image from "next/image";
import { GetBrowseBooks } from "@/lib/actions/books";

const CATEGORIES = [
  "All", "Fiction", "Science", "Academic",
  "History", "Sci-Fi", "Self-Help",
];

const AVAILABILITY_OPTIONS = [
  { label: "All",          value: "All" },
  { label: "Available",    value: "Available" },
  { label: "Checked Out",  value: "Checked Out" },
];

const SORT_OPTIONS = [
  { label: "Default",            value: "default"   },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc"},
  { label: "Title: A–Z",         value: "title_asc" },
];

const PER_PAGE = 10;

// ── Top Rated Aside ───────────────────────────────────────────────────────────

function TopRatedAside({ books }) {
  const [open, setOpen] = useState(true);
  const top = books.slice(0, 5);

  return (
    <aside className="w-full lg:w-60 shrink-0">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100"
        >
          Top Rated Books
          <LuChevronDown
            size={15}
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="top-rated"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="divide-y divide-slate-50">
                {top.map((book) => (
                  <div key={book.title} className="flex gap-3 p-3 hover:bg-slate-50 transition-colors">
                    <div className="relative w-12 h-16 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={book.coverImage}
                        alt={book.title}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="flex flex-col justify-center min-w-0">
                      <p className="text-xs font-semibold text-slate-700 line-clamp-2 leading-snug">
                        {book.title}
                      </p>
                      <div className="flex gap-0.5 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className="text-yellow-400 text-[10px]">★</span>
                        ))}
                      </div>
                      <p className="text-[#008854] font-bold text-xs mt-0.5">${book.deliveryFee}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
          <div className="aspect-2/3 bg-gray-100" />
          <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-100 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
            <div className="h-3 bg-gray-100 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function BrowseClient({ initialBooks, initialTotal, initialTotalPages }) {
  const [books, setBooks]           = useState(initialBooks ?? []);
  const [total, setTotal]           = useState(initialTotal ?? 0);
  const [totalPages, setTotalPages] = useState(initialTotalPages ?? 1);
  const [loading, setLoading]       = useState(false);

  const [search, setSearch]           = useState("");
  const [category, setCategory]       = useState("All");
  const [availability, setAvailability] = useState("All");
  const [minFee, setMinFee]           = useState("");
  const [maxFee, setMaxFee]           = useState("");
  const [sort, setSort]               = useState("default");
  const [page, setPage]               = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const searchTimeout = useRef(null);
  const isFirstRender = useRef(true);

  // ── Fetch from server ───────────────────────────────────────────────────

  const fetchBooks = useCallback(async (overrides = {}) => {
    setLoading(true);
    try {
      const params = {
        search, category, minFee, maxFee,
        availability, page, limit: PER_PAGE,
        ...overrides,
      };

      // Client-side sort — done after fetch since backend doesn't sort
      const data = await GetBrowseBooks(params);
      let result = data.books ?? [];

      if (sort === "price_asc")  result = [...result].sort((a, b) => a.deliveryFee - b.deliveryFee);
      if (sort === "price_desc") result = [...result].sort((a, b) => b.deliveryFee - a.deliveryFee);
      if (sort === "title_asc")  result = [...result].sort((a, b) => a.title.localeCompare(b.title));

      setBooks(result);
      setTotal(data.total ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      console.error("Browse fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [search, category, minFee, maxFee, availability, page, sort]);

  // Skip on first render (we use SSR initial data)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchBooks();
  }, [fetchBooks]);

  // ── Debounced search ────────────────────────────────────────────────────

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(1);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchBooks({ search: value, page: 1 });
    }, 400);
  };

  // ── Filter helpers ──────────────────────────────────────────────────────

const changeFilter = (setter, value) => {
  if (setter !== setPage) setPage(1);
  setter(value);
};

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setAvailability("All");
    setMinFee("");
    setMaxFee("");
    setSort("default");
    setPage(1);
  };

  const hasFilters = search || category !== "All" || availability !== "All" || minFee || maxFee;

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f5f5eb]">

      {/* Header + search bar */}
      <div className="py-10">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-3xl md:text-4xl font-bold text-black font-dance"
          >
            Browse Books
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mt-6 max-w-xl mx-auto flex items-center bg-white rounded-xl overflow-hidden shadow-md h-11"
          >
            <LuSearch size={16} className="ml-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by title or author..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="flex-1 px-3 h-full text-sm text-slate-700 outline-none bg-transparent placeholder:text-slate-400"
            />
            {search && (
              <button
                onClick={() => handleSearchChange("")}
                className="mr-3 text-gray-400 hover:text-gray-600"
              >
                <LuX size={15} />
              </button>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-12">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">

          {/* Category pills — desktop */}
          <div className="hidden sm:flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => changeFilter(setCategory, cat)}
                className={`text-xs font-medium px-4 py-1.5 rounded-full border transition-colors cursor-pointer ${
                  category === cat
                    ? "bg-[#008854] text-white border-[#008854]"
                    : "bg-white text-slate-600 border-slate-200 hover:border-[#008854] hover:text-[#008854]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="sm:hidden flex items-center gap-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-lg"
          >
            <LuSlidersHorizontal size={15} />
            Filters
            {hasFilters && <span className="w-2 h-2 rounded-full bg-[#008854]" />}
          </button>

          <div className="flex items-center gap-3 shrink-0">
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-xs text-[#008854] hover:underline flex items-center gap-1"
              >
                <LuX size={12} /> Clear
              </button>
            )}
            <span className="text-xs text-slate-500">{total} books</span>
            <select
              value={sort}
              onChange={(e) => changeFilter(setSort, e.target.value)}
              className="text-sm text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#008854] transition-colors"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile filter drawer */}
        <AnimatePresence>
          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="sm:hidden overflow-hidden mb-4"
            >
              <div className="flex flex-wrap gap-2 pb-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { changeFilter(setCategory, cat); setFiltersOpen(false); }}
                    className={`text-xs font-medium px-4 py-1.5 rounded-full border transition-colors ${
                      category === cat
                        ? "bg-[#008854] text-white border-[#008854]"
                        : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main layout — aside + grid */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* Sidebar filters */}
          <aside className="w-full lg:w-60 shrink-0 space-y-4">

            {/* Top Rated */}
            <TopRatedAside books={books} />

            {/* Fee range */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Delivery Fee Range
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minFee}
                  min={0}
                  onChange={(e) => changeFilter(setMinFee, e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 outline-none focus:border-[#008854] transition-colors"
                />
                <span className="text-slate-400 text-xs shrink-0">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxFee}
                  min={0}
                  onChange={(e) => changeFilter(setMaxFee, e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 outline-none focus:border-[#008854] transition-colors"
                />
              </div>
            </div>

            {/* Availability */}
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Availability
              </p>
              <div className="flex flex-col gap-2">
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div
                      onClick={() => changeFilter(setAvailability, opt.value)}
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                        availability === opt.value
                          ? "border-[#008854] bg-[#008854]"
                          : "border-slate-300 group-hover:border-[#008854]"
                      }`}
                    >
                      {availability === opt.value && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span
                      onClick={() => changeFilter(setAvailability, opt.value)}
                      className="text-xs text-slate-600 cursor-pointer"
                    >
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

          </aside>

          {/* Book grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <SkeletonGrid />
            ) : books.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <span className="text-5xl mb-4">📚</span>
                <h3 className="text-lg font-semibold text-slate-700">No books found</h3>
                <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filters</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm text-white bg-[#008854] px-5 py-2 rounded-lg hover:bg-[#0F6E56] transition-colors"
                >
                  Clear filters
                </button>
              </motion.div>
            ) : (
              <>
                <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  <AnimatePresence mode="popLayout">
                    {books.map((book, i) => (
                      <motion.div
                        key={book._id?.toString() ?? book.title + i}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, delay: i * 0.03 }}
                        className="flex"
                      >
                        <BookCard book={book} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => changeFilter(setPage, Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-[#008854] hover:text-[#008854] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <LuChevronLeft size={16} />
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => {
                      const p = i + 1;
                      // Show first, last, current ±1, and ellipsis
                      const show = p === 1 || p === totalPages || Math.abs(p - page) <= 1;
                      const showEllipsisBefore = p === page - 2 && page > 3;
                      const showEllipsisAfter  = p === page + 2 && page < totalPages - 2;

                      if (showEllipsisBefore || showEllipsisAfter) {
                        return <span key={p} className="text-slate-400 text-sm px-1">…</span>;
                      }
                      if (!show) return null;

                      return (
                        <button
                          key={p}
                          onClick={() => changeFilter(setPage, p)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${
                            page === p
                              ? "bg-[#008854] text-white border-[#008854]"
                              : "bg-white text-slate-600 border-slate-200 hover:border-[#008854] hover:text-[#008854]"
                          }`}
                        >
                          {p}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => changeFilter(setPage, Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-[#008854] hover:text-[#008854] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <LuChevronRight size={16} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}