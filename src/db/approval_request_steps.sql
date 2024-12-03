create table
  public.approval_request_steps (
    id uuid not null default extensions.uuid_generate_v4 (),
    approval_request_id uuid not null,
    step_order integer not null,
    approver_id uuid not null,
    status character varying(20) not null,
    approved_at timestamp with time zone null,
    rejected_at timestamp with time zone null,
    comments text null,
    created_at timestamp with time zone not null default timezone ('utc'::text, now()),
    updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
    created_by uuid not null,
    updated_by uuid not null,
    is_active boolean not null default true,
    is_deleted boolean not null default false,
    constraint approval_request_steps_pkey primary key (id),
    constraint approval_request_steps_approval_request_id_step_order_key unique (approval_request_id, step_order),
    constraint approval_request_steps_approval_request_id_fkey foreign key (approval_request_id) references approval_requests (id),
    constraint approval_request_steps_created_by_fkey foreign key (created_by) references auth.users (id),
    constraint approval_request_steps_approver_id_fkey foreign key (approver_id) references user_profiles (id),
    constraint approval_request_steps_updated_by_fkey foreign key (updated_by) references auth.users (id),
    constraint approval_request_steps_status_check check (
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

create index if not exists idx_approval_request_steps_request_id on public.approval_request_steps using btree (approval_request_id) tablespace pg_default
where
  (is_deleted = false);

create index if not exists idx_approval_request_steps_status on public.approval_request_steps using btree (status) tablespace pg_default
where
  (is_deleted = false);