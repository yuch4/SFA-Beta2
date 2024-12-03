# 承認フロー関連テーブル

## approval_flow_templates
承認フローのテンプレートを管理するマスターテーブル

### カラム定義
| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|----------|------|------------|------|
| id | uuid | NO | uuid_generate_v4() | 主キー |
| template_code | varchar | NO | - | テンプレートコード |
| template_name | varchar | NO | - | テンプレート名 |
| description | text | YES | - | 説明 |
| target_type | varchar | YES | - | 対象種別（quotes/purchase_orders） |
| created_at | timestamptz | YES | CURRENT_TIMESTAMP | 作成日時 |
| created_by | uuid | YES | - | 作成者ID |
| updated_at | timestamptz | YES | CURRENT_TIMESTAMP | 更新日時 |
| updated_by | uuid | YES | - | 更新者ID |
| is_active | boolean | YES | true | 有効フラグ |
| is_deleted | boolean | YES | false | 削除フラグ |

### インデックス
```sql
CREATE INDEX idx_approval_flow_templates_target_type ON approval_flow_templates(target_type);
CREATE INDEX idx_approval_flow_templates_template_code ON approval_flow_templates(template_code);
```

## approval_flow_steps
承認フローの各ステップを定義するテーブル

### カラム定義
| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|----------|------|------------|------|
| id | uuid | NO | uuid_generate_v4() | 主キー |
| template_id | uuid | YES | - | テンプレートID (FK) |
| step_order | integer | NO | - | ステップ順序 |
| step_name | varchar | NO | - | ステップ名 |
| description | text | YES | - | 説明 |
| approver_type | varchar | YES | - | 承認者タイプ |
| approver_id | uuid | YES | - | 承認者ID |
| is_skippable | boolean | YES | false | スキップ可能フラグ |
| created_at | timestamptz | YES | CURRENT_TIMESTAMP | 作成日時 |
| created_by | uuid | YES | - | 作成者ID |
| updated_at | timestamptz | YES | CURRENT_TIMESTAMP | 更新日時 |
| updated_by | uuid | YES | - | 更新者ID |
| is_active | boolean | YES | true | 有効フラグ |
| is_deleted | boolean | YES | false | 削除フラグ |

### インデックス
```sql
CREATE INDEX idx_approval_flow_steps_template_id ON approval_flow_steps(template_id);
CREATE INDEX idx_approval_flow_steps_step_order ON approval_flow_steps(step_order);
CREATE INDEX idx_approval_flow_steps_approver_id ON approval_flow_steps(approver_id);
```

## approval_flow_instances
実行中の承認フローインスタンスを管理するテーブル

### カラム定義
| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|----------|------|------------|------|
| id | uuid | NO | uuid_generate_v4() | 主キー |
| template_id | uuid | YES | - | テンプレートID (FK) |
| target_type | varchar | YES | - | 対象種別 |
| target_id | uuid | NO | - | 対象ID |
| current_step | integer | YES | - | 現在のステップ |
| status | varchar | YES | - | ステータス |
| started_at | timestamptz | YES | CURRENT_TIMESTAMP | 開始日時 |
| completed_at | timestamptz | YES | - | 完了日時 |
| created_at | timestamptz | YES | CURRENT_TIMESTAMP | 作成日時 |
| created_by | uuid | YES | - | 作成者ID |
| updated_at | timestamptz | YES | CURRENT_TIMESTAMP | 更新日時 |
| updated_by | uuid | YES | - | 更新者ID |

### インデックス
```sql
CREATE INDEX idx_approval_flow_instances_template_id ON approval_flow_instances(template_id);
CREATE INDEX idx_approval_flow_instances_target_id ON approval_flow_instances(target_id);
CREATE INDEX idx_approval_flow_instances_status ON approval_flow_instances(status);
```

## approval_step_records
承認ステップの実行記録を管理するテーブル

### カラム定義
| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|----------|------|------------|------|
| id | uuid | NO | uuid_generate_v4() | 主キー |
| instance_id | uuid | YES | - | インスタンスID (FK) |
| step_id | uuid | YES | - | ステップID (FK) |
| step_order | integer | NO | - | ステップ順序 |
| status | varchar | YES | - | ステータス |
| approver_id | uuid | YES | - | 承認者ID |
| approved_at | timestamptz | YES | - | 承認日時 |
| comments | text | YES | - | コメント |
| created_at | timestamptz | YES | CURRENT_TIMESTAMP | 作成日時 |
| updated_at | timestamptz | YES | CURRENT_TIMESTAMP | 更新日時 |

### インデックス
```sql
CREATE INDEX idx_approval_step_records_instance_id ON approval_step_records(instance_id);
CREATE INDEX idx_approval_step_records_step_id ON approval_step_records(step_id);
CREATE INDEX idx_approval_step_records_approver_id ON approval_step_records(approver_id);
```

## 承認フロー関連のRLSポリシー

### approval_flow_templates
```sql
ALTER TABLE approval_flow_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY approval_flow_templates_select ON approval_flow_templates FOR SELECT
    USING (has_role('admin') OR has_role('manager'));

CREATE POLICY approval_flow_templates_insert ON approval_flow_templates FOR INSERT
    WITH CHECK (has_role('admin'));

CREATE POLICY approval_flow_templates_update ON approval_flow_templates FOR UPDATE
    USING (has_role('admin'));
```

### approval_flow_steps
```sql
ALTER TABLE approval_flow_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY approval_flow_steps_select ON approval_flow_steps FOR SELECT
    USING (has_role('admin') OR has_role('manager'));

CREATE POLICY approval_flow_steps_insert ON approval_flow_steps FOR INSERT
    WITH CHECK (has_role('admin'));

CREATE POLICY approval_flow_steps_update ON approval_flow_steps FOR UPDATE
    USING (has_role('admin'));
```

## 備考

### ステータス種別
- pending: 承認待ち
- approved: 承認済
- rejected: 否認
- skipped: スキップ
- cancelled: キャンセル

### 承認者タイプ
- user: 特定のユーザー
- role: 特定のロール
- department: 特定の部門
- manager: 申請者の上長
- auto: 自動承認

### トリガー
- 承認ステップ完了時の次ステップ自動作成
- 承認完了時の対象レコードステータス更新
- 否認時の対象レコードステータス更新
- スキップ可能条件の評価

### 通知連携
- 承認依頼通知の自動送信
- 承認/否認結果の通知
- 承認期限切れアラート
- エスカレーション通知
