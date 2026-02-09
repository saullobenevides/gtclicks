"use client";

import { useEffect, useRef } from "react";

interface ViewTrackerProps {
  entityId: string;
  type: string;
}

export default function ViewTracker({ entityId, type }: ViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
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

    const timer = setTimeout(track, 2000);

    return () => clearTimeout(timer);
  }, [entityId, type]);

  return null;
}
