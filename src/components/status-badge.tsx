import {
  Clock, CheckCircle2, Truck, PackageCheck, XCircle, Ban, CircleDot,
} from 'lucide-react';
import type { OrderStatus } from '@/types/database';

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string; icon: any }> = {
  pending: { label: 'Pending', className: 'bg-signal-amber/10 text-signal-amber border-signal-amber/30', icon: Clock },
  confirmed: { label: 'Confirmed', className: 'bg-signal-blue/10 text-signal-blue border-signal-blue/30', icon: CircleDot },
  assigned: { label: 'Assigned', className: 'bg-signal-blue/10 text-signal-blue border-signal-blue/30', icon: Truck },
  out_for_delivery: { label: 'Out for Delivery', className: 'bg-signal-violet/10 text-signal-violet border-signal-violet/30', icon: Truck },
  delivered: { label: 'Delivered', className: 'bg-signal-green/10 text-signal-green border-signal-green/30', icon: CheckCircle2 },
  failed: { label: 'Failed', className: 'bg-signal-red/10 text-signal-red border-signal-red/30', icon: XCircle },
  cancelled: { label: 'Cancelled', className: 'bg-signal-gray/10 text-signal-gray border-signal-gray/30', icon: Ban },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <span className={`status-badge ${config.className}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}
