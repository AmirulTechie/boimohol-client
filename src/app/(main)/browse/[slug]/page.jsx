"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useSession } from "@/lib/auth-client";
import {
  Truck, CalendarDays, BookOpen, User, Tag,
  Pencil, Trash2, EyeOff, CheckCircle, XCircle,
} from "lucide-react";
import ReviewSection from "@/components/book-details/ReveiwSection";
import { useEffect, useState, use } from "react";
import { GetAllBooks } from "@/lib/actions/books";

const normalize = (id) => {
  if (!id) return "";
  if (typeof id === "object" && id.$oid) return id.$oid;
  return id.toString();
};

export default function BookDetailsPage({ params }) {
  const { slug } = use(params);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const data = await GetAllBooks();
        setBooks(data);
      } catch (err) {
        console.error("Failed to fetch books:", err);
      } finally {
        setLoading(false);
      }
    };
    loadBooks();
  }, []);

  const book = books.find((b) => normalize(b._id) === slug);

  const user = session?.user;

  const librarianId = book?.librarian
    ? typeof book.librarian === "object" && book.librarian !== null
      ? normalize(book.librarian._id)
      : normalize(book.librarian)
    : null;

  const librarianName =
    book?.librarian && typeof book.librarian === "object" && book.librarian.name
      ? book.librarian.name
      : "Unknown";

  const isLibrarian = !!user?.id && !!librarianId && user.id === librarianId;
  const isCheckedOut = book?.status === "Checked Out";

  const relatedBooks = book
    ? books.filter((b) => normalize(b._id) !== slug && b.category === book.category).slice(0, 4)
    : [];

  const handleRequestDelivery = () => {};
  const handleDelete = () => {};
  const handleUnpublish = () => {};

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

  return (
    <div className="min-h-screen bg-[#f5f5eb]">
      <div className="max-w-6xl mx-auto px-4 py-10">

        <nav className="text-xs text-gray-400 mb-8 flex items-center gap-1.5">
          <Link href="/" className="hover:text-[#008854] transition">Home</Link>
          <span>/</span>
          <Link href="/browse" className="hover:text-[#008854] transition">Browse Books</Link>
          <span>/</span>
          <span className="text-[#0a5c46] font-medium">{book.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-10">

          {/* Left — cover + related */}
          <div className="flex flex-col gap-6 lg:w-[280px] flex-shrink-0">
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-black/5"
  >
    <Image
      src={book.coverImage}
      alt={book.title}
      fill
      className="object-cover object-top"
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
                      href={`/browse/${normalize(b._id)}`}
                      className="flex items-center gap-3 group"
                    >
                      <div className="relative w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 shadow-sm">
                        <Image src={b.coverImage} alt={b.title} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-[#0a5c46] group-hover:underline truncate">{b.title}</p>
                        <p className="text-xs text-gray-400 truncate">{b.author}</p>
                        <p className="text-xs text-[#008854] font-medium mt-0.5">৳{b.deliveryFee}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Center — details */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="flex-1 min-w-0"
          >
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full ${
                isCheckedOut ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"
              }`}>
                {isCheckedOut
                  ? <><XCircle size={12} /> Checked Out</>
                  : <><CheckCircle size={12} /> Available</>
                }
              </span>
              {book.category && (
                <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                  {book.category}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-bold text-[#0a5c46] leading-tight mb-1">{book.title}</h1>
            <p className="text-base text-gray-500 mb-6">
              by <span className="text-[#008854] font-medium">{book.author}</span>
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mb-8">{book.description}</p>

            <div className="border border-gray-100 rounded-2xl overflow-hidden mb-8">
              {[
                { icon: User, label: "Author", value: book.author },
                { icon: Tag, label: "Category", value: book.category ?? "—" },
                { icon: Truck, label: "Delivery Fee", value: `৳${book.deliveryFee}` },
                {
                  icon: CalendarDays,
                  label: "Date Added",
                  value: book.createdAt
                    ? new Date(book.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                    : "—",
                },
                { icon: BookOpen, label: "Librarian", value: librarianName },
              ].map((row, i) => {
                const Icon = row.icon;
                return (
                  <div key={row.label} className={`flex items-center gap-4 px-5 py-3 text-sm ${i !== 0 ? "border-t border-gray-100" : ""}`}>
                    <div className="flex items-center gap-2 w-32 flex-shrink-0 text-gray-400">
                      <Icon size={14} />
                      <span className="text-xs font-medium">{row.label}</span>
                    </div>
                    <span className="text-[#0a5c46] font-medium">{row.value}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {!isLibrarian && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleRequestDelivery}
                  disabled={isCheckedOut}
                  className="flex items-center gap-2 bg-[#008854] hover:bg-[#0a5c46] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-3 rounded-xl transition"
                >
                  <Truck size={16} />
                  {isCheckedOut ? "Currently Unavailable" : `Request Delivery — ৳${book.deliveryFee}`}
                </motion.button>
              )}

              {isLibrarian && (
                <>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 border border-[#008854] text-[#008854] hover:bg-[#008854]/5 text-sm font-medium px-4 py-3 rounded-xl transition"
                  >
                    <Pencil size={15} /> Edit
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleUnpublish}
                    className="flex items-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium px-4 py-3 rounded-xl transition"
                  >
                    <EyeOff size={15} /> Unpublish
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleDelete}
                    className="flex items-center gap-2 border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium px-4 py-3 rounded-xl transition"
                  >
                    <Trash2 size={15} /> Delete
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        </div>

        <div className="mt-14">
          <ReviewSection bookId={normalize(book._id)} />
        </div>

      </div>
    </div>
  );
}