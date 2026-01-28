"use client";

import { useCallback, useEffect, useState } from "react";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

export function useRecaptcha() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) {
      console.warn("RECAPTCHA_SITE_KEY not configured");
      setIsReady(true); // Allow form to work without reCAPTCHA
      return;
    }

    // Check if script already loaded
    if (window.grecaptcha) {
      window.grecaptcha.ready(() => setIsReady(true));
      return;
    }

    // Load reCAPTCHA script
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      window.grecaptcha.ready(() => setIsReady(true));
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup if component unmounts before script loads
      const existingScript = document.querySelector(`script[src*="recaptcha"]`);
      if (existingScript && !window.grecaptcha) {
        existingScript.remove();
      }
    };
  }, []);

  const executeRecaptcha = useCallback(async (action: string): Promise<string | null> => {
    if (!RECAPTCHA_SITE_KEY) {
      return null; // No token if not configured
    }

    if (!isReady || !window.grecaptcha) {
      console.error("reCAPTCHA not ready");
      return null;
    }

    try {
      const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
      return token;
    } catch (error) {
      console.error("reCAPTCHA execution error:", error);
      return null;
    }
  }, [isReady]);

  return { isReady, executeRecaptcha };
}
