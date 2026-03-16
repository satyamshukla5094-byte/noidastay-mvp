"use client";

import { useEffect, useState, useCallback } from "react";
import { Star, Send, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: { full_name: string | null } | null;
}

function StarRating({
  value,
  onChange,
  readonly = false,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
  size?: "sm" | "md";
}) {
  const [hovered, setHovered] = useState(0);
  const sz = size === "sm" ? "h-4 w-4" : "h-6 w-6";
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-transform ${!readonly ? "hover:scale-110 cursor-pointer" : "cursor-default"}`}
          aria-label={`${star} star`}
        >
          <Star
            className={`${sz} transition-colors ${
              star <= (hovered || value)
                ? "text-amber-400 fill-amber-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function SkeletonReview() {
  return (
    <div className="animate-pulse flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <div className="flex flex-col gap-1.5">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-3 w-16 bg-gray-100 rounded" />
        </div>
      </div>
      <div className="h-4 bg-gray-100 rounded w-full" />
      <div className="h-4 bg-gray-100 rounded w-3/4" />
    </div>
  );
}

const AVATAR_COLORS = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
];

export default function ReviewSection({ propertyId }: { propertyId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchReviews = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("reviews")
      .select("id, user_id, rating, comment, created_at, profiles(full_name)")
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false });
    if (data) {
      setReviews(data as Review[]);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const mine = data.find((r) => r.user_id === user.id) as Review | undefined;
        setMyReview(mine ?? null);
        if (mine) {
          setRating(mine.rating);
          setComment(mine.comment ?? "");
        }
      }
    }
    setLoading(false);
  }, [propertyId]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
    fetchReviews();
  }, [fetchReviews]);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) { window.location.href = "/login"; return; }
    if (rating === 0) { setSubmitError("Please select a star rating."); return; }
    setSubmitting(true);
    setSubmitError("");
    const supabase = createClient();
    const { error } = await supabase.from("reviews").upsert(
      { user_id: userId, property_id: propertyId, rating, comment: comment.trim() || null },
      { onConflict: "user_id,property_id" }
    );
    if (error) {
      setSubmitError("Failed to submit review. Please try again.");
    } else {
      setSubmitSuccess(true);
      await fetchReviews();
      setTimeout(() => setSubmitSuccess(false), 3000);
    }
    setSubmitting(false);
  };

  return (
    <section className="mb-8">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-semibold">Reviews</h2>
        {avgRating && (
          <div className="flex items-center text-lg font-medium">
            <Star className="h-5 w-5 text-amber-400 fill-amber-400 mr-1.5" />
            {avgRating}
            <span className="text-gray-500 font-normal text-base ml-1">
              ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
            </span>
          </div>
        )}
      </div>

      {/* Write a review */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">
          {myReview ? "Update your review" : "Write a review"}
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Your rating</p>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience at this PG..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none bg-white"
          />
          {submitError && <p className="text-sm text-red-500">{submitError}</p>}
          {submitSuccess && (
            <p className="text-sm text-emerald-600 font-medium">Review submitted successfully!</p>
          )}
          <button
            type="submit"
            disabled={submitting || rating === 0}
            className="self-start flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {myReview ? "Update Review" : "Submit Review"}
          </button>
        </form>
      </div>

      {/* Reviews list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((i) => <SkeletonReview key={i} />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.map((review, idx) => {
            const name =
              (review.profiles as any)?.full_name ||
              `User ${review.user_id.slice(0, 4).toUpperCase()}`;
            const initial = name.charAt(0).toUpperCase();
            const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length];
            const date = new Date(review.created_at).toLocaleDateString("en-IN", {
              month: "long",
              year: "numeric",
            });
            return (
              <div key={review.id} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${colorClass}`}>
                    {initial}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{name}</p>
                    <p className="text-xs text-gray-500">{date}</p>
                  </div>
                </div>
                <StarRating value={review.rating} readonly size="sm" />
                {review.comment && (
                  <p className="text-gray-600 leading-relaxed text-sm">{review.comment}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
