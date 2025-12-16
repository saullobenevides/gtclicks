'use client';

import { useUser } from '@stackframe/stack';
import { useEffect, useRef, useState } from 'react';

function UserSyncInner() {
  const user = useUser({ or: 'ignore' }); // Safe usage now that it's client-only
  const syncedRef = useRef(false);

  useEffect(() => {
    if (user && !syncedRef.current) {
      syncedRef.current = true;

      const syncUser = async () => {
        try {
          // Assuming an API endpoint to sync user data if needed
          // await fetch('/api/users/sync', { method: 'POST', body: JSON.stringify({ userId: user.id }) });
          console.log('User synced (placeholder for actual sync logic)');
        } catch (error) {
          console.error('Failed to sync user:', error);
        }
      };

      syncUser();
    }
  }, [user]);

  return null;
}

export default function UserSync() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return <UserSyncInner />;
}