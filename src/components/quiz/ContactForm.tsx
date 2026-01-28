"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRecaptcha } from "@/hooks/useRecaptcha";

interface ContactFormProps {
  onSubmit: (data: { name: string; phone: string; email: string; recaptchaToken?: string | null }) => void;
  isLoading?: boolean;
  isWaitlist?: boolean;
}

export function ContactForm({ onSubmit, isLoading, isWaitlist }: ContactFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; email?: string; agreed?: string }>({});
  const { executeRecaptcha } = useRecaptcha();

  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Please enter your full name";
    }

    // Phone validation (basic)
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[+]?[\d\s()-]{10,}$/.test(phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Agreement validation
    if (!agreed) {
      newErrors.agreed = "You must agree to receive communications";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Get reCAPTCHA token
      const recaptchaToken = await executeRecaptcha("quiz_submit");
      onSubmit({ name, phone, email, recaptchaToken });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="font-[var(--font-playfair)] text-2xl md:text-3xl font-bold text-white mb-2">
          {isWaitlist ? "Join Our Waitlist" : "Almost There!"}
        </h2>
        {isWaitlist ? (
          <div className="space-y-2">
            <p className="text-[var(--color-accent)] text-sm font-medium">
              We&apos;re currently only serving South Florida (Palm Beach, Broward, Miami-Dade).
            </p>
            <p className="text-white/70 text-sm">
              Join our waitlist and we&apos;ll notify you when we expand to your area.
            </p>
          </div>
        ) : (
          <p className="text-white/70 text-sm">
            We&apos;ll text you a confirmation and call details.
            Your info stays private — we never spam or sell data.
          </p>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">
            Full Name *
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Jane Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[var(--color-accent)] ${
              errors.name ? "border-red-400" : ""
            }`}
          />
          {errors.name && (
            <p className="text-red-400 text-sm">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-white">
            Phone Number *
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[var(--color-accent)] ${
              errors.phone ? "border-red-400" : ""
            }`}
          />
          {errors.phone && (
            <p className="text-red-400 text-sm">{errors.phone}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">
            Email *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-[var(--color-accent)] ${
              errors.email ? "border-red-400" : ""
            }`}
          />
          {errors.email && (
            <p className="text-red-400 text-sm">{errors.email}</p>
          )}
        </div>

        <div className="flex items-start gap-3 pt-2">
          <input
            type="checkbox"
            id="agree"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-white/20 bg-white/10 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
          />
          <Label
            htmlFor="agree"
            className={`text-sm cursor-pointer ${
              errors.agreed ? "text-red-400" : "text-white/80"
            }`}
          >
            I agree to receive communications from AILO
          </Label>
        </div>
        {errors.agreed && (
          <p className="text-red-400 text-sm">{errors.agreed}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full btn-primary text-lg h-14"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
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
            Processing...
          </span>
        ) : isWaitlist ? (
          "Join Waitlist →"
        ) : (
          "See My Results →"
        )}
      </Button>

      <p className="text-xs text-white/50 text-center flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        Your information is secure and never shared
      </p>
    </form>
  );
}
