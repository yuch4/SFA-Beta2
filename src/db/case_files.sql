create table
  public.case_files (
    id uuid not null default extensions.uuid_generate_v4 (),
    case_id uuid null,
    file_name character varying(255) not null,
    file_path text not null,
    file_size integer not null,
    mime_type character varying(100) null,
    uploaded_at timestamp with time zone null default current_timestamp,
    uploaded_by uuid null,
    version integer null default 1,
    is_deleted boolean null default false,
    constraint case_files_pkey primary key (id),
    constraint case_files_case_id_fkey foreign key (case_id) references cases (id),
    constraint case_files_uploaded_by_fkey foreign key (uploaded_by) references user_profiles (id),
    constraint fk_uploaded_by foreign key (uploaded_by) references user_profiles (id)
  ) tablespace pg_default;

create index if not exists idx_case_files_case_id on public.case_files using btree (case_id) tablespace pg_default;

create index if not exists idx_case_files_uploaded_by on public.case_files using btree (uploaded_by) tablespace pg_default;