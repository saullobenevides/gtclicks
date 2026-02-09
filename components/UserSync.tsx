"use client";

import { useUser } from "@stackframe/stack";
import { useEffect, useRef } from "react";

function UserSyncInner() {
  const user = useUser({ or: "return-null" });
  const syncedRef = useRef(false);

  useEffect(() => {
    if (user && !syncedRef.current) {
      syncedRef.current = true;

      const syncUser = async () => {
        try {
          await fetch("/api/users/sync", {
            method: "POST",
          });
          console.log("User synced with DB");
        } catch (error) {
          console.error("Failed to sync user:", error);
        }
      };

      syncUser();
    }
  }, [user]);

  return null;
}

export default function UserSync() {
  return <UserSyncInner />;
}
