-- Drop existing foreign key constraints
alter table public.approval_requests
  drop constraint if exists approval_requests_requested_by_fkey;

-- Add new foreign key constraint to reference user_profiles
alter table public.approval_requests
  add constraint approval_requests_requested_by_fkey
  foreign key (requested_by)
  references public.user_profiles(id);

-- Update existing records to use user_profile IDs
update public.approval_requests ar
set requested_by = up.id
from auth.users u
join public.user_profiles up on up.id = u.id
where ar.requested_by = u.id; 