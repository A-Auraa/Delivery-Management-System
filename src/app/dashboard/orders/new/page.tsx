import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { OrderForm } from '../order-form';

export default function NewOrderPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/dashboard/orders" className="flex items-center gap-1 text-sm text-ink-500 hover:text-ink-800">
        <ArrowLeft size={14} /> Back to orders
      </Link>
      <h1 className="mt-2 text-xl font-semibold tracking-tight text-ink-900">New order</h1>
      <p className="mt-1 text-sm text-ink-500">
        Pick an existing customer or create a new one, then fill in the delivery details.
      </p>
      <div className="mt-6">
        <OrderForm />
      </div>
    </div>
  );
}
