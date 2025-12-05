"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FadeIn, SlideUp } from "./ui/motion";

interface Review {
    id: string;
    user_name: string;
    rating: number;
    comment: string;
    created_at: string;
}

export default function ProductReviews({
    productId,
    reviews,
}: {
    productId: string;
    reviews: Review[];
}) {
    const { data: session } = useSession();
    const [newReviews, setNewReviews] = useState<Review[]>(reviews);
    const [userName, setUserName] = useState("");
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auto-populate username from session when it becomes available
    useEffect(() => {
        if (session?.user?.name && !userName) {
            setUserName(session.user.name);
        }
    }, [session, userName]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId,
                    userName: session?.user?.name || userName,
                    rating,
                    comment
                }),
            });

            if (res.ok) {
                const review = await res.json();
                setNewReviews([review, ...newReviews]);
                // Only clear userName if not from session
                if (!session?.user) {
                    setUserName("");
                }
                setComment("");
                setRating(5);
            }
        } catch (error) {
            console.error("Failed to submit review", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="mt-20 border-t border-white/10 pt-12 relative">
            <SlideUp>
                <h2 className="text-3xl font-bold text-white mb-8 font-[family-name:var(--font-orbitron)]">
                    Customer <span className="text-gradient-animated">Reviews</span>
                </h2>
            </SlideUp>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Review Form */}
                <FadeIn delay={0.2}>
                    <div className="glass-card rounded-2xl p-8 border-purple-500/20 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 pointer-events-none" />

                        <h3 className="text-xl font-bold text-white mb-6 relative z-10">Write a Review</h3>
                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                                {session?.user ? (
                                    // Show logged-in user's name (read-only)
                                    <div className="relative">
                                        <div className="w-full bg-black/30 border border-emerald-500/30 rounded-lg px-4 py-3 text-emerald-400 flex items-center gap-2">
                                            <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>{session.user.name}</span>
                                        </div>
                                    </div>
                                ) : (
                                    // Show input for guest users
                                    <div className="relative group">
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg opacity-0 group-focus-within:opacity-100 transition duration-300 blur opacity-20"></div>
                                        <input
                                            type="text"
                                            required
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                            className="relative w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-transparent transition-all"
                                            placeholder="Your name"
                                        />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className={`text-2xl transition-all hover:scale-110 ${star <= rating ? "text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" : "text-slate-600 hover:text-slate-400"
                                                }`}
                                        >
                                            ★
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Comment
                                </label>
                                <div className="relative group">
                                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg opacity-0 group-focus-within:opacity-100 transition duration-300 blur opacity-20"></div>
                                    <textarea
                                        required
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        rows={4}
                                        className="relative w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-transparent transition-all"
                                        placeholder="Share your thoughts..."
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full btn-primary relative overflow-hidden group"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Review"
                                    )}
                                </span>
                            </button>
                        </form>
                    </div>
                </FadeIn>

                {/* Reviews List */}
                <div className="space-y-6">
                    {newReviews.length === 0 ? (
                        <div className="glass-card rounded-2xl p-8 text-center border-white/5">
                            <p className="text-slate-400">No reviews yet. Be the first to review!</p>
                        </div>
                    ) : (
                        newReviews.map((review) => (
                            <FadeIn key={review.id} className="glass-card rounded-2xl p-6 border-white/5 hover:border-purple-500/30 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-purple-500/20">
                                            {review.user_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white">{review.user_name}</h4>
                                            <div className="flex text-yellow-400 text-sm drop-shadow-[0_0_5px_rgba(250,204,21,0.3)]">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <span key={i}>
                                                        {i < review.rating ? "★" : "☆"}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                                        {new Date(review.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-slate-300 text-sm leading-relaxed pl-13">
                                    {review.comment}
                                </p>
                            </FadeIn>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
