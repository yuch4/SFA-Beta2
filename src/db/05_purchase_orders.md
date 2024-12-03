# 発注管理 (purchase_orders)

発注書の基本情報を管理するテーブル

## カラム定義

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|----------|------|------------|------|
| id | uuid | NO | uuid_generate_v4() | 主キー |
| po_number | varchar | NO | - | 発注番号 |
| case_id | uuid | YES | - | 案件ID (FK) |
| quote_id | uuid | YES | - | 見積ID (FK) |
| supplier_id | uuid | YES | - | 仕入先ID (FK) |
| po_date | date | NO | - | 発注日 |
| delivery_date | date | NO | - | 納期 |
| payment_terms | text | YES | - | 支払条件 |
| delivery_location | text | YES | - | 納入場所 |
| subtotal | numeric | NO | 0 | 小計 |
| tax_amount | numeric | NO | 0 | 税額 |
| total_amount | numeric | NO | 0 | 合計金額 |
| subject | text | YES | - | 件名 |
| message | text | YES | - | メッセージ |
| notes | text | YES | - | 備考 |
| internal_memo | text | YES | - | 社内メモ |
| status | varchar | YES | - | ステータス |
| version | integer | NO | 1 | バージョン |
| cancellation_reason | text | YES | - | キャンセル理由 |
| cancellation_date | timestamptz | YES | - | キャンセル日時 |
| cancelled_by | uuid | YES | - | キャンセル実行者ID |
| created_at | timestamptz | YES | CURRENT_TIMESTAMP | 作成日時 |
| created_by | uuid | YES | - | 作成者ID |
| updated_at | timestamptz | YES | CURRENT_TIMESTAMP | 更新日時 |
| updated_by | uuid | YES | - | 更新者ID |
| is_active | boolean | YES | true | 有効フラグ |
| is_deleted | boolean | YES | false | 削除フラグ |

## RLS (Row Level Security)

```sql
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY purchase_orders_select ON purchase_orders FOR SELECT
    USING (
        (created_by = current_user_id()) OR
        EXISTS (
            SELECT 1 FROM quotes q 
            WHERE q.id = purchase_orders.quote_id 
            AND q.created_by = current_user_id()
        ) OR
        (has_role('admin')) OR
        (has_role('purchase_manager')) OR
        (has_role('purchase'))
    );

CREATE POLICY purchase_orders_insert ON purchase_orders FOR INSERT
    WITH CHECK (
        (has_role('purchase')) OR
        (has_role('admin'))
    );

CREATE POLICY purchase_orders_update ON purchase_orders FOR UPDATE
    USING (
        (created_by = current_user_id() AND has_role('purchase')) OR
        (has_role('purchase_manager')) OR
        (has_role('admin'))
    );

CREATE POLICY purchase_orders_delete ON purchase_orders FOR DELETE
    USING (
        (has_role('admin')) OR
        (has_role('purchase_manager'))
    );
```

## インデックス

```sql
CREATE INDEX idx_purchase_orders_quote_id ON purchase_orders(quote_id);
CREATE INDEX idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_created_by ON purchase_orders(created_by);
CREATE INDEX idx_purchase_orders_po_number ON purchase_orders(po_number);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_delivery_date ON purchase_orders(delivery_date);
CREATE INDEX idx_purchase_orders_case_id ON purchase_orders(case_id);
```

## トリガー

```sql
-- バージョン管理用トリガー
CREATE TRIGGER purchase_orders_version_trigger
    BEFORE UPDATE ON purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_version();

-- 履歴記録用トリガー
CREATE TRIGGER purchase_orders_history_trigger
    AFTER UPDATE ON purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION record_history();

-- 金額計算用トリガー
CREATE TRIGGER purchase_orders_calculate_amounts
    BEFORE INSERT OR UPDATE ON purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION calculate_purchase_order_amounts();

-- ステータス更新トリガー
CREATE TRIGGER purchase_orders_status_update
    AFTER UPDATE OF status ON purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION handle_status_change();
```

## 関連テーブル

- quotes (FK: quote_id)
- cases (FK: case_id)
- suppliers (FK: supplier_id)
- user_profiles (FK: created_by, updated_by, cancelled_by)
- purchase_order_items (逆参照)
- purchase_order_histories (逆参照)
- purchase_order_attachments (逆参照)
- purchase_order_deliveries (逆参照)

## 備考

### バージョン管理
- version カラムで改訂履歴を管理
- 変更履歴は purchase_order_histories テーブルに保存
- 過去バージョンの発注書は purchase_order_files に保管

### 承認フロー対応
- ステータス遷移：
  - draft: 下書き
  - pending_approval: 承認待ち
  - approved: 承認済
  - sent: 発注書送信済
  - acknowledged: 受領確認済
  - in_progress: 進行中
  - completed: 完了
  - cancelled: キャンセル

### 納期管理
- 納期遅延のモニタリング機能
- 納期変更履歴の管理
- 実績との差異分析

### 金額計算機能
- 明細の自動集計（小計、税額、合計）
- 見積金額との差異チェック
- 予算管理との連携

### キャンセル管理
- キャンセル理由の記録
- キャンセル日時の記録
- キャンセル実行者の記録
- キャンセル時の自動通知機能

### システム連携
- 会計システムとの連携
- 在庫管理システムとの連携
- 予算管理システムとの連携
