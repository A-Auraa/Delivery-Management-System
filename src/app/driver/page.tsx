import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/status-badge';
import { Phone, Navigation, PlayCircle } from 'lucide-react';

export default async function DriverPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'driver') redirect('/login');

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, amount, delivery_address, status, payment_method, customers(full_name, phone)')
    .eq('assigned_driver_id', user.id)
    .in('status', ['assigned', 'out_for_delivery'])
    .order('created_at', { ascending: true });

  const list = orders ?? [];
  const next = list[0] as any;

  return (
    <div className="min-h-screen bg-ink-50 pb-8">
      <header className="bg-route-700 px-4 pb-6 pt-8 text-white">
        <p className="text-sm text-route-100">Good day,</p>
        <h1 className="text-xl font-semibold">{profile?.full_name ?? 'Driver'}</h1>
        <div className="mt-4 flex gap-4 text-sm">
          <span>Today&apos;s Deliveries: <strong>{list.length}</strong></span>
        </div>
      </header>

      <div className="-mt-4 px-4">
        {next ? (
          <div className="rounded-lg border border-ink-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-400">Next Delivery</span>
              <StatusBadge status={next.status} />
            </div>
            <p className="mt-2 font-semibold text-ink-900">{next.order_number}</p>
            <p className="text-sm text-ink-600">{next.customers?.full_name}</p>
            <p className="text-sm text-ink-500">{next.delivery_address}</p>
            <p className="mt-1 text-sm font-medium text-ink-800">
              KSh {Number(next.amount).toLocaleString('en-KE')} · {next.payment_method ?? 'Unspecified'}
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <a
                href={`tel:${next.customers?.phone ?? ''}`}
                className="flex flex-col items-center gap-1 rounded-md border border-ink-200 py-2 text-xs text-ink-700"
              >
                <Phone size={16} /> Call
              </a>
              <button className="flex flex-col items-center gap-1 rounded-md border border-ink-200 py-2 text-xs text-ink-700">
                <Navigation size={16} /> Navigate
              </button>
              <button className="flex flex-col items-center gap-1 rounded-md bg-route-600 py-2 text-xs font-medium text-white">
                <PlayCircle size={16} /> Start
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-ink-200 bg-white p-8 text-center text-sm text-ink-400">
            No deliveries assigned right now.
          </div>
        )}

        {list.length > 1 && (
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-ink-400">Up next</p>
            {list.slice(1).map((o: any) => (
              <div key={o.id} className="rounded-md border border-ink-200 bg-white p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink-800">{o.order_number}</span>
                  <StatusBadge status={o.status} />
                </div>
                <p className="text-ink-500">{o.delivery_address}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
