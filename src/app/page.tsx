import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

const ROLE_HOME: Record<string, string> = {
  admin: '/dashboard',
  manager: '/dashboard',
  driver: '/driver',
  customer: '/track',
};

export default async function RootPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  redirect(ROLE_HOME[profile?.role ?? 'customer'] ?? '/login');
}
