create table
  public.purchase_orders (
    id uuid not null default extensions.uuid_generate_v4 (),
    po_number character varying(50) not null,
    case_id uuid null,
    quote_id uuid null,
    supplier_id uuid null,
    po_date date not null,
    delivery_date date not null,
    payment_terms text null,
    delivery_location text null,
    subtotal numeric(15, 2) not null default 0,
    tax_amount numeric(15, 2) not null default 0,
    total_amount numeric(15, 2) not null default 0,
    subject text null,
    message text null,
    notes text null,
    internal_memo text null,
    status character varying(20) null,
    version integer not null default 1,
    cancellation_reason text null,
    cancellation_date timestamp with time zone null,
    cancelled_by uuid null,
    created_at timestamp with time zone null default current_timestamp,
    created_by uuid null,
    updated_at timestamp with time zone null default current_timestamp,
    updated_by uuid null,
    is_active boolean null default true,
    is_deleted boolean null default false,
    constraint purchase_orders_pkey primary key (id),
    constraint purchase_orders_po_number_key unique (po_number),
    constraint purchase_orders_created_by_fkey foreign key (created_by) references user_profiles (id),
    constraint purchase_orders_updated_by_fkey foreign key (updated_by) references user_profiles (id),
    constraint purchase_orders_case_id_fkey foreign key (case_id) references cases (id),
    constraint purchase_orders_cancelled_by_fkey foreign key (cancelled_by) references user_profiles (id),
    constraint purchase_orders_supplier_id_fkey foreign key (supplier_id) references suppliers (id),
    constraint purchase_orders_status_check check (
      (
        (status)::text = any (
          (
            array[
              'DRAFT'::character varying,
              'ORDERED'::character varying,
              'DELIVERED'::character varying,
              'COMPLETED'::character varying
            ]
          )::text[]
        )
      )
    )
  ) tablespace pg_default;

create index if not exists idx_purchase_orders_supplier_id on public.purchase_orders using btree (supplier_id) tablespace pg_default;

create index if not exists idx_purchase_orders_status on public.purchase_orders using btree (status) tablespace pg_default;

create index if not exists idx_purchase_orders_delivery_date on public.purchase_orders using btree (delivery_date) tablespace pg_default;

create index if not exists idx_purchase_orders_po_number on public.purchase_orders using btree (po_number) tablespace pg_default;

create index if not exists idx_purchase_orders_case_id on public.purchase_orders using btree (case_id) tablespace pg_default;

create index if not exists idx_purchase_orders_quote_id on public.purchase_orders using btree (quote_id) tablespace pg_default;