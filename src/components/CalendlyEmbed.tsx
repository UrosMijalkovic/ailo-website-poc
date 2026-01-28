"use client";

import { useEffect, useRef, useState } from "react";
import { trackCallBooked } from "@/lib/analytics";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        prefill?: { email?: string; name?: string };
      }) => void;
    };
  }
}

export function CalendlyEmbed() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || "";

  // Save quiz data to database and send confirmation email when booking is confirmed
  const saveQuizData = async () => {
    const quizDataStr = sessionStorage.getItem("quizData");
    if (!quizDataStr) return;

    try {
      const quizData = JSON.parse(quizDataStr);
      const name = quizData.contact?.name || "";
      const email = quizData.contact?.email || "";

      // Save to database
      await fetch("/api/quiz-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: quizData.contact?.phone || "",
          answers: quizData.answers || {},
          score: quizData.result?.score,
          outcome: quizData.result?.outcome || "qualified",
        }),
      });

      // Send booking confirmation email
      if (email && name) {
        await fetch("/api/send-booking-confirmation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name }),
        });
      }
    } catch (error) {
      console.error("Failed to save quiz submission:", error);
    }
  };

  // Listen for Calendly events
  useEffect(() => {
    const handleCalendlyEvent = (e: MessageEvent) => {
      if (e.data.event === "calendly.event_scheduled") {
        trackCallBooked();
        saveQuizData();
      }
    };

    window.addEventListener("message", handleCalendlyEvent);
    return () => window.removeEventListener("message", handleCalendlyEvent);
  }, []);

  useEffect(() => {
    if (!calendlyUrl || !containerRef.current || isInitialized) return;

    // Get prefill data from sessionStorage
    let prefillEmail = "";
    let prefillName = "";
    const quizDataStr = sessionStorage.getItem("quizData");
    if (quizDataStr) {
      try {
        const quizData = JSON.parse(quizDataStr);
        if (quizData.contact?.email) {
          prefillEmail = quizData.contact.email;
        }
        if (quizData.contact?.name) {
          prefillName = quizData.contact.name;
        }
      } catch {
        console.error("Failed to parse quiz data");
      }
    }

    const initWidget = () => {
      if (window.Calendly && containerRef.current && !isInitialized) {
        setIsInitialized(true);

        // Build URL with colors
        const params = new URLSearchParams();
        if (prefillName) params.set("name", prefillName);
        if (prefillEmail) params.set("email", prefillEmail);
        params.set("background_color", "2d3a40");
        params.set("text_color", "ebebeb");
        params.set("primary_color", "e1b98f");
        params.set("hide_gdpr_banner", "1");

        const url = `${calendlyUrl}?${params.toString()}`;
        console.log("Calendly widget URL:", url);

        window.Calendly.initInlineWidget({
          url,
          parentElement: containerRef.current,
          prefill: {
            ...(prefillName && { name: prefillName }),
            ...(prefillEmail && { email: prefillEmail }),
          },
        });

        // Hide loader after widget renders (colors work with Calendly Pro+ plans)
        setTimeout(() => setIsLoading(false), 1000);
      }
    };

    // Load Calendly CSS for better styling control
    const cssLink = document.createElement("link");
    cssLink.href = "https://assets.calendly.com/assets/external/widget.css";
    cssLink.rel = "stylesheet";
    document.head.appendChild(cssLink);

    // Check if script is already loaded
    if (window.Calendly) {
      initWidget();
      return;
    }

    // Load Calendly widget script
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    script.onload = initWidget;
    document.head.appendChild(script);
  }, [calendlyUrl, isInitialized]);

  if (!calendlyUrl) {
    return (
      <div className="bg-[var(--color-primary-dark)] rounded-lg flex items-center justify-center" style={{ height: "700px" }}>
        <div className="text-center p-8">
          <svg
            className="w-16 h-16 mx-auto text-white/20 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-[var(--color-accent)] font-medium mb-1">
            Calendly Not Configured
          </p>
          <p className="text-white/50 text-sm">
            Add NEXT_PUBLIC_CALENDLY_URL to .env.local
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative rounded-lg overflow-hidden"
      style={{ minWidth: "320px", height: "700px", backgroundColor: "#2d3a40" }}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-[#2d3a40] flex items-center justify-center z-10">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-white/60 text-sm">Loading calendar...</p>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        style={{ minWidth: "320px", height: "700px" }}
      />
    </div>
  );
}
