import { useEffect, useState } from 'react';

export interface BansifyUser {
  id?: string;
  name?: string;
  username?: string;
  email?: string;
  avatarUrl?: string | null;
}

export type SessionState = 'checking' | 'signed-in' | 'guest';

/**
 * Reads the Bansify session from Accounts. The cookie lives on .bansify.com, so the call
 * has to carry credentials; a failure is not an error — guests can still join a room.
 */
export function useBansifySession(accountsOrigin = 'https://accounts.bansify.com') {
  const [state, setState] = useState<SessionState>('checking');
  const [user, setUser] = useState<BansifyUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${accountsOrigin}/api/auth/me`, {
          credentials: 'include',
          headers: { accept: 'application/json' },
        });
        if (!res.ok) throw new Error('not signed in');
        const body = (await res.json()) as { authenticated?: boolean; user?: BansifyUser };
        if (cancelled) return;
        if (body?.authenticated && body.user) {
          setUser(body.user);
          setState('signed-in');
        } else {
          setState('guest');
        }
      } catch {
        if (!cancelled) setState('guest');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accountsOrigin]);

  return { state, user };
}
