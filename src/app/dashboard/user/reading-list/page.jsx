"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useSession } from "@/lib/auth-client";
import { BookOpen, PackageCheck } from "lucide-react";
import Image from "next/image";
import { GetDeliveriesByUser } from "@/lib/actions/deliveries.js";
import { GetBookById } from "@/lib/actions/books.js";

// ── Helpers ───────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

// ── Empty state ───────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#008854]/10 flex items-center justify-center mb-4">
        <BookOpen size={28} className="text-[#008854]" />
      </div>
      <p className="text-sm font-semibold text-[#0a5c46]">No books yet</p>
      <p className="text-xs text-gray-400 mt-1">
        Books from completed deliveries will appear here.
      </p>
    </div>
  );
}

// ── Book card ─────────────────────────────────────────────

function BookCard({ book, deliveredAt, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      className="group flex flex-col gap-3"
    >
      {/* Cover */}
      <div className="relative w-full aspect-3/4 rounded-xl overflow-hidden bg-[#008854]/5 shadow-sm group-hover:shadow-md transition-shadow duration-300">
        {book.coverImage ? (
          <Image
            src={book.coverImage}
            alt={book.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen size={32} className="text-[#008854]/30" />
          </div>
        )}

        {/* Delivered badge */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700">
            <PackageCheck size={9} />
            Delivered
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="px-0.5">
        <p className="text-xs font-semibold text-[#0a5c46] leading-snug line-clamp-2">
          {book.title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{book.author}</p>
        {deliveredAt && (
          <p className="text-[10px] text-gray-300 mt-1">
            {new Date(deliveredAt).toLocaleDateString("en-GB", {
              day: "2-digit", month: "short", year: "numeric",
            })}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ── Skeleton card ─────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-3">
      <div className="w-full aspect-3/4 rounded-xl bg-gray-100 animate-pulse" />
      <div className="space-y-1.5 px-0.5">
        <div className="h-3 bg-gray-100 rounded animate-pulse w-4/5" />
        <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────

export default function ReadingListPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [books, setBooks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      try {
        const deliveries = await GetDeliveriesByUser(userId);

        // Only Delivered, deduplicated by bookId
        const delivered = deliveries.filter(
          (d) => d.status === "Delivered" && d.bookId
        );
        const unique = [
          ...new Map(delivered.map((d) => [d.bookId, d])).values(),
        ];

        // Fetch full book details in parallel
        const results = await Promise.all(
          unique.map(async (d) => {
            try {
              const book = await GetBookById(d.bookId);
              return { book, deliveredAt: d.createdAt };
            } catch {
              return null;
            }
          })
        );

        setBooks(results.filter(Boolean));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

      {/* Heading */}
      <motion.div {...fadeUp(0)}>
        <h1 className="text-xl font-bold text-[#0a5c46]">My Reading List</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Every book that has made it to your door.
        </p>
      </motion.div>

      {/* Gallery card */}
      <motion.div {...fadeUp(0.05)} className="bg-white rounded-2xl p-6 shadow-sm">

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <p className="text-sm text-red-500 py-6 text-center">{error}</p>
        ) : books.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <p className="text-xs text-gray-400 mb-5">
              {books.length} {books.length === 1 ? "book" : "books"} delivered
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {books.map(({ book, deliveredAt }, i) => (
                <BookCard
                  key={book._id}
                  book={book}
                  deliveredAt={deliveredAt}
                  delay={i * 0.04}
                />
              ))}
            </div>
          </>
        )}

      </motion.div>
    </div>
  );
}