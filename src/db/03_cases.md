# 案件管理 (cases)

案件の基本情報を管理するテーブル

## カラム定義

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|----------|------|------------|------|
| id | uuid | NO | uuid_generate_v4() | 主キー |
| case_number | varchar | NO | - | 案件番号 |
| case_name | varchar | NO | - | 案件名 |
| customer_id | uuid | YES | - | 顧客ID (FK) |
| project_code_id | uuid | YES | - | プロジェクトコードID (FK) |
| expected_revenue | numeric | NO | 0 | 予想売上 |
| expected_profit | numeric | NO | 0 | 予想利益 |
| status_id | uuid | YES | - | ステータスID (FK) |
| probability | varchar | YES | - | 確度 |
| expected_order_date | date | YES | - | 受注予定日 |
| expected_accounting_date | date | YES | - | 売上計上予定日 |
| assigned_to | uuid | YES | - | 担当者ID (FK) |
| description | text | YES | - | 案件概要 |
| notes | text | YES | - | 備考 |
| created_at | timestamptz | YES | CURRENT_TIMESTAMP | 作成日時 |
| created_by | uuid | YES | - | 作成者ID |
| updated_at | timestamptz | YES | CURRENT_TIMESTAMP | 更新日時 |
| updated_by | uuid | YES | - | 更新者ID |
| is_active | boolean | YES | true | 有効フラグ |
| is_deleted | boolean | YES | false | 削除フラグ |

## RLS (Row Level Security)

```sql
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY cases_select ON cases FOR SELECT
    USING (
        (created_by = current_user_id()) OR 
        (assigned_to = current_user_id()) OR
        (has_role('admin')) OR
        (has_role('manager'))
    );

CREATE POLICY cases_insert ON cases FOR INSERT
    WITH CHECK (
        (has_role('sales')) OR
        (has_role('admin'))
    );

CREATE POLICY cases_update ON cases FOR UPDATE
    USING (
        (created_by = current_user_id() AND has_role('sales')) OR
        (assigned_to = current_user_id() AND has_role('sales')) OR
        (has_role('admin'))
    );

CREATE POLICY cases_delete ON cases FOR DELETE
    USING (has_role('admin'));
```

## インデックス

```sql
CREATE INDEX idx_cases_customer_id ON cases(customer_id);
CREATE INDEX idx_cases_assigned_to ON cases(assigned_to);
CREATE INDEX idx_cases_created_by ON cases(created_by);
CREATE INDEX idx_cases_status_id ON cases(status_id);
CREATE INDEX idx_cases_case_number ON cases(case_number);
CREATE INDEX idx_cases_project_code_id ON cases(project_code_id);
```

## トリガー

```sql
CREATE TRIGGER cases_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION audit_log();

CREATE TRIGGER cases_update_timestamp
    BEFORE UPDATE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
```

## 関連テーブル

- customers (FK: customer_id)
- project_codes (FK: project_code_id)
- statuses (FK: status_id)
- user_profiles (FK: assigned_to, created_by, updated_by)
- quotes (逆参照)
- case_histories (逆参照)
- case_files (逆参照)

## 備考

- 営業案件の基本情報を管理
- case_numberは自動採番で一意の値を設定
- 案件のライフサイクル全体を通じて使用
- 予実管理の基準となるテーブル
- 履歴管理と承認フローに対応
- assigned_toによる担当者管理を実装
