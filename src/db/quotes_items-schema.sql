create table
  public.quote_items (
    id uuid not null default extensions.uuid_generate_v4 (),
    quote_id uuid null,
    item_order integer not null,
    item_type character varying(20) null,
    item_name text not null,
    quantity numeric(15, 2) null,
    unit character varying(50) null,
    unit_price numeric(15, 2) null,
    supplier_id uuid null,
    purchase_unit_price numeric(15, 2) null,
    amount numeric(15, 2) null,
    is_tax_applicable boolean null default true,
    created_at timestamp with time zone null default current_timestamp,
    created_by uuid null,
    updated_at timestamp with time zone null default current_timestamp,
    updated_by uuid null,
    is_active boolean null default true,
    is_deleted boolean null default false,
    constraint quote_items_pkey primary key (id),
    constraint unique_item_order unique (quote_id, item_order),
    constraint quote_items_supplier_id_fkey foreign key (supplier_id) references suppliers (id),
    constraint quote_items_updated_by_fkey foreign key (updated_by) references user_profiles (id),
    constraint quote_items_quote_id_fkey foreign key (quote_id) references quotes (id),
    constraint quote_items_created_by_fkey foreign key (created_by) references user_profiles (id),
    constraint quote_items_item_type_check check (
      (
        (item_type)::text = any (
          (
            array[
              'NORMAL'::character varying,
              'SUBTOTAL'::character varying,
              'DISCOUNT'::character varying
            ]
          )::text[]
        )
      )
    )
  ) tablespace pg_default;

create index if not exists idx_quote_items_quote_id on public.quote_items using btree (quote_id) tablespace pg_default;

create index if not exists idx_quote_items_supplier_id on public.quote_items using btree (supplier_id) tablespace pg_default;

create index if not exists idx_quote_items_item_order on public.quote_items using btree (quote_id, item_order) tablespace pg_default;