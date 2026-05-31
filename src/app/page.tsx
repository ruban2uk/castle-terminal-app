'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth/client';

export default function Home() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authClient.getSession().then((result: any) => {
      setSession(result.data);
      setLoading(false);
      if (result.data?.user) {
        router.push('/retailer/dashboard');
      }
    }).catch(() => {
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-950 rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Castle Terminal App</h1>
            <p className="text-zinc-600 mt-1">B2B Digital Value Terminal</p>
          </div>
          <div>
            {session?.user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm text-zinc-600">
                  Welcome, <strong>{session.user.name}</strong>
                </span>
                <Link href="/api/auth/sign-out">
                  <Button variant="outline" size="sm">Sign Out</Button>
                </Link>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/auth/sign-in">
                  <Button variant="outline" size="sm">Sign In</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          <div>
            <h2 className="text-lg font-semibold mb-4 text-center">1. Terminal Login</h2>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4 text-center">2. Terminal Home</h2>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4 text-center">3. Product Search</h2>
          </div>
        </div>
      </div>
    </main>
  );
}
