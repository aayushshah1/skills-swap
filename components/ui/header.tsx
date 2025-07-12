'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getSession();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/login');
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 shadow">
      <Link href="/" className="text-lg font-bold">
        Skill Swap
      </Link>

      <nav className="flex gap-4 items-center">
        {user ? (
          <>
            <Link href="/swap-requests">Swap Requests</Link>
            <Link href="/profile">
              <Avatar>
                <img src="/default-user.png" alt="Profile" className="rounded-full w-8 h-8" />
              </Avatar>
            </Link>
            <Button variant="ghost" onClick={handleLogout}>Logout</Button>
          </>
        ) : (
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        )}
      </nav>
    </header>
  );
}
