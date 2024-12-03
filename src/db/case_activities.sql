-- 既存のトリガーを削除
DROP TRIGGER IF EXISTS case_history_trigger ON cases;
DROP FUNCTION IF EXISTS track_case_changes();

-- 既存のcase_historiesテーブルを削除
DROP TABLE IF EXISTS case_histories;

-- case_activitiesテーブルを作成
CREATE TABLE public.case_activities (
    id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
    case_id uuid NOT NULL,
    activity_type varchar(50) NOT NULL,
    activity_date timestamp with time zone NOT NULL,
    title varchar(200) NOT NULL,
    description text,
    next_action text,
    next_action_date date,
    created_at timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by uuid,
    is_deleted boolean DEFAULT false,
    CONSTRAINT case_activities_pkey PRIMARY KEY (id),
    CONSTRAINT case_activities_case_id_fkey FOREIGN KEY (case_id)
        REFERENCES public.cases(id) ON DELETE CASCADE,
    CONSTRAINT case_activities_created_by_fkey FOREIGN KEY (created_by)
        REFERENCES public.user_profiles(id),
    CONSTRAINT case_activities_updated_by_fkey FOREIGN KEY (updated_by)
        REFERENCES public.user_profiles(id),
    CONSTRAINT case_activities_type_check CHECK (
        activity_type = ANY (ARRAY[
            'meeting'::varchar,
            'call'::varchar,
            'email'::varchar,
            'visit'::varchar,
            'other'::varchar
        ])
    )
);

-- インデックスの作成
CREATE INDEX idx_case_activities_case_id ON public.case_activities(case_id);
CREATE INDEX idx_case_activities_activity_date ON public.case_activities(activity_date);
CREATE INDEX idx_case_activities_activity_type ON public.case_activities(activity_type);
CREATE INDEX idx_case_activities_next_action_date ON public.case_activities(next_action_date);
CREATE INDEX idx_case_activities_created_by ON public.case_activities(created_by);
CREATE INDEX idx_case_activities_is_deleted ON public.case_activities(is_deleted);

-- コメント
COMMENT ON TABLE public.case_activities IS '案件活動履歴';
COMMENT ON COLUMN public.case_activities.id IS '活動ID';
COMMENT ON COLUMN public.case_activities.case_id IS '案件ID';
COMMENT ON COLUMN public.case_activities.activity_type IS '活動種別（meeting: 打ち合わせ, call: 電話, email: メール, visit: 訪問, other: その他）';
COMMENT ON COLUMN public.case_activities.activity_date IS '活動日時';
COMMENT ON COLUMN public.case_activities.title IS '活動タイトル';
COMMENT ON COLUMN public.case_activities.description IS '活動内容';
COMMENT ON COLUMN public.case_activities.next_action IS '次のアクション';
COMMENT ON COLUMN public.case_activities.next_action_date IS '次のアクション期限';
COMMENT ON COLUMN public.case_activities.created_at IS '作成日時';
COMMENT ON COLUMN public.case_activities.created_by IS '作成者';
COMMENT ON COLUMN public.case_activities.updated_at IS '更新日時';
COMMENT ON COLUMN public.case_activities.updated_by IS '更新者';
COMMENT ON COLUMN public.case_activities.is_deleted IS '削除フラグ'; 