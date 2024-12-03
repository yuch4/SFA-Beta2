create table
  public.quotes (
    id uuid not null default extensions.uuid_generate_v4 (),
    quote_number character varying(50) not null,
    case_id uuid null,
    quote_date date not null,
    valid_until date not null,
    customer_id uuid null,
    payment_terms text null,
    delivery_date date null,
    subtotal numeric(15, 2) not null default 0,
    tax_amount numeric(15, 2) not null default 0,
    total_amount numeric(15, 2) not null default 0,
    purchase_cost numeric(15, 2) not null default 0,
    profit_amount numeric(15, 2) not null default 0,
    profit_rate numeric(5, 2) not null default 0,
    subject text null,
    message text null,
    notes text null,
    internal_memo text null,
    status character varying(20) null,
    created_at timestamp with time zone null default current_timestamp,
    created_by uuid null,
    updated_at timestamp with time zone null default current_timestamp,
    updated_by uuid null,
    is_active boolean null default true,
    is_deleted boolean null default false,
    constraint quotes_pkey primary key (id),
    constraint quotes_quote_number_key unique (quote_number),
    constraint quotes_created_by_fkey foreign key (created_by) references user_profiles (id),
    constraint quotes_customer_id_fkey foreign key (customer_id) references customers (id),
    constraint quotes_case_id_fkey foreign key (case_id) references cases (id),
    constraint quotes_updated_by_fkey foreign key (updated_by) references user_profiles (id),
    constraint quotes_status_check check (
      (
        (status)::text = any (
          (
            array[
              'DRAFT'::character varying,
              'PENDING'::character varying,
              'APPROVED'::character varying,
              'REJECTED'::character varying,
              'EXPIRED'::character varying
            ]
          )::text[]
        )
      )
    )
  ) tablespace pg_default;

create index if not exists idx_quotes_quote_number on public.quotes using btree (quote_number) tablespace pg_default;

create index if not exists idx_quotes_case_id on public.quotes using btree (case_id) tablespace pg_default;

create index if not exists idx_quotes_customer_id on public.quotes using btree (customer_id) tablespace pg_default;

create index if not exists idx_quotes_status on public.quotes using btree (status) tablespace pg_default;

create index if not exists idx_quotes_created_by on public.quotes using btree (created_by) tablespace pg_default;

create index if not exists idx_quotes_updated_by on public.quotes using btree (updated_by) tablespace pg_default;