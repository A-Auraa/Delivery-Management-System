import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin' && profile?.role !== 'manager') {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen bg-ink-50">
      <Sidebar role={profile.role as 'admin' | 'manager'} />
      <div className="flex-1">
        <header className="flex h-14 items-center justify-between border-b border-ink-200 bg-white px-6">
          <div className="text-sm text-ink-500">
            Signed in as <span className="font-medium text-ink-800">{profile.full_name}</span>
          </div>
          <span className="rounded-sm bg-ink-100 px-2 py-0.5 text-xs font-medium capitalize text-ink-600">
            {profile.role}
          </span>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
