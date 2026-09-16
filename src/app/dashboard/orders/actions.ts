'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function searchCustomers(query: string) {
  if (!query.trim()) return [];
  const supabase = createClient();
  const { data } = await supabase
    .from('customers')
    .select('id, full_name, phone')
    .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%`)
    .limit(8);
  return data ?? [];
}

export async function createOrder(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const customerMode = formData.get('customerMode') as string;
  let customerId = formData.get('customerId') as string;

  if (customerMode === 'new') {
    const name = (formData.get('newCustomerName') as string)?.trim();
    const phone = (formData.get('newCustomerPhone') as string)?.trim();
    if (!name || !phone) throw new Error('New customer needs a name and phone number');

    const { data: customer, error: custErr } = await supabase
      .from('customers')
      .insert({
        full_name: name,
        phone,
        email: (formData.get('newCustomerEmail') as string) || null,
        address: (formData.get('newCustomerAddress') as string) || null,
      })
      .select('id')
      .single();

    if (custErr || !customer) throw new Error(custErr?.message ?? 'Failed to create customer');
    customerId = customer.id;
  }

  if (!customerId) throw new Error('Select or create a customer first');

  const description = (formData.get('description') as string)?.trim();
  const deliveryAddress = (formData.get('deliveryAddress') as string)?.trim();
  if (!description || !deliveryAddress) throw new Error('Description and delivery address are required');

  const { error } = await supabase.from('orders').insert({
    customer_id: customerId,
    description,
    quantity: Number(formData.get('quantity') ?? 1) || 1,
    amount: Number(formData.get('amount') ?? 0) || 0,
    delivery_address: deliveryAddress,
    preferred_date: (formData.get('preferredDate') as string) || null,
    preferred_time: (formData.get('preferredTime') as string) || null,
    payment_method: (formData.get('paymentMethod') as string) || null,
    payment_status: (formData.get('paymentStatus') as string) || 'pending',
    notes: (formData.get('notes') as string) || null,
    status: 'pending',
    created_by: user.id,
  });

  if (error) throw new Error(error.message);

  revalidatePath('/dashboard/orders');
  revalidatePath('/dashboard');
  redirect('/dashboard/orders');
}
