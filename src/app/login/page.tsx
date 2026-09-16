'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Truck, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(params.get('next') || '/');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-route-600 text-white">
            <Truck size={18} />
          </div>
          <span className="text-lg font-semibold tracking-tight text-ink-900">Delivery Ops</span>
        </div>

        <div className="rounded-lg border border-ink-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-ink-900">Sign in</h1>
          <p className="mt-1 text-sm text-ink-500">Use the account issued to you by your business.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-route-500 focus:ring-1 focus:ring-route-500"
                placeholder="you@business.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-ink-700">
                  Password
                </label>
                <a href="/reset-password" className="text-xs text-route-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-route-500 focus:ring-1 focus:ring-route-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-sm bg-signal-red/10 px-3 py-2 text-sm text-signal-red">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-route-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-route-700 disabled:opacity-60"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
