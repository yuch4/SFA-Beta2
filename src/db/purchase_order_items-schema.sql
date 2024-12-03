create table
  public.purchase_order_items (
    id uuid not null default extensions.uuid_generate_v4 (),
    po_id uuid not null,
    quote_item_id uuid null,
    item_order integer not null,
    item_code character varying(100) null,
    item_name text not null,
    specifications text null,
    quantity numeric(15, 2) null,
    unit character varying(50) null,
    unit_price numeric(15, 2) null,
    amount numeric(15, 2) null,
    notes text null,
    internal_memo text null,
    created_at timestamp with time zone null default current_timestamp,
    created_by uuid null,
    updated_at timestamp with time zone null default current_timestamp,
    updated_by uuid null,
    is_active boolean null default true,
    is_deleted boolean null default false,
    constraint purchase_order_items_pkey primary key (id),
    constraint unique_po_item_order unique (po_id, item_order),
    constraint purchase_order_items_created_by_fkey foreign key (created_by) references user_profiles (id),
    constraint purchase_order_items_po_id_fkey foreign key (po_id) references purchase_orders (id),
    constraint purchase_order_items_updated_by_fkey foreign key (updated_by) references user_profiles (id)
  ) tablespace pg_default;

create index if not exists idx_po_items_po_id on public.purchase_order_items using btree (po_id) tablespace pg_default;

create index if not exists idx_po_items_quote_item_id on public.purchase_order_items using btree (quote_item_id) tablespace pg_default;

create index if not exists idx_po_items_item_order on public.purchase_order_items using btree (po_id, item_order) tablespace pg_default;