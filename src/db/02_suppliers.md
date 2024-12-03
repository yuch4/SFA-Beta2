# 仕入先管理 (suppliers)

仕入先情報を管理するマスターテーブル

## カラム定義

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|----------|------|------------|------|
| id | uuid | NO | uuid_generate_v4() | 主キー |
| supplier_code | varchar | NO | - | 仕入先コード |
| supplier_name | varchar | NO | - | 仕入先名 |
| supplier_name_kana | varchar | YES | - | 仕入先名カナ |
| supplier_type | varchar | YES | - | 仕入先区分 |
| address | text | YES | - | 住所 |
| phone | varchar | YES | - | 電話番号 |
| email | varchar | YES | - | メールアドレス |
| contact_person | varchar | YES | - | 担当者名 |
| contact_phone | varchar | YES | - | 担当者電話番号 |
| department | varchar | YES | - | 部署 |
| payment_terms | text | YES | - | 支払条件 |
| transaction_start_date | date | YES | - | 取引開始日 |
| purchase_terms | text | YES | - | 購買条件 |
| notes | text | YES | - | 備考 |
| created_at | timestamptz | YES | CURRENT_TIMESTAMP | 作成日時 |
| created_by | uuid | YES | - | 作成者ID |
| updated_at | timestamptz | YES | CURRENT_TIMESTAMP | 更新日時 |
| updated_by | uuid | YES | - | 更新者ID |
| is_active | boolean | YES | true | 有効フラグ |
| is_deleted | boolean | YES | false | 削除フラグ |

## RLS (Row Level Security)

```sql
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY suppliers_select ON suppliers FOR SELECT
    USING (
        (has_role('purchase')) OR
        (has_role('admin'))
    );

CREATE POLICY suppliers_insert ON suppliers FOR INSERT
    WITH CHECK (
        (has_role('purchase_manager')) OR
        (has_role('admin'))
    );

CREATE POLICY suppliers_update ON suppliers FOR UPDATE
    USING (
        (has_role('purchase_manager')) OR
        (has_role('admin'))
    );

CREATE POLICY suppliers_delete ON suppliers FOR DELETE
    USING (has_role('admin'));
```

## インデックス

```sql
CREATE INDEX idx_suppliers_supplier_code ON suppliers(supplier_code);
CREATE UNIQUE INDEX idx_suppliers_email ON suppliers(email) WHERE is_deleted = false;
CREATE INDEX idx_suppliers_created_by ON suppliers(created_by);
CREATE INDEX idx_suppliers_supplier_name ON suppliers(supplier_name);
CREATE INDEX idx_suppliers_supplier_name_kana ON suppliers(supplier_name_kana);
```

## 関連テーブル

- purchase_orders (逆参照)
- quote_items (逆参照)
- user_profiles (FK: created_by, updated_by)

## 備考

- 仕入先情報のマスターテーブルとして機能
- 取引条件や支払条件の管理を本テーブルで実施
- supplier_codeはシステム内で一意となるように管理
- 論理削除（is_deleted）を採用し、物理削除は原則行わない
- 仕入先との取引履歴は関連する発注テーブルから参照可能
