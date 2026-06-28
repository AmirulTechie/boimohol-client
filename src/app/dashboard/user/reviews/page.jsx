/* eslint-disable react/no-unescaped-entities */
"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSession } from "@/lib/auth-client";
import { Star, Pencil, Trash2, X, Check, MessageSquare } from "lucide-react";
import {
  GetReviewsByUser,
  DeleteReview,
  UpdateReview,
} from "@/lib/actions/reviews.js";

// ── Helpers ───────────────────────────────────────────────

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay },
});

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(null);
  const active = hovered ?? value;

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={readonly ? 12 : 18}
          className={`transition-colors ${
            i < active
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300"
          } ${!readonly ? "cursor-pointer" : ""}`}
          onMouseEnter={() => !readonly && setHovered(i + 1)}
          onMouseLeave={() => !readonly && setHovered(null)}
          onClick={() => !readonly && onChange?.(i + 1)}
        />
      ))}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#008854]/10 flex items-center justify-center mb-4">
        <MessageSquare size={28} className="text-[#008854]" />
      </div>
      <p className="text-sm font-semibold text-[#0a5c46]">No reviews yet</p>
      <p className="text-xs text-gray-400 mt-1">
        Reviews you write on delivered books will appear here.
      </p>
    </div>
  );
}

// ── Review card ───────────────────────────────────────────

function ReviewCard({ review, onDelete, onUpdate }) {
  const [editing, setEditing]   = useState(false);
  const [rating, setRating]     = useState(review.rating);
  const [comment, setComment]   = useState(review.comment);
  const [saving, setSaving]     = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState(null);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await UpdateReview(review._id, { rating, comment });
      onUpdate(review._id, { rating, comment });
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setRating(review.rating);
    setComment(review.comment);
    setEditing(false);
    setError(null);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await DeleteReview(review._id);
      onDelete(review._id);
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      className="flex items-start justify-between gap-4 p-4 rounded-xl bg-[#f5f5eb]"
    >
      <div className="flex-1 min-w-0">
        {/* Book title + stars */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <p className="text-sm font-semibold text-[#0a5c46]">
            {review.bookTitle ?? review.bookId ?? "—"}
          </p>
          {editing ? (
            <StarRating value={rating} onChange={setRating} />
          ) : (
            <StarRating value={review.rating} readonly />
          )}
        </div>

        {/* Comment */}
        {editing ? (
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full text-xs text-gray-600 bg-white border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#008854]/30"
          />
        ) : (
          <p className="text-xs text-gray-500 leading-relaxed">{review.comment}</p>
        )}

        {/* Date + error */}
        <p className="text-xs text-gray-400 mt-1.5">
          {review.createdAt
            ? new Date(review.createdAt).toLocaleDateString("en-GB", {
                day: "2-digit", month: "short", year: "numeric",
              })
            : "—"}
        </p>
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {editing ? (
          <>
            <button
              onClick={handleSave}
              disabled={saving}
              className="p-1.5 rounded-lg bg-[#008854] text-white hover:bg-[#0a5c46] transition disabled:opacity-50"
              title="Save"
            >
              <Check size={14} />
            </button>
            <button
              onClick={handleCancel}
              className="p-1.5 rounded-lg hover:bg-white transition text-gray-400 hover:text-gray-600"
              title="Cancel"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg hover:bg-white transition text-gray-400 hover:text-[#008854]"
              title="Edit"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 rounded-lg hover:bg-white transition text-gray-400 hover:text-red-500 disabled:opacity-50"
              title="Delete"
            >
              <Trash2 size={14} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────

export default function ReviewsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!userId) return;
    GetReviewsByUser(userId)
      .then(setReviews)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleDelete = (id) =>
    setReviews((prev) => prev.filter((r) => r._id !== id));

  const handleUpdate = (id, updates) =>
    setReviews((prev) =>
      prev.map((r) => (r._id === id ? { ...r, ...updates } : r))
    );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

      {/* Heading */}
      <motion.div {...fadeUp(0)}>
        <h1 className="text-xl font-bold text-[#0a5c46]">My Reviews</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Reviews you've written on books delivered to you.
        </p>
      </motion.div>

      {/* Content card */}
      <motion.div {...fadeUp(0.05)} className="bg-white rounded-2xl p-6 shadow-sm">

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-red-500 py-6 text-center">{error}</p>
        ) : reviews.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-gray-400">
              {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </p>
            <AnimatePresence mode="popLayout">
              {reviews.map((r) => (
                <ReviewCard
                  key={r._id}
                  review={r}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

      </motion.div>
    </div>
  );
}