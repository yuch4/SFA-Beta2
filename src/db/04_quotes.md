# 見積管理 (quotes)

見積書の基本情報を管理するテーブル

## カラム定義

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|----------|------|------------|------|
| id | uuid | NO | uuid_generate_v4() | 主キー |
| quote_number | varchar | NO | - | 見積番号 |
| case_id | uuid | YES | - | 案件ID (FK) |
| quote_date | date | NO | - | 見積日 |
| valid_until | date | NO | - | 有効期限 |
| customer_id | uuid | YES | - | 顧客ID (FK) |
| payment_terms | text | YES | - | 支払条件 |
| delivery_date | date | YES | - | 納期 |
| subtotal | numeric | NO | 0 | 小計 |
| tax_amount | numeric | NO | 0 | 税額 |
| total_amount | numeric | NO | 0 | 合計金額 |
| purchase_cost | numeric | NO | 0 | 仕入原価 |
| profit_amount | numeric | NO | 0 | 利益額 |
| profit_rate | numeric | NO | 0 | 利益率 |
| subject | text | YES | - | 件名 |
| message | text | YES | - | メッセージ |
| notes | text | YES | - | 備考 |
| internal_memo | text | YES | - | 社内メモ |
| status | varchar | YES | - | ステータス |
| version | integer | NO | 1 | バージョン |
| created_at | timestamptz | YES | CURRENT_TIMESTAMP | 作成日時 |
| created_by | uuid | YES | - | 作成者ID |
| updated_at | timestamptz | YES | CURRENT_TIMESTAMP | 更新日時 |
| updated_by | uuid | YES | - | 更新者ID |
| is_active | boolean | YES | true | 有効フラグ |
| is_deleted | boolean | YES | false | 削除フラグ |

## RLS (Row Level Security)

```sql
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY quotes_select ON quotes FOR SELECT
    USING (
        (created_by = current_user_id()) OR
        EXISTS (
            SELECT 1 FROM cases c 
            WHERE c.id = quotes.case_id 
            AND (c.assigned_to = current_user_id() OR c.created_by = current_user_id())
        ) OR
        (has_role('admin')) OR
        (has_role('manager'))
    );

CREATE POLICY quotes_insert ON quotes FOR INSERT
    WITH CHECK (
        (has_role('sales')) OR
        (has_role('admin'))
    );

CREATE POLICY quotes_update ON quotes FOR UPDATE
    USING (
        (created_by = current_user_id() AND has_role('sales')) OR
        EXISTS (
            SELECT 1 FROM quote_approvals qa
            WHERE qa.quote_id = quotes.id
            AND qa.approver_id = current_user_id()
            AND qa.status = 'pending'
        ) OR
        (has_role('admin'))
    );

CREATE POLICY quotes_delete ON quotes FOR DELETE
    USING (has_role('admin'));
```

## インデックス

```sql
CREATE INDEX idx_quotes_case_id ON quotes(case_id);
CREATE INDEX idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX idx_quotes_created_by ON quotes(created_by);
CREATE INDEX idx_quotes_quote_number ON quotes(quote_number);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_profit_rate ON quotes(profit_rate);
CREATE INDEX idx_quotes_total_amount ON quotes(total_amount);
```

## トリガー

```sql
-- バージョン管理用トリガー
CREATE TRIGGER quotes_version_trigger
    BEFORE UPDATE ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION update_version();

-- 履歴記録用トリガー
CREATE TRIGGER quotes_history_trigger
    AFTER UPDATE ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION record_history();

-- 金額計算用トリガー
CREATE TRIGGER quotes_calculate_amounts
    BEFORE INSERT OR UPDATE ON quotes
    FOR EACH ROW
    EXECUTE FUNCTION calculate_quote_amounts();
```

## 関連テーブル

- cases (FK: case_id)
- customers (FK: customer_id)
- user_profiles (FK: created_by, updated_by)
- quote_items (逆参照)
- quote_histories (逆参照)
- quote_files (逆参照)
- quote_attachments (逆参照)
- quote_approvals (逆参照)
- purchase_orders (逆参照)

## 備考

### バージョン管理
- version カラムで改訂履歴を管理
- 変更履歴は quote_histories テーブルに保存
- 過去バージョンの見積書は quote_files に保管

### 承認フロー
- ステータス遷移：draft → pending → approved/rejected
- 利益率や総額に応じた承認ルートを設定可能
- 承認履歴は quote_approvals テーブルに記録

### 金額計算
- 明細の自動集計（小計、税額、合計）
- 原価情報に基づく利益額・利益率の自動計算
- 再計算トリガーによる整合性担保

### 添付ファイル
- 見積書本体：quote_files テーブルで管理
- 付属資料：quote_attachments テーブルで管理
- バージョン管理対応
