'use client';

import { Suspense } from 'react';
import { WalletContent } from './WalletContent';

export const dynamic = 'force-dynamic';

export default function WalletPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-950 rounded-full animate-spin" />
      </div>
    }>
      <WalletContent />
    </Suspense>
  );
}
