-- 承認フローマスターテーブル
create table approval_flows (
  id uuid default uuid_generate_v4() primary key,
  flow_name varchar(100) not null,
  description text,
  status varchar(20) not null check (status in ('ACTIVE', 'INACTIVE')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) not null,
  updated_by uuid references auth.users(id) not null,
  is_active boolean default true not null,
  is_deleted boolean default false not null,
  foreign key (created_by) references user_profiles(id),
  foreign key (updated_by) references user_profiles(id)
);

comment on table approval_flows is '承認フローマスター';
comment on column approval_flows.id is '承認フローID';
comment on column approval_flows.flow_name is 'フロー名';
comment on column approval_flows.description is '説明';
comment on column approval_flows.status is 'ステータス';
comment on column approval_flows.created_at is '作成日時';
comment on column approval_flows.updated_at is '更新日時';
comment on column approval_flows.created_by is '作成者';
comment on column approval_flows.updated_by is '更新者';
comment on column approval_flows.is_active is '有効フラグ';
comment on column approval_flows.is_deleted is '削除フラグ';

-- 承認フローステップテーブル
create table approval_flow_steps (
  id uuid default uuid_generate_v4() primary key,
  approval_flow_id uuid references approval_flows(id) not null,
  step_order integer not null,
  approver_id uuid not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid not null,
  updated_by uuid not null,
  is_active boolean default true not null,
  is_deleted boolean default false not null,
  unique (approval_flow_id, step_order),
  foreign key (approver_id) references user_profiles(id),
  foreign key (created_by) references user_profiles(id),
  foreign key (updated_by) references user_profiles(id)
);

comment on table approval_flow_steps is '承認フローステップ';
comment on column approval_flow_steps.id is 'ステップID';
comment on column approval_flow_steps.approval_flow_id is '承認フローID';
comment on column approval_flow_steps.step_order is 'ステップ順序';
comment on column approval_flow_steps.approver_id is '承認者';
comment on column approval_flow_steps.created_at is '作成日時';
comment on column approval_flow_steps.updated_at is '更新日時';
comment on column approval_flow_steps.created_by is '作成者';
comment on column approval_flow_steps.updated_by is '更新者';
comment on column approval_flow_steps.is_active is '有効フラグ';
comment on column approval_flow_steps.is_deleted is '削除フラグ';

-- 承認申請テーブル
create table approval_requests (
  id uuid default uuid_generate_v4() primary key,
  approval_flow_id uuid references approval_flows(id) not null,
  request_type varchar(50) not null,
  request_id uuid not null,
  status varchar(20) not null check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  requested_at timestamp with time zone default timezone('utc'::text, now()) not null,
  requested_by uuid references auth.users(id) not null,
  completed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) not null,
  updated_by uuid references auth.users(id) not null,
  is_active boolean default true not null,
  is_deleted boolean default false not null
);

comment on table approval_requests is '承認申請';
comment on column approval_requests.id is '申請ID';
comment on column approval_requests.approval_flow_id is '承認フローID';
comment on column approval_requests.request_type is '申請種別';
comment on column approval_requests.request_id is '申請対象ID';
comment on column approval_requests.status is 'ステータス';
comment on column approval_requests.requested_at is '申請日時';
comment on column approval_requests.requested_by is '申請者';
comment on column approval_requests.completed_at is '完了日時';
comment on column approval_requests.notes is '備考';
comment on column approval_requests.created_at is '作成日時';
comment on column approval_requests.updated_at is '更新日時';
comment on column approval_requests.created_by is '作成者';
comment on column approval_requests.updated_by is '更新者';
comment on column approval_requests.is_active is '有効フラグ';
comment on column approval_requests.is_deleted is '削除フラグ';

-- 承認申請ステップテーブル
create table approval_request_steps (
  id uuid default uuid_generate_v4() primary key,
  approval_request_id uuid references approval_requests(id) not null,
  step_order integer not null,
  approver_id uuid references auth.users(id) not null,
  status varchar(20) not null check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  approved_at timestamp with time zone,
  rejected_at timestamp with time zone,
  comments text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id) not null,
  updated_by uuid references auth.users(id) not null,
  is_active boolean default true not null,
  is_deleted boolean default false not null,
  unique (approval_request_id, step_order)
);

comment on table approval_request_steps is '承認申請ステップ';
comment on column approval_request_steps.id is 'ステップID';
comment on column approval_request_steps.approval_request_id is '承認申請ID';
comment on column approval_request_steps.step_order is 'ステップ順序';
comment on column approval_request_steps.approver_id is '承認者';
comment on column approval_request_steps.status is 'ステータス';
comment on column approval_request_steps.approved_at is '承認日時';
comment on column approval_request_steps.rejected_at is '却下日時';
comment on column approval_request_steps.comments is 'コメント';
comment on column approval_request_steps.created_at is '作成日時';
comment on column approval_request_steps.updated_at is '更新日時';
comment on column approval_request_steps.created_by is '作成者';
comment on column approval_request_steps.updated_by is '更新者';
comment on column approval_request_steps.is_active is '有効フラグ';
comment on column approval_request_steps.is_deleted is '削除フラグ';

-- RLSポリシーの設定
alter table approval_flows enable row level security;
alter table approval_flow_steps enable row level security;
alter table approval_requests enable row level security;
alter table approval_request_steps enable row level security;

-- 承認フローの参照ポリシー
create policy "承認フローの参照は全ユーザーに許可" on approval_flows
  for select
  to authenticated
  using (is_deleted = false);

-- 承認フローの作成・更新・削除ポリシー
create policy "承認フローの作成は全ユーザーに許可" on approval_flows
  for insert
  to authenticated
  with check (true);

create policy "承認フローの更新は全ユーザーに許可" on approval_flows
  for update
  to authenticated
  using (true);

-- 承認フローステップの参照ポリシー
create policy "承認フローステップの参照は全ユーザーに許可" on approval_flow_steps
  for select
  to authenticated
  using (is_deleted = false);

-- 承認フローステップの作成・更新・削除ポリシー
create policy "承認フローステップの作成は全ユーザーに許可" on approval_flow_steps
  for insert
  to authenticated
  with check (true);

create policy "承認フローステップの更新は全ユーザーに許可" on approval_flow_steps
  for update
  to authenticated
  using (true);

-- 承認申請の参照ポリシー
create policy "承認申請の参照は申請者と承認者に許可" on approval_requests
  for select
  to authenticated
  using (
    is_deleted = false and (
      requested_by = auth.uid() or
      exists (
        select 1
        from approval_request_steps ars
        where ars.approval_request_id = id
        and ars.approver_id = auth.uid()
        and ars.is_deleted = false
      )
    )
  );

-- 承認申請の作成・更新ポリシー
create policy "承認申請の作成は全ユーザーに許可" on approval_requests
  for insert
  to authenticated
  with check (true);

create policy "承認申請の更新は申請者と承認者に許可" on approval_requests
  for update
  to authenticated
  using (
    requested_by = auth.uid() or
    exists (
      select 1
      from approval_request_steps ars
      where ars.approval_request_id = id
      and ars.approver_id = auth.uid()
      and ars.is_deleted = false
    )
  );

-- 承認申請ステップの参照ポリシー
create policy "承認申請ステップの参照は申請者と承認者に許可" on approval_request_steps
  for select
  to authenticated
  using (
    is_deleted = false and (
      exists (
        select 1
        from approval_requests ar
        where ar.id = approval_request_id
        and ar.requested_by = auth.uid()
      ) or
      approver_id = auth.uid()
    )
  );

-- 承認申請ステップの作成・更新ポリシー
create policy "承認申請ステップの作成は全ユーザーに許可" on approval_request_steps
  for insert
  to authenticated
  with check (true);

create policy "承認申請ステップの更新は承認者のみ許可" on approval_request_steps
  for update
  to authenticated
  using (approver_id = auth.uid());

-- インデックスの作成
create index idx_approval_flows_status on approval_flows(status) where is_deleted = false;
create index idx_approval_flow_steps_flow_id on approval_flow_steps(approval_flow_id) where is_deleted = false;
create index idx_approval_requests_flow_id on approval_requests(approval_flow_id) where is_deleted = false;
create index idx_approval_requests_status on approval_requests(status) where is_deleted = false;
create index idx_approval_request_steps_request_id on approval_request_steps(approval_request_id) where is_deleted = false;
create index idx_approval_request_steps_status on approval_request_steps(status) where is_deleted = false; 