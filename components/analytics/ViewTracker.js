"use client";

import { useEffect, useRef } from "react";

export default function ViewTracker({ entityId, type }) {
  const tracked = useRef(false);

  useEffect(() => {
    // Session Storage Key to prevent duplicate counts on refresh
    const storageKey = `tracked_${type}_${entityId}`;
    
    if (tracked.current || sessionStorage.getItem(storageKey)) {
        return;
    }

    const track = async () => {
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ entityId, type }),
        });
        
        sessionStorage.setItem(storageKey, "true");
        tracked.current = true;
      } catch (err) {
        console.warn("Tracking failed", err);
      }
    };

    // Delay slightly to ensure user actually "saw" the page (optional, keeping it simple for now)
    const timer = setTimeout(track, 2000); 

    return () => clearTimeout(timer);
  }, [entityId, type]);

  return null;
}
