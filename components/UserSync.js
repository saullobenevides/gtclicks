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
          await fetch('/api/users/sync', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              id: user.id,
              name: user.displayName,
              email: user.primaryEmail,
              image: user.profileImageUrl
            }) 
          });
          console.log('User synced with DB');
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