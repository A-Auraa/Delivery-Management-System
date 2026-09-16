'use client';

import { useEffect, useState, useTransition } from 'react';
import { Search, UserPlus, X, Loader2 } from 'lucide-react';
import { createOrder, searchCustomers } from './actions';

type CustomerHit = { id: string; full_name: string; phone: string };

const inputClass =
  'mt-1 w-full rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-route-500 focus:ring-1 focus:ring-route-500';
const labelClass = 'block text-sm font-medium text-ink-700';

export function OrderForm() {
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('existing');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CustomerHit[]>([]);
  const [selected, setSelected] = useState<CustomerHit | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (customerMode !== 'existing' || selected || !query.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      const hits = await searchCustomers(query);
      setResults(hits);
      setSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, customerMode, selected]);

  function handleSubmit(formData: FormData) {
    setError(null);
    if (customerMode === 'existing' && !selected) {
      setError('Select an existing customer, or switch to "New customer".');
      return;
    }
    formData.set('customerMode', customerMode);
    if (selected) formData.set('customerId', selected.id);

    startTransition(async () => {
      try {
        await createOrder(formData);
      } catch (e: any) {
        // NEXT_REDIRECT is thrown by a successful redirect() inside the server action — not a real error.
        if (e?.digest?.startsWith?.('NEXT_REDIRECT')) throw e;
        setError(e.message ?? 'Something went wrong');
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Customer */}
      <section className="rounded-lg border border-ink-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-ink-900">Customer</h2>
          <div className="flex rounded-md border border-ink-200 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => { setCustomerMode('existing'); setError(null); }}
              className={`rounded px-2.5 py-1 ${customerMode === 'existing' ? 'bg-route-600 text-white' : 'text-ink-600'}`}
            >
              Existing
            </button>
            <button
              type="button"
              onClick={() => { setCustomerMode('new'); setSelected(null); setError(null); }}
              className={`rounded px-2.5 py-1 ${customerMode === 'new' ? 'bg-route-600 text-white' : 'text-ink-600'}`}
            >
              New customer
            </button>
          </div>
        </div>

        {customerMode === 'existing' ? (
          <div className="mt-3">
            {selected ? (
              <div className="flex items-center justify-between rounded-md border border-route-200 bg-route-50 px-3 py-2 text-sm">
                <span>
                  <strong className="text-ink-900">{selected.full_name}</strong>{' '}
                  <span className="text-ink-500">{selected.phone}</span>
                </span>
                <button
                  type="button"
                  onClick={() => { setSelected(null); setQuery(''); }}
                  className="text-ink-400 hover:text-ink-700"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name or phone..."
                  className={`${inputClass} pl-9`}
                />
                {searching && (
                  <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-ink-400" />
                )}
                {results.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border border-ink-200 bg-white shadow-sm">
                    {results.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setSelected(c); setResults([]); }}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-ink-50"
                      >
                        <span className="text-ink-900">{c.full_name}</span>
                        <span className="text-ink-500">{c.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
                {!searching && query.trim() && results.length === 0 && (
                  <p className="mt-2 text-xs text-ink-400">
                    No matches. <button type="button" onClick={() => setCustomerMode('new')} className="text-route-600 underline">Create a new customer</button> instead?
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Full name</label>
              <input name="newCustomerName" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input name="newCustomerPhone" required className={inputClass} placeholder="07XX XXX XXX" />
            </div>
            <div>
              <label className={labelClass}>Email (optional)</label>
              <input name="newCustomerEmail" type="email" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Address (optional)</label>
              <input name="newCustomerAddress" className={inputClass} />
            </div>
          </div>
        )}
      </section>

      {/* Order details */}
      <section className="rounded-lg border border-ink-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-ink-900">Order details</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>Product / order description</label>
            <input name="description" required className={inputClass} placeholder="e.g. 2x office chairs" />
          </div>
          <div>
            <label className={labelClass}>Quantity</label>
            <input name="quantity" type="number" min={1} defaultValue={1} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Amount (KSh)</label>
            <input name="amount" type="number" min={0} step="0.01" required className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Delivery address</label>
            <input name="deliveryAddress" required className={inputClass} placeholder="e.g. Kilimani, Nairobi" />
          </div>
          <div>
            <label className={labelClass}>Preferred delivery date</label>
            <input name="preferredDate" type="date" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Preferred delivery time</label>
            <input name="preferredTime" type="time" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Payment method</label>
            <select name="paymentMethod" className={inputClass} defaultValue="">
              <option value="">Not specified</option>
              <option value="mpesa">M-Pesa</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Payment status</label>
            <select name="paymentStatus" className={inputClass} defaultValue="pending">
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="partially_paid">Partially Paid</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Notes</label>
            <textarea name="notes" rows={3} className={inputClass} />
          </div>
        </div>
      </section>

      {error && <p className="rounded-sm bg-signal-red/10 px-3 py-2 text-sm text-signal-red">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 rounded-md bg-route-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-route-700 disabled:opacity-60"
        >
          {pending && <Loader2 size={16} className="animate-spin" />}
          <UserPlus size={16} />
          Create order
        </button>
      </div>
    </form>
  );
}
