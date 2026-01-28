// HubSpot Contact Properties - DTO Types

export interface HubSpotContactProperties {
  // Core contact info
  firstname: string;
  email: string;
  phone: string;

  // Lead source
  lead_soource: "Website" | "App";

  // Location (simplified from quiz Q1)
  location: "Matchmaking Location" | "Waitlist Location";

  // Quiz answers (Q2-Q5 full text)
  intent: string;
  availability: string;
  investment: string;
  timeline: string;

  // Quiz result
  quiz_outcome: "Qualified" | "Waitlist" | "Not-ready";

  // Status fields
  user_status: "No info" | string;
  access_to_ailo_unlimited: "In Review" | "Rejected" | string;

  // Optional: Call status (set by Calendly/manual)
  call_status?: "Call Scheduled" | string;
}

export interface HubSpotContactPayload {
  properties: HubSpotContactProperties;
}

// Quiz submission input (what we receive from the frontend)
export interface QuizSubmissionInput {
  name: string;
  email: string;
  phone: string;
  answers: {
    q1?: string; // Location
    q2?: string; // Intent
    q3?: string; // Availability
    q4?: string; // Investment
    q5?: string; // Timeline
  };
  outcome: "qualified" | "waitlist" | "not-ready";
}

// Allowed values for dropdowns
export const QUIZ_OUTCOMES = {
  qualified: "Qualified",
  waitlist: "Waitlist",
  "not-ready": "Not-ready",
} as const;

export const LOCATIONS = {
  southFlorida: "Matchmaking Location",
  outsideSouthFlorida: "Waitlist Location",
} as const;

export const ACCESS_STATUS = {
  inReview: "In Review",
  rejected: "Rejected",
} as const;

export const USER_STATUS = {
  noInfo: "No info",
} as const;

export const LEAD_SOURCE = {
  website: "Website",
  app: "App",
} as const;
