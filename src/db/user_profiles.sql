create table
  public.user_profiles (
    id uuid not null,
    display_name character varying(255) not null,
    email character varying(255) not null,
    department character varying(255) null,
    position character varying(255) null,
    phone character varying(50) null,
    is_active boolean null default true,
    created_at timestamp with time zone null default current_timestamp,
    updated_at timestamp with time zone null default current_timestamp,
    constraint user_profiles_pkey primary key (id),
    constraint user_profiles_id_fkey foreign key (id) references auth.users (id)
  ) tablespace pg_default;

create index if not exists idx_user_profiles_email on public.user_profiles using btree (email) tablespace pg_default;

create index if not exists idx_user_profiles_is_active on public.user_profiles using btree (is_active) tablespace pg_default;

create trigger update_user_profiles_updated_at before
update on user_profiles for each row
execute function common_fields ();