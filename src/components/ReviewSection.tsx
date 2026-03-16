"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Star, Send, Loader2, CheckCircle2, ShieldCheck, Wifi, Coffee, UserCheck, Trash2, MessageSquare } from "lucide-react";
import ReviewModal from "@/components/ReviewModal";
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
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeBooking, setActiveBooking] = useState<any>(null);

  const fetchReviews = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("reviews")
      .select("*, profiles(full_name, major, year)")
      .eq("property_id", propertyId)
      .order("created_at", { ascending: false });
    if (data) {
      setReviews(data as any[]);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const mine = data.find((r) => r.user_id === user.id);
        setMyReview(mine ?? null);
        
        // Check for active/completed booking to allow review
        const { data: booking } = await supabase
          .from("legal_agreements")
          .select("id")
          .eq("student_id", user.id)
          .eq("property_id", propertyId)
          .in("status", ["active", "completed", "signed"])
          .limit(1)
          .single();
        
        setActiveBooking(booking);
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

  const categoryAverages = null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-black text-slate-900">Resident Feedback</h2>
          {avgRating && (
            <div className="flex items-center bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
              <Star className="h-4 w-4 text-amber-500 fill-amber-400 mr-1.5" />
              <span className="text-sm font-black text-amber-700">{avgRating}</span>
            </div>
          )}
        </div>
        
        {activeBooking && !myReview && (
          <button 
            onClick={() => setShowReviewModal(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-blue-100 flex items-center gap-2 hover:bg-blue-700 transition-all"
          >
            <Star size={16} /> Write a Review
          </button>
        )}
      </div>

      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((i) => <SkeletonReview key={i} />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
          <p className="text-slate-400 font-medium italic">No verified resident reviews yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {reviews.map((review, idx) => (
            <div key={review.id} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                    {review.profiles?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-black text-slate-900">{review.profiles?.full_name || 'Anonymous'}</p>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-wider">
                        <CheckCircle2 size={10} /> Verified Resident
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Verified Resident
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={14} className={s <= review.rating ? "fill-amber-400 text-amber-400" : "text-slate-100"} />
                ))}
              </div>

              {review.comment && (
                <p className="text-slate-600 leading-relaxed text-sm font-medium italic">"{review.comment}"</p>
              )}

              
                          </div>
          ))}
        </div>
      )}

      {showReviewModal && userId && activeBooking && (
        <ReviewModal 
          propertyId={propertyId}
          bookingId={activeBooking.id}
          studentId={userId}
          onClose={() => {
            setShowReviewModal(false);
            fetchReviews();
          }}
        />
      )}
    </section>
  );
}

function SentimentCard({ label, score, icon }: { label: string, score: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
        {icon} {label}
      </div>
      <div className="flex items-end gap-1">
        <span className="text-xl font-black text-slate-900">{score}</span>
        <Star className="h-3 w-3 text-amber-400 fill-amber-400 mb-1.5" />
      </div>
    </div>
  );
}
