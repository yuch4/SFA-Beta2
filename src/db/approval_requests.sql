create table
  public.approval_requests (
    id uuid not null default extensions.uuid_generate_v4 (),
    approval_flow_id uuid not null,
    request_type character varying(50) not null,
    request_id uuid not null,
    status character varying(20) not null,
    requested_at timestamp with time zone not null default timezone ('utc'::text, now()),
    requested_by uuid not null,
    completed_at timestamp with time zone null,
    notes text null,
    created_at timestamp with time zone not null default timezone ('utc'::text, now()),
    updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
    created_by uuid not null,
    updated_by uuid not null,
    is_active boolean not null default true,
    is_deleted boolean not null default false,
    constraint approval_requests_pkey primary key (id),
    constraint approval_requests_approval_flow_id_fkey foreign key (approval_flow_id) references approval_flows (id),
    constraint approval_requests_created_by_fkey foreign key (created_by) references auth.users (id),
    constraint approval_requests_requested_by_fkey foreign key (requested_by) references auth.users (id),
    constraint approval_requests_updated_by_fkey foreign key (updated_by) references auth.users (id),
    constraint approval_requests_status_check check (
      (
        (status)::text = any (
          (
            array[
              'PENDING'::character varying,
              'APPROVED'::character varying,
              'REJECTED'::character varying
            ]
          )::text[]
        )
      )
    )
  ) tablespace pg_default;

create index if not exists idx_approval_requests_flow_id on public.approval_requests using btree (approval_flow_id) tablespace pg_default
where
  (is_deleted = false);

create index if not exists idx_approval_requests_status on public.approval_requests using btree (status) tablespace pg_default
where
  (is_deleted = false);