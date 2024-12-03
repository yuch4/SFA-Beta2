create table
  public.case_histories (
    id uuid not null default extensions.uuid_generate_v4 (),
    case_id uuid null,
    field_name character varying(100) not null,
    old_value text null,
    new_value text null,
    changed_at timestamp with time zone null default current_timestamp,
    changed_by uuid null,
    change_type character varying(50) null,
    constraint case_histories_pkey primary key (id),
    constraint case_histories_case_id_fkey foreign key (case_id) references cases (id),
    constraint case_histories_changed_by_fkey foreign key (changed_by) references user_profiles (id),
    constraint fk_changed_by foreign key (changed_by) references user_profiles (id)
  ) tablespace pg_default;

create index if not exists idx_case_histories_case_id on public.case_histories using btree (case_id) tablespace pg_default;

create index if not exists idx_case_histories_changed_at on public.case_histories using btree (changed_at) tablespace pg_default;

create index if not exists idx_case_histories_changed_by on public.case_histories using btree (changed_by) tablespace pg_default;