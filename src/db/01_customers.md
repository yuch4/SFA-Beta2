# 顧客管理 (customers)

顧客情報を管理するマスターテーブル

## カラム定義

| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|----------|------|------------|------|
| id | uuid | NO | uuid_generate_v4() | 主キー |
| customer_code | varchar | NO | - | 顧客コード |
| customer_name | varchar | NO | - | 顧客名 |
| customer_name_kana | varchar | YES | - | 顧客名カナ |
| customer_type | varchar | YES | - | 顧客区分 |
| address | text | YES | - | 住所 |
| phone | varchar | YES | - | 電話番号 |
| email | varchar | YES | - | メールアドレス |
| contact_person | varchar | YES | - | 担当者名 |
| contact_phone | varchar | YES | - | 担当者電話番号 |
| department | varchar | YES | - | 部署 |
| payment_terms | text | YES | - | 支払条件 |
| credit_limit | numeric | YES | - | 与信限度額 |
| transaction_start_date | date | YES | - | 取引開始日 |
| notes | text | YES | - | 備考 |
| created_at | timestamptz | YES | CURRENT_TIMESTAMP | 作成日時 |
| created_by | uuid | YES | - | 作成者ID |
| updated_at | timestamptz | YES | CURRENT_TIMESTAMP | 更新日時 |
| updated_by | uuid | YES | - | 更新者ID |
| is_active | boolean | YES | true | 有効フラグ |
| is_deleted | boolean | YES | false | 削除フラグ |

## RLS (Row Level Security)

```sql
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY customers_select ON customers FOR SELECT
    USING (
        (has_role('sales')) OR
        (has_role('admin'))
    );

CREATE POLICY customers_insert ON customers FOR INSERT
    WITH CHECK (
        (has_role('sales_manager')) OR
        (has_role('admin'))
    );

CREATE POLICY customers_update ON customers FOR UPDATE
    USING (
        (has_role('sales_manager')) OR
        (has_role('admin'))
    );

CREATE POLICY customers_delete ON customers FOR DELETE
    USING (has_role('admin'));
```

## インデックス

```sql
CREATE INDEX idx_customers_customer_code ON customers(customer_code);
CREATE UNIQUE INDEX idx_customers_email ON customers(email) WHERE is_deleted = false;
CREATE INDEX idx_customers_created_by ON customers(created_by);
CREATE INDEX idx_customers_customer_name ON customers(customer_name);
CREATE INDEX idx_customers_customer_name_kana ON customers(customer_name_kana);
```

## 関連テーブル

- cases (逆参照)
- quotes (逆参照)
- user_profiles (FK: created_by, updated_by)

## 備考

- 顧客情報のマスターテーブルとして機能
- 与信管理や取引条件の管理も本テーブルで実施
- customer_codeはシステム内で一意となるように管理
- 論理削除（is_deleted）を採用し、物理削除は原則行わない
