import type { LucideIcon } from 'lucide-react';

export function SummaryCard({
  label, value, icon: Icon, tone = 'default',
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: 'default' | 'good' | 'warn' | 'bad';
}) {
  const toneClass = {
    default: 'text-ink-700 bg-ink-100',
    good: 'text-signal-green bg-signal-green/10',
    warn: 'text-signal-amber bg-signal-amber/10',
    bad: 'text-signal-red bg-signal-red/10',
  }[tone];

  return (
    <div className="rounded-lg border border-ink-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-500">{label}</span>
        <span className={`flex h-7 w-7 items-center justify-center rounded-md ${toneClass}`}>
          <Icon size={14} />
        </span>
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-ink-900">{value}</div>
    </div>
  );
}
