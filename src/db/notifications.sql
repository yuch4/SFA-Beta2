create table
  public.notifications (
    id uuid not null default extensions.uuid_generate_v4 (),
    user_id uuid not null,
    type character varying(50) not null,
    title character varying(255) not null,
    message text not null,
    link text null,
    is_read boolean not null default false,
    created_at timestamp with time zone not null default timezone ('utc'::text, now()),
    created_by uuid not null,
    is_deleted boolean not null default false,
    constraint notifications_pkey primary key (id),
    constraint notifications_user_id_fkey foreign key (user_id) references user_profiles (id),
    constraint notifications_created_by_fkey foreign key (created_by) references user_profiles (id)
  ) tablespace pg_default;

create index if not exists idx_notifications_user_id on public.notifications using btree (user_id) tablespace pg_default
where
  (is_deleted = false);

create index if not exists idx_notifications_is_read on public.notifications using btree (is_read) tablespace pg_default
where
  (is_deleted = false); 