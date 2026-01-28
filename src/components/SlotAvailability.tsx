"use client";

import { useEffect, useState } from "react";

export function SlotAvailability() {
  const [slots, setSlots] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSlots() {
      try {
        const response = await fetch("/api/calendly-availability");
        const data = await response.json();
        if (data.slots !== null) {
          setSlots(data.slots);
        }
      } catch (error) {
        console.error("Failed to fetch slot availability:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSlots();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-white/30 rounded-full animate-pulse" />
        <span className="text-xs text-white/50">Checking availability...</span>
      </div>
    );
  }

  if (slots === null) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
      <span className="text-xs text-white/70">
        {slots} {slots === 1 ? "slot" : "slots"} this week
      </span>
    </div>
  );
}
