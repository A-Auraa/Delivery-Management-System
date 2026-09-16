-- Run this in Supabase SQL Editor (in addition to the original schema.sql).
-- Adds auto-generated order numbers like ORD-1000, ORD-1001, ...

create sequence if not exists public.orders_number_seq start with 1000;

create or replace function public.set_order_number()
returns trigger language plpgsql as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number := 'ORD-' || nextval('public.orders_number_seq');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_orders_number on public.orders;
create trigger trg_orders_number
  before insert on public.orders
  for each row execute function public.set_order_number();
