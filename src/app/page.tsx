import { auth } from '@/lib/auth/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { data: session } = await auth.getSession();

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
                <form action="/api/auth/sign-out" method="POST">
                  <Button type="submit" variant="outline" size="sm">
                    Sign Out
                  </Button>
                </form>
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
            {/* TerminalLogin component */}
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4 text-center">2. Terminal Home</h2>
            {/* TerminalHome component */}
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4 text-center">3. Product Search</h2>
            {/* ProductSearch component */}
          </div>
        </div>
      </div>
    </main>
  );
}
