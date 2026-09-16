import { CheckCircle2, Clock, CircleDot, XCircle, RotateCcw } from 'lucide-react';
import type { PaymentStatus } from '@/types/database';

const CONFIG: Record<PaymentStatus, { label: string; className: string; icon: any }> = {
  paid: { label: 'Paid', className: 'bg-signal-green/10 text-signal-green border-signal-green/30', icon: CheckCircle2 },
  pending: { label: 'Pending', className: 'bg-signal-amber/10 text-signal-amber border-signal-amber/30', icon: Clock },
  partially_paid: { label: 'Partial', className: 'bg-signal-blue/10 text-signal-blue border-signal-blue/30', icon: CircleDot },
  failed: { label: 'Failed', className: 'bg-signal-red/10 text-signal-red border-signal-red/30', icon: XCircle },
  refunded: { label: 'Refunded', className: 'bg-signal-gray/10 text-signal-gray border-signal-gray/30', icon: RotateCcw },
};

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const config = CONFIG[status];
  const Icon = config.icon;
  return (
    <span className={`status-badge ${config.className}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}
