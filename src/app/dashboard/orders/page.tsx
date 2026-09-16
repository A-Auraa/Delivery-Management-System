import Link from 'next/link';
import { Plus, Search, PackageX } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { StatusBadge } from '@/components/status-badge';
import { PaymentBadge } from '@/components/payment-badge';
import type { OrderStatus } from '@/types/database';

const STATUS_OPTIONS: { value: OrderStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function formatKsh(amount: number) {
  return `KSh ${amount.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const supabase = createClient();
  const q = (searchParams.q ?? '').trim();
  const status = (searchParams.status ?? '') as OrderStatus | '';

  let customerIds: string[] = [];
  if (q) {
    const { data: matches } = await supabase
      .from('customers')
      .select('id')
      .or(`full_name.ilike.%${q}%,phone.ilike.%${q}%`);
    customerIds = (matches ?? []).map((c) => c.id);
  }

  let query = supabase
    .from('orders')
    .select(`
      id, order_number, amount, delivery_address, status, payment_status, created_at,
      customers ( full_name, phone ),
      driver:profiles!orders_assigned_driver_id_fkey ( full_name )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  if (status) query = query.eq('status', status);
  if (q) {
    const orParts = [`order_number.ilike.%${q}%`];
    if (customerIds.length) orParts.push(`customer_id.in.(${customerIds.join(',')})`);
    query = query.or(orParts.join(','));
  }

  const { data: orders, error } = await query;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink-900">Orders</h1>
          <p className="mt-1 text-sm text-ink-500">Every order, its delivery status, and payment status.</p>
        </div>
        <Link
          href="/dashboard/orders/new"
          className="flex items-center gap-1.5 rounded-md bg-route-600 px-3 py-2 text-sm font-medium text-white hover:bg-route-700"
        >
          <Plus size={16} /> New order
        </Link>
      </div>

      <form className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search order ID, customer, or phone..."
            className="w-full rounded-md border border-ink-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-route-500 focus:ring-1 focus:ring-route-500"
          />
        </div>
        <select
          name="status"
          defaultValue={status}
          className="rounded-md border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-route-500 focus:ring-1 focus:ring-route-500"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button type="submit" className="rounded-md border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">
          Filter
        </button>
      </form>

      <div className="mt-5 overflow-x-auto rounded-lg border border-ink-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink-200 text-left text-xs font-medium uppercase tracking-wide text-ink-400">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Driver</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o: any) => (
              <tr key={o.id} className="border-b border-ink-100 last:border-0 hover:bg-ink-50/50">
                <td className="px-4 py-3 font-medium text-ink-900">{o.order_number}</td>
                <td className="px-4 py-3">
                  <div className="text-ink-800">{o.customers?.full_name ?? '—'}</div>
                  <div className="text-xs text-ink-400">{o.customers?.phone}</div>
                </td>
                <td className="px-4 py-3 text-ink-800">{formatKsh(Number(o.amount))}</td>
                <td className="max-w-[180px] truncate px-4 py-3 text-ink-600">{o.delivery_address}</td>
                <td className="px-4 py-3 text-ink-600">{o.driver?.full_name ?? '— Unassigned'}</td>
                <td className="px-4 py-3 text-ink-500">
                  {new Date(o.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                </td>
                <td className="px-4 py-3"><PaymentBadge status={o.payment_status} /></td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>

        {(!orders || orders.length === 0) && (
          <div className="flex flex-col items-center gap-2 py-14 text-center">
            <PackageX size={28} className="text-ink-300" />
            <p className="text-sm text-ink-500">
              {q || status ? 'No orders match your search.' : 'No orders yet.'}
            </p>
            {!q && !status && (
              <Link href="/dashboard/orders/new" className="text-sm font-medium text-route-600 hover:underline">
                Create your first order
              </Link>
            )}
          </div>
        )}

        {error && (
          <p className="px-4 py-3 text-sm text-signal-red">
            Couldn&apos;t load orders: {error.message}
          </p>
        )}
      </div>
    </div>
  );
}
