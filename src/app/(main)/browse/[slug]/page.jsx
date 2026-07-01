/* eslint-disable react-hooks/static-components */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useSession } from "@/lib/auth-client";
import {
  Truck, CalendarDays, BookOpen, User, Tag,
  Pencil, Trash2, EyeOff, CheckCircle, XCircle, Clock,
} from "lucide-react";
import ReviewSection from "@/components/book-details/ReveiwSection";
import { useEffect, useState, use, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GetAllBooks, UpdateBook, DeleteBook } from "@/lib/actions/books";
import { CreateDelivery } from "@/lib/actions/deliveries";
import { createCheckoutSession } from "@/lib/actions/stripe";
import { toSlug } from "@/lib/utils/slug";

const normalize = (id) => {
  if (!id) return "";
  if (typeof id === "object" && id.$oid) return id.$oid;
  return id.toString();
};

export default function BookDetailsPage({ params }) {
  const { slug } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [paymentHandled, setPaymentHandled] = useState(false);

  const { data: session } = useSession();
  const user = session?.user;

  // ── Toast ─────────────────────────────────────────────────────────────────

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch books ───────────────────────────────────────────────────────────

  const loadBooks = useCallback(async () => {
    try {
      const data = await GetAllBooks();
      setBooks(data);
    } catch (err) {
      console.error("Failed to fetch books:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // ── Derive book data ──────────────────────────────────────────────────────

  const book = books.find((b) => toSlug(b.title) === slug);
  const bookId = book ? normalize(book._id) : null;

  const librarianId = book?.librarianId
  ? normalize(book.librarianId)
  : null;

const librarianName = book?.librarianName || "Unknown";

  const isLibrarian = !!user?.id && !!librarianId && user.id === librarianId;
  const isCheckedOut = book?.status === "Checked Out";
  const isPendingDelivery = book?.status === "Pending Delivery";
  const isUnavailable = isCheckedOut || isPendingDelivery;

  const relatedBooks = book
    ? books
        .filter((b) => toSlug(b.title) !== slug && b.category === book.category)
        .slice(0, 4)
    : [];

  // ── Handle Stripe return ──────────────────────────────────────────────────

  useEffect(() => {
    if (paymentHandled) return;

    const paymentStatus = searchParams.get("payment");
    const returnedBookId = searchParams.get("bookId");

    if (paymentStatus === "success" && returnedBookId) {
      setPaymentHandled(true);

      const userId = searchParams.get("userId") || "";
      const userName = decodeURIComponent(searchParams.get("userName") || "");
      const userEmail = decodeURIComponent(searchParams.get("userEmail") || "");
      const returnedLibrarianId = searchParams.get("librarianId") || "";
      const deliveryFee = parseFloat(searchParams.get("deliveryFee") || "0");
      const bookTitle = decodeURIComponent(searchParams.get("bookTitle") || "");
      const coverImage = decodeURIComponent(searchParams.get("coverImage") || "");

      Promise.all([
        UpdateBook(returnedBookId, { status: "Checked Out" }),
        CreateDelivery({
          bookId: returnedBookId,
          bookTitle,
          coverImage,
          deliveryFee,
          userId,
          userName,
          userEmail,
          librarianId: returnedLibrarianId,
        }),
      ])
        .then(() => {
          showToast("Payment successful! Your delivery is being processed.");
          loadBooks();
          router.replace(`/browse/${slug}`);
        })
        .catch(() =>
          showToast("Payment received but something went wrong updating records.", "error")
        );
    }

    if (paymentStatus === "cancelled") {
      setPaymentHandled(true);
      showToast("Payment was cancelled.", "error");
      router.replace(`/browse/${slug}`);
    }
  }, [searchParams, paymentHandled, slug, loadBooks, router]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleRequestDelivery = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    setCheckoutLoading(true);
    try {
      const { url } = await createCheckoutSession({
        bookId,
        bookTitle: book.title,
        coverImage: book.coverImage,
        deliveryFee: book.deliveryFee,
        bookSlug: slug,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        librarianId,
      });
      if (url) window.location.href = url;
    } catch (err) {
      console.error("Stripe error:", err);
      showToast("Failed to start checkout. Please try again.", "error");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${book.title}"?`)) return;
    setActionLoading(true);
    try {
      await DeleteBook(bookId);
      showToast("Book deleted successfully.");
      setTimeout(() => router.push("/browse"), 1500);
    } catch (err) {
      showToast("Failed to delete book.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnpublish = async () => {
    setActionLoading(true);
    try {
      await UpdateBook(bookId, { status: "Unpublished" });
      showToast("Book unpublished successfully.");
      await loadBooks();
    } catch (err) {
      showToast("Failed to unpublish book.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Status badge ──────────────────────────────────────────────────────────

  const StatusBadge = () => {
    if (isCheckedOut)
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-red-100 text-red-600">
          <XCircle size={12} /> Checked Out
        </span>
      );
    if (isPendingDelivery)
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
          <Clock size={12} /> Pending Delivery
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-green-100 text-green-700">
        <CheckCircle size={12} /> Available
      </span>
    );
  };

  // ── Loading & not found ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5eb] flex items-center justify-center">
        <p className="text-[#0a5c46] text-sm animate-pulse">Loading book details...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-[#f5f5eb] flex flex-col items-center justify-center gap-3">
        <p className="text-[#0a5c46] text-lg font-semibold">Book not found.</p>
        <Link href="/browse" className="text-sm text-[#008854] hover:underline">
          ← Back to Browse
        </Link>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#f5f5eb]">

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg whitespace-nowrap ${
              toast.type === "error" ? "bg-red-500 text-white" : "bg-[#008854] text-white"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-8 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#008854] transition">Home</Link>
          <span>/</span>
          <Link href="/browse" className="hover:text-[#008854] transition">Browse Books</Link>
          <span>/</span>
          <span className="text-[#0a5c46] font-medium truncate max-w-50">{book.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-10">

          {/* Left — cover + related */}
          <div className="flex flex-col gap-6 w-full lg:w-70 shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative w-full aspect-3/4 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5"
            >
              {/* Blurred bg */}
              <Image
                src={book.coverImage}
                alt=""
                fill
                className="object-cover scale-110 blur-xl opacity-60"
                aria-hidden="true"
              />
              {/* Main cover */}
              <Image
                src={book.coverImage}
                alt={book.title}
                fill
                className="object-contain relative z-10 drop-shadow-lg"
                sizes="(max-width: 1024px) 90vw, 280px"
                priority
              />
            </motion.div>

            {relatedBooks.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                  More in {book.category}
                </p>
                <div className="flex flex-col gap-3">
                  {relatedBooks.map((b) => (
                    <Link
                      key={normalize(b._id)}
                      href={`/browse/${toSlug(b.title)}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="relative w-10 h-14 rounded-lg overflow-hidden shrink-0 shadow-sm">
                        <Image src={b.coverImage} alt={b.title} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#0a5c46] group-hover:underline truncate">
                          {b.title}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{b.author}</p>
                        <p className="text-xs text-[#008854] font-medium mt-0.5">
                          ${b.deliveryFee}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — details */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="flex-1 min-w-0"
          >
            {/* Status + category badges */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <StatusBadge />
              {book.category && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                  {book.category}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-[#0a5c46] leading-tight mb-1">
              {book.title}
            </h1>
            <p className="text-base text-gray-500 mb-6">
              by <span className="text-[#008854] font-medium">{book.author}</span>
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mb-8">{book.description}</p>

            {/* Info table */}
            <div className="border border-gray-100 rounded-2xl overflow-hidden mb-8">
              {[
                { icon: User, label: "Author", value: book.author },
                { icon: Tag, label: "Category", value: book.category ?? "—" },
                { icon: Truck, label: "Delivery Fee", value: `$${book.deliveryFee}` },
                {
                  icon: CalendarDays,
                  label: "Date Added",
                  value: book.createdAt
                    ? new Date(book.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "—",
                },
                { icon: BookOpen, label: "Librarian", value: librarianName },
              ].map((row, i) => {
                const Icon = row.icon;
                return (
                  <div
                    key={row.label}
                    className={`flex items-center gap-4 px-5 py-3 text-sm ${
                      i !== 0 ? "border-t border-gray-100" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 w-32 shrink-0 text-gray-400">
                      <Icon size={14} />
                      <span className="text-xs font-medium">{row.label}</span>
                    </div>
                    <span className="text-[#0a5c46] font-medium">{row.value}</span>
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3">

              {/* Regular user — request delivery */}
              {!isLibrarian && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleRequestDelivery}
                  disabled={isUnavailable || checkoutLoading}
                  className="flex items-center gap-2 bg-[#008854] hover:bg-[#0a5c46] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-3 rounded-xl transition cursor-pointer"
                >
                  <Truck size={16} />
                  {checkoutLoading
                    ? "Redirecting to Stripe..."
                    : isUnavailable
                    ? "Currently Unavailable"
                    : `Request Delivery — $${book.deliveryFee}`}
                </motion.button>
              )}

              {/* Librarian controls */}
              {isLibrarian && (
                <>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => router.push(`/browse/${slug}/edit`)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 border border-[#008854] text-[#008854] hover:bg-[#008854]/5 text-sm font-medium px-4 py-3 rounded-xl transition"
                  >
                    <Pencil size={15} /> Edit
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleUnpublish}
                    disabled={actionLoading}
                    className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium px-4 py-3 rounded-xl transition"
                  >
                    <EyeOff size={15} />
                    {actionLoading ? "..." : "Unpublish"}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="flex items-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium px-4 py-3 rounded-xl transition"
                  >
                    <Trash2 size={15} />
                    {actionLoading ? "..." : "Delete"}
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        <div className="mt-14">
          <ReviewSection bookId={bookId} />
        </div>

      </div>
    </div>
  );
}