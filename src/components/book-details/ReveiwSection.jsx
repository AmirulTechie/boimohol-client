"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSession } from "@/lib/auth-client";
import { Star } from "lucide-react";
import Image from "next/image";

// ── Dummy reviews — replace with real fetch ────────────────
const dummyReviews = [
  {
    _id: "r1",
    userName: "Meghna Rahman",
    userImage: null,
    rating: 5,
    comment: "One of the most inspiring books I have ever read. Santiago's journey mirrors the journey of every dreamer.",
    createdAt: "2026-06-10T08:00:00.000Z",
  },
  {
    _id: "r2",
    userName: "Rafiq Hossain",
    userImage: null,
    rating: 4,
    comment: "Beautiful writing and a timeless message. Slightly slow in the middle but worth it.",
    createdAt: "2026-06-18T12:00:00.000Z",
  },
];

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition"
        >
          <Star
            size={20}
            className={`transition ${
              star <= (hovered || value)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  const initials = review.userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 py-5 border-b border-gray-100 last:border-0"
    >
      <div className="flex-shrink-0">
        {review.userImage ? (
          <div className="relative w-9 h-9 rounded-full overflow-hidden">
            <Image src={review.userImage} alt={review.userName} fill className="object-cover" />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-[#008854]/10 flex items-center justify-center text-xs font-bold text-[#008854]">
            {initials}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <p className="text-sm font-semibold text-[#0a5c46]">{review.userName}</p>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                size={11}
                className={s <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400 ml-auto">
            {new Date(review.createdAt).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
            })}
          </span>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
      </div>
    </motion.div>
  );
}

export default function ReviewSection({ bookId }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState(dummyReviews);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!session) { setError("You must be logged in to leave a review."); return; }
    if (rating === 0) { setError("Please select a rating."); return; }
    if (!comment.trim()) { setError("Please write a comment."); return; }

    setSubmitting(true);
    setError("");

    try {
      // TODO: replace with server action call
      // await postReview({ bookId, rating, comment });

      // Optimistic update
      setReviews((prev) => [
        {
          _id: Date.now().toString(),
          userName: session.user.name,
          userImage: session.user.image || null,
          rating,
          comment,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
      setRating(0);
      setComment("");
    } catch (err) {
      setError("Failed to submit review. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-[#0a5c46] mb-6">
        Reviews <span className="text-gray-400 font-normal text-base">({reviews.length})</span>
      </h2>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Review list */}
        <div className="flex-1 bg-white rounded-2xl px-6 py-2 shadow-sm min-w-0">
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No reviews yet. Be the first to review this book.</p>
          ) : (
            reviews.map((r) => <ReviewCard key={r._id} review={r} />)
          )}
        </div>

        {/* Submit form */}
        <div className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-6">
            <h3 className="text-sm font-bold text-[#0a5c46] mb-4">
              {session ? "Leave a Review" : "Log in to leave a review"}
            </h3>

            {session ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Your Rating</label>
                  <StarRating value={rating} onChange={setRating} />
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Your Review</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    placeholder="What did you think of this book?"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#008854] focus:ring-2 focus:ring-[#008854]/10 transition resize-none"
                  />
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-red-500"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#008854] hover:bg-[#0a5c46] disabled:opacity-50 text-white text-sm font-medium py-2.5 rounded-xl transition"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </motion.button>
              </form>
            ) : (
              <p className="text-sm text-gray-500">
                <a href="/auth/login" className="text-[#008854] font-medium hover:underline">Log in</a> to share your thoughts on this book.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}