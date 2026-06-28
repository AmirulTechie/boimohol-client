/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSession } from '@/lib/auth-client';
import { Star, Pencil, Trash2, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { GetReviewsByBook, PostReview, DeleteReview, UpdateReview } from '@/lib/actions/reviews';
import { GetDeliveriesByUser } from '@/lib/actions/deliveries';

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => !readonly && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={readonly ? 'cursor-default' : 'transition'}
          disabled={readonly}
        >
          <Star
            size={readonly ? 11 : 20}
            className={`transition ${
              star <= (hovered || value)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({ review, currentUserId, onDelete, onEdit }) {
  const [editing, setEditing] = useState(false);
  const [editRating, setEditRating] = useState(review.rating);
  const [editComment, setEditComment] = useState(review.comment);
  const [saving, setSaving] = useState(false);

  const initials = review.userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isOwner = currentUserId && currentUserId === review.userId;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onEdit(review._id, { rating: editRating, comment: editComment });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 py-5 border-b border-gray-100 last:border-0"
    >
      <div className="shrink-0">
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
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="text-sm font-semibold text-[#0a5c46]">{review.userName}</p>
          <span className="inline-flex items-center gap-1 text-[10px] text-[#008854] bg-[#008854]/10 px-2 py-0.5 rounded-full font-medium">
            <ShieldCheck size={10} /> Verified
          </span>
          {!editing && <StarRating value={review.rating} readonly />}
          <span className="text-xs text-gray-400 ml-auto">
            {new Date(review.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </span>
        </div>

        {editing ? (
          <div className="space-y-2 mt-2">
            <StarRating value={editRating} onChange={setEditRating} />
            <textarea
              value={editComment}
              onChange={(e) => setEditComment(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#008854] resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-xs bg-[#008854] text-white px-3 py-1.5 rounded-lg hover:bg-[#0a5c46] transition"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
        )}

        {isOwner && !editing && (
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-xs text-[#008854] hover:underline"
            >
              <Pencil size={11} /> Edit
            </button>
            <button
              onClick={() => onDelete(review._id)}
              className="flex items-center gap-1 text-xs text-red-400 hover:underline"
            >
              <Trash2 size={11} /> Delete
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function ReviewSection({ bookId }) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [alreadyReviewed, setAlreadyReviewed] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const user = session?.user;

  const fetchReviews = async () => {
    try {
      const data = await GetReviewsByBook(bookId);
      setReviews(data);
      if (user) {
        setAlreadyReviewed(data.some((r) => r.userId === user.id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Check if user has a Delivered delivery for this book
  const checkEligibility = async () => {
    if (!user) return;
    try {
      const deliveries = await GetDeliveriesByUser(user.id);
      const eligible = deliveries.some(
        (d) => d.bookId === bookId && d.status === 'Delivered'
      );
      setCanReview(eligible);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (bookId) {
      fetchReviews();
      checkEligibility();
    }
  }, [bookId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a rating.'); return; }
    if (!comment.trim()) { setError('Please write a comment.'); return; }

    setSubmitting(true);
    setError('');
    try {
      await PostReview({
        bookId,
        userId: user.id,
        userName: user.name,
        userImage: user.image || null,
        rating,
        comment,
      });
      setRating(0);
      setComment('');
      await fetchReviews();
    } catch (err) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('Delete this review?')) return;
    try {
      await DeleteReview(reviewId);
      await fetchReviews();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async (reviewId, data) => {
    await UpdateReview(reviewId, data);
    await fetchReviews();
  };

  const renderForm = () => {
    if (!user) {
      return (
        <p className="text-sm text-gray-500">
          <a href="/auth/login" className="text-[#008854] font-medium hover:underline">Log in</a>{' '}
          to share your thoughts on this book.
        </p>
      );
    }
    if (alreadyReviewed) {
      return <p className="text-sm text-gray-400">You have already reviewed this book.</p>;
    }
    if (!canReview) {
      return (
        <div className="text-sm text-gray-500 space-y-1">
          <p className="font-medium text-[#0a5c46]">Reviews are verified</p>
          <p>Only readers who have received this book can leave a review.</p>
        </div>
      );
    }

    return (
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
          {submitting ? 'Submitting...' : 'Submit Review'}
        </motion.button>
      </form>
    );
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-[#0a5c46] mb-6">
        Reviews{' '}
        <span className="text-gray-400 font-normal text-base">({reviews.length})</span>
      </h2>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 bg-white rounded-2xl px-6 py-2 shadow-sm min-w-0">
          {loadingReviews ? (
            <p className="text-sm text-gray-400 py-8 text-center animate-pulse">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">
              No reviews yet. Be the first to review this book.
            </p>
          ) : (
            reviews.map((r) => (
              <ReviewCard
                key={r._id}
                review={r}
                currentUserId={user?.id}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))
          )}
        </div>

        <div className="lg:w-80 shrink-0">
          <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-6">
            <h3 className="text-sm font-bold text-[#0a5c46] mb-4">Leave a Review</h3>
            {renderForm()}
          </div>
        </div>
      </div>
    </div>
  );
}