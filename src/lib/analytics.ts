// Google Analytics 4 Event Tracking

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

// Helper to safely call gtag
function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
}

// Page view tracking (automatic in GA4, but useful for SPAs)
export function trackPageView(url: string) {
  gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
    page_path: url,
  });
}

// Quiz Events
export function trackQuizStarted() {
  gtag("event", "quiz_started", {
    event_category: "quiz",
    event_label: "User started the quiz",
  });
}

export function trackQuizQuestionAnswered(
  questionNumber: number,
  questionId: string,
  answer: string
) {
  gtag("event", "quiz_question_answered", {
    event_category: "quiz",
    question_number: questionNumber,
    question_id: questionId,
    answer: answer,
  });
}

export function trackQuizCompleted(outcome: string, score?: number) {
  gtag("event", "quiz_completed", {
    event_category: "quiz",
    event_label: outcome,
    outcome: outcome,
    score: score,
  });
}

// Conversion Events
export function trackCallBooked() {
  gtag("event", "call_booked", {
    event_category: "conversion",
    event_label: "User booked a discovery call",
  });
}

export function trackWaitlistJoined(city?: string) {
  gtag("event", "waitlist_joined", {
    event_category: "conversion",
    event_label: "User joined the waitlist",
    city: city || "not_specified",
  });
}

export function trackNewsletterSubscribed(source: string) {
  gtag("event", "newsletter_subscribed", {
    event_category: "conversion",
    event_label: "User subscribed to newsletter",
    source: source,
  });
}

// Engagement Events
export function trackCtaClicked(ctaName: string, location: string) {
  gtag("event", "cta_clicked", {
    event_category: "engagement",
    cta_name: ctaName,
    location: location,
  });
}

export function trackQuizAbandoned(lastQuestionNumber: number) {
  gtag("event", "quiz_abandoned", {
    event_category: "quiz",
    event_label: `Abandoned at question ${lastQuestionNumber}`,
    last_question: lastQuestionNumber,
  });
}
