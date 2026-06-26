"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LuSearch, LuSlidersHorizontal, LuX, LuChevronDown, LuChevronLeft, LuChevronRight } from "react-icons/lu";
import BookCard from "@/components/shared/BookCard";
import Image from "next/image";

const CATEGORIES = ["All", "Fiction", "Science", "Academic", "History", "Sci-Fi", "Self-Help"];
const SORT_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Title: A–Z", value: "title_asc" },
];
const PER_PAGE = 10;

function TopRatedAside({ books }) {
  const [open, setOpen] = useState(true);
  const TOP_RATED = books.slice(0, 5);

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
                {TOP_RATED.map((book) => (
                  <div key={book.title} className="flex gap-3 p-3 hover:bg-slate-50 transition-colors">
                    <div className="relative w-12 h-16 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={book.coverImage}
                        alt={book.title}
                        width={600}
                        height={600}
                        className="w-full h-full object-contain p-1"
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
                      <p className="text-[#008854] font-bold text-xs mt-0.5">৳{book.deliveryFee}</p>
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

export default function BrowseClient({ books }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = [...books];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q)
      );
    }

    if (category !== "All") {
      result = result.filter((b) => b.category === category);
    }

    if (sort === "price_asc") result.sort((a, b) => a.deliveryFee - b.deliveryFee);
    if (sort === "price_desc") result.sort((a, b) => b.deliveryFee - a.deliveryFee);
    if (sort === "title_asc") result.sort((a, b) => a.title.localeCompare(b.title));

    return result;
  }, [books, search, category, sort]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleFilterChange = (fn) => {
    fn();
    setPage(1);
  };

  const hasFilters = search || category !== "All";

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setSort("default");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#f5f5eb]">

      {/* Page Header */}
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
              placeholder="Search by title, author, or category..."
              value={search}
              onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
              className="flex-1 px-3 h-full text-sm text-slate-700 outline-none bg-transparent placeholder:text-slate-400"
            />
            {search && (
              <button onClick={() => handleFilterChange(() => setSearch(""))} className="mr-3 text-gray-400 hover:text-gray-600">
                <LuX size={15} />
              </button>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="hidden sm:flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleFilterChange(() => setCategory(cat))}
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
              <button onClick={clearFilters} className="text-xs text-[#008854] hover:underline flex items-center gap-1">
                <LuX size={12} /> Clear
              </button>
            )}
            <span className="text-xs text-slate-500">{filtered.length} books</span>
            <select
              value={sort}
              onChange={(e) => handleFilterChange(() => setSort(e.target.value))}
              className="text-sm text-slate-600 bg-white border border-slate-200 rounded-lg px-3 py-1.5 outline-none focus:border-[#008854] transition-colors"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile category drawer */}
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
                    onClick={() => { handleFilterChange(() => setCategory(cat)); setFiltersOpen(false); }}
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
          <TopRatedAside books={books} />

          {/* Book Grid */}
          <div className="flex-1 min-w-0">
            {paginated.length === 0 ? (
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
                <motion.div
                  layout
                  className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4"
                >
                  <AnimatePresence mode="popLayout">
                    {paginated.map((book, i) => (
                      <motion.div
                        key={book.title + i}
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

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:border-[#008854] hover:text-[#008854] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <LuChevronLeft size={16} />
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${
                          page === i + 1
                            ? "bg-[#008854] text-white border-[#008854]"
                            : "bg-white text-slate-600 border-slate-200 hover:border-[#008854] hover:text-[#008854]"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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