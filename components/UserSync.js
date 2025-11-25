'use client';

import { useUser } from '@stackframe/stack';
import { useEffect, useRef } from 'react';

export default function UserSync() {
  const user = useUser();
  const syncedRef = useRef(false);

  useEffect(() => {
    if (user && !syncedRef.current) {
      syncedRef.current = true;
      
      fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          email: user.primaryEmail,
          name: user.displayName,
        }),
      })
      .then(res => {
        if (!res.ok) {
          console.error('Failed to sync user');
          syncedRef.current = false; // Retry on next mount/update if failed
        }
      })
      .catch(err => {
        console.error('Error syncing user:', err);
        syncedRef.current = false;
      });
    }
  }, [user]);

  return null;
}
