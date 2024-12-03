create table
  public.cases (
    id uuid not null default extensions.uuid_generate_v4 (),
    case_number character varying(50) not null,
    case_name character varying(200) not null,
    customer_id uuid null,
    project_code_id uuid null,
    expected_revenue numeric(15, 2) not null default 0,
    expected_profit numeric(15, 2) not null default 0,
    status_id uuid null,
    probability character varying(1) null,
    expected_order_date date null,
    expected_accounting_date date null,
    assigned_to uuid null,
    description text null,
    notes text null,
    created_at timestamp with time zone null default current_timestamp,
    created_by uuid null,
    updated_at timestamp with time zone null default current_timestamp,
    updated_by uuid null,
    is_active boolean null default true,
    is_deleted boolean null default false,
    constraint cases_pkey primary key (id),
    constraint cases_case_number_key unique (case_number),
    constraint cases_customer_id_fkey foreign key (customer_id) references customers (id),
    constraint fk_updated_by foreign key (updated_by) references user_profiles (id),
    constraint cases_created_by_fkey foreign key (created_by) references user_profiles (id),
    constraint cases_assigned_to_fkey foreign key (assigned_to) references user_profiles (id),
    constraint cases_project_code_id_fkey foreign key (project_code_id) references project_codes (id),
    constraint cases_status_id_fkey foreign key (status_id) references statuses (id),
    constraint cases_updated_by_fkey foreign key (updated_by) references user_profiles (id),
    constraint fk_assigned_to foreign key (assigned_to) references user_profiles (id),
    constraint fk_created_by foreign key (created_by) references user_profiles (id),
    constraint cases_probability_check check (
      (
        (probability)::text = any (
          (
            array[
              'S'::character varying,
              'A'::character varying,
              'B'::character varying,
              'C'::character varying,
              'D'::character varying
            ]
          )::text[]
        )
      )
    )
  ) tablespace pg_default;

create index if not exists idx_cases_case_number on public.cases using btree (case_number) tablespace pg_default;

create index if not exists idx_cases_customer_id on public.cases using btree (customer_id) tablespace pg_default;

create index if not exists idx_cases_project_code_id on public.cases using btree (project_code_id) tablespace pg_default;

create index if not exists idx_cases_status_id on public.cases using btree (status_id) tablespace pg_default;

create index if not exists idx_cases_probability on public.cases using btree (probability) tablespace pg_default;

create index if not exists idx_cases_expected_order_date on public.cases using btree (expected_order_date) tablespace pg_default;

create index if not exists idx_cases_expected_accounting_date on public.cases using btree (expected_accounting_date) tablespace pg_default;

create index if not exists idx_cases_assigned_to on public.cases using btree (assigned_to) tablespace pg_default;

create index if not exists idx_cases_created_by on public.cases using btree (created_by) tablespace pg_default;

create index if not exists idx_cases_updated_by on public.cases using btree (updated_by) tablespace pg_default;

create trigger case_history_trigger
after
update on cases for each row
execute function track_case_changes ();