'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, Truck, Users, CreditCard,
  Calendar, Map, BarChart3, FileText, Bell, Settings, LogOut, TruckIcon,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/orders', label: 'Orders', icon: Package },
  { href: '/dashboard/deliveries', label: 'Deliveries', icon: Truck },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/drivers', label: 'Drivers', icon: Truck },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
  { href: '/dashboard/map', label: 'Live Map', icon: Map },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/reports', label: 'Reports', icon: FileText },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, adminOnly: true },
];

export function Sidebar({ role }: { role: 'admin' | 'manager' }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-ink-200 bg-white md:flex">
      <div className="flex h-14 items-center gap-2 border-b border-ink-200 px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-route-600 text-white">
          <TruckIcon size={15} />
        </div>
        <span className="text-sm font-semibold tracking-tight text-ink-900">Delivery Ops</span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {NAV_ITEMS.filter((item) => !item.adminOnly || role === 'admin').map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition ${
                active
                  ? 'bg-route-50 font-medium text-route-700'
                  : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-ink-200 p-2">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-ink-600 transition hover:bg-ink-50 hover:text-ink-900"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
}
