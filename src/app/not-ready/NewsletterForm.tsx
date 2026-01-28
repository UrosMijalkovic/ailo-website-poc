"use client";

import { useState } from "react";
import { trackNewsletterSubscribed } from "@/lib/analytics";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "not-ready" }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 409) {
          setError("You're already subscribed!");
        } else {
          setError(data.error || "Something went wrong. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      trackNewsletterSubscribed("not-ready");
      setIsSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center py-2">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[var(--color-accent)] mb-3">
          <svg
            className="w-5 h-5 text-[var(--color-primary-dark)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="text-white font-medium">You&apos;re subscribed!</p>
        <p className="text-white/60 text-sm">Check your inbox for a confirmation.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
      <input
        type="email"
        placeholder="Your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={`flex-1 px-4 py-3 rounded-xl bg-white/10 border text-white placeholder:text-white/50 focus:outline-none focus:border-[var(--color-accent)] ${
          error ? "border-red-400" : "border-white/20"
        }`}
      />
      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90 rounded-xl text-[var(--color-primary-dark)] font-medium transition-colors whitespace-nowrap disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Subscribing...
          </span>
        ) : (
          "Subscribe"
        )}
      </button>
      {error && <p className="text-red-400 text-sm text-center sm:text-left col-span-full">{error}</p>}
    </form>
  );
}
