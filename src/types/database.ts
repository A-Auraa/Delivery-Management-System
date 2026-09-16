export type UserRole = 'admin' | 'manager' | 'driver' | 'customer';
export type OrderStatus =
  | 'pending' | 'confirmed' | 'assigned' | 'out_for_delivery'
  | 'delivered' | 'failed' | 'cancelled';
export type PaymentMethod = 'mpesa' | 'cash' | 'card' | 'bank_transfer' | 'other';
export type PaymentStatus = 'paid' | 'pending' | 'partially_paid' | 'failed' | 'refunded';
export type DriverStatus = 'online' | 'offline' | 'available' | 'busy';
export type FailureReason =
  | 'customer_unavailable' | 'incorrect_address' | 'customer_refused'
  | 'payment_problem' | 'vehicle_problem' | 'other';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  driver_status: DriverStatus | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  notes: string | null;
  profile_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  description: string;
  quantity: number;
  amount: number;
  delivery_address: string;
  delivery_lat: number | null;
  delivery_lng: number | null;
  preferred_date: string | null;
  preferred_time: string | null;
  notes: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod | null;
  payment_status: PaymentStatus;
  assigned_driver_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Delivery {
  id: string;
  order_id: string;
  driver_id: string | null;
  started_at: string | null;
  completed_at: string | null;
  delivery_notes: string | null;
  proof_photo_url: string | null;
  proof_signature_url: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  gps_verified: boolean;
  failure_reason: FailureReason | null;
  failure_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  customer_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  collected_by: string | null;
  paid_at: string | null;
  created_at: string;
}

// Minimal Database type so @supabase/ssr generics are satisfied.
// Replace with `supabase gen types typescript --local` output once your schema is live.
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      customers: { Row: Customer; Insert: Partial<Customer>; Update: Partial<Customer> };
      orders: { Row: Order; Insert: Partial<Order>; Update: Partial<Order> };
      deliveries: { Row: Delivery; Insert: Partial<Delivery>; Update: Partial<Delivery> };
      payments: { Row: Payment; Insert: Partial<Payment>; Update: Partial<Payment> };
    };
  };
};
