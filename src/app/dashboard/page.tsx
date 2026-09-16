import {
  Package, Clock, Truck, CheckCircle2, XCircle, Wallet, AlertCircle, Users,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { SummaryCard } from '@/components/summary-card';

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function formatKsh(amount: number) {
  return `KSh ${amount.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
}

export default async function DashboardPage() {
  const supabase = createClient();
  const todayStart = startOfToday();

  const [
    totalOrders,
    pendingOrders,
    outForDelivery,
    deliveredToday,
    failedDeliveries,
    todaysPayments,
    outstandingPayments,
    activeDrivers,
  ] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'out_for_delivery'),
    supabase.from('orders').select('id', { count: 'exact', head: true })
      .eq('status', 'delivered').gte('updated_at', todayStart),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'failed'),
    supabase.from('payments').select('amount').eq('status', 'paid').gte('paid_at', todayStart),
    supabase.from('orders').select('amount').in('payment_status', ['pending', 'partially_paid']),
    supabase.from('profiles').select('id', { count: 'exact', head: true })
      .eq('role', 'driver').in('driver_status', ['online', 'available', 'busy']),
  ]);

  const todaysRevenue = (todaysPayments.data ?? []).reduce((sum, p) => sum + Number(p.amount), 0);
  const outstanding = (outstandingPayments.data ?? []).reduce((sum, o) => sum + Number(o.amount), 0);

  const cards = [
    { label: 'Total Orders', value: String(totalOrders.count ?? 0), icon: Package, tone: 'default' as const },
    { label: 'Pending Orders', value: String(pendingOrders.count ?? 0), icon: Clock, tone: 'warn' as const },
    { label: 'Out for Delivery', value: String(outForDelivery.count ?? 0), icon: Truck, tone: 'default' as const },
    { label: 'Delivered Today', value: String(deliveredToday.count ?? 0), icon: CheckCircle2, tone: 'good' as const },
    { label: 'Failed Deliveries', value: String(failedDeliveries.count ?? 0), icon: XCircle, tone: 'bad' as const },
    { label: "Today's Revenue", value: formatKsh(todaysRevenue), icon: Wallet, tone: 'good' as const },
    { label: 'Outstanding Payments', value: formatKsh(outstanding), icon: AlertCircle, tone: 'warn' as const },
    { label: 'Active Drivers', value: String(activeDrivers.count ?? 0), icon: Users, tone: 'default' as const },
  ];

  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight text-ink-900">Overview</h1>
      <p className="mt-1 text-sm text-ink-500">A snapshot of today&apos;s delivery operations.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <SummaryCard key={c.label} label={c.label} value={c.value} icon={c.icon} tone={c.tone} />
        ))}
      </div>

      <div className="mt-8 rounded-lg border border-dashed border-ink-200 bg-white p-8 text-center text-sm text-ink-400">
        Charts (delivery performance, revenue, status breakdown, driver performance) land in Phase 2 —
        Orders, Customers, Drivers and Delivery Assignment come first.
      </div>
    </div>
  );
}
