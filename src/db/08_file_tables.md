# ファイル管理関連テーブル

## case_files
案件に関連するファイルを管理するテーブル

### カラム定義
| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|----------|------|------------|------|
| id | uuid | NO | uuid_generate_v4() | 主キー |
| case_id | uuid | YES | - | 案件ID (FK) |
| file_name | varchar | NO | - | ファイル名 |
| file_path | text | NO | - | ファイルパス |
| file_size | integer | NO | - | ファイルサイズ |
| mime_type | varchar | YES | - | MIMEタイプ |
| uploaded_at | timestamptz | YES | CURRENT_TIMESTAMP | アップロード日時 |
| uploaded_by | uuid | YES | - | アップロードユーザーID |
| version | integer | YES | 1 | バージョン |
| is_deleted | boolean | YES | false | 削除フラグ |

### インデックス
```sql
CREATE INDEX idx_case_files_case_id ON case_files(case_id);
CREATE INDEX idx_case_files_uploaded_by ON case_files(uploaded_by);
CREATE INDEX idx_case_files_uploaded_at ON case_files(uploaded_at);
```

## quote_files
見積書の本体ファイルを管理するテーブル

### カラム定義
| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|----------|------|------------|------|
| id | uuid | NO | uuid_generate_v4() | 主キー |
| quote_id | uuid | YES | - | 見積ID (FK) |
| file_name | varchar | NO | - | ファイル名 |
| file_path | text | NO | - | ファイルパス |
| file_size | integer | NO | - | ファイルサイズ |
| mime_type | varchar | YES | - | MIMEタイプ |
| uploaded_at | timestamptz | YES | CURRENT_TIMESTAMP | アップロード日時 |
| uploaded_by | uuid | YES | - | アップロードユーザーID |
| version | integer | YES | 1 | バージョン |
| is_deleted | boolean | YES | false | 削除フラグ |

### インデックス
```sql
CREATE INDEX idx_quote_files_quote_id ON quote_files(quote_id);
CREATE INDEX idx_quote_files_uploaded_by ON quote_files(uploaded_by);
CREATE INDEX idx_quote_files_version ON quote_files(quote_id, version);
```

## quote_attachments
見積書の添付ファイルを管理するテーブル

### カラム定義
| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|----------|------|------------|------|
| id | uuid | NO | uuid_generate_v4() | 主キー |
| quote_id | uuid | YES | - | 見積ID (FK) |
| file_name | varchar | NO | - | ファイル名 |
| file_path | text | NO | - | ファイルパス |
| file_size | integer | NO | - | ファイルサイズ |
| mime_type | varchar | YES | - | MIMEタイプ |
| uploaded_at | timestamptz | YES | CURRENT_TIMESTAMP | アップロード日時 |
| uploaded_by | uuid | YES | - | アップロードユーザーID |
| is_deleted | boolean | YES | false | 削除フラグ |

### インデックス
```sql
CREATE INDEX idx_quote_attachments_quote_id ON quote_attachments(quote_id);
CREATE INDEX idx_quote_attachments_uploaded_by ON quote_attachments(uploaded_by);
```

## purchase_order_files
発注書の本体ファイルを管理するテーブル

### カラム定義
| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|----------|------|------------|------|
| id | uuid | NO | uuid_generate_v4() | 主キー |
| po_id | uuid | YES | - | 発注ID (FK) |
| file_name | varchar | NO | - | ファイル名 |
| file_path | text | NO | - | ファイルパス |
| file_size | integer | NO | - | ファイルサイズ |
| mime_type | varchar | YES | - | MIMEタイプ |
| uploaded_at | timestamptz | YES | CURRENT_TIMESTAMP | アップロード日時 |
| uploaded_by | uuid | YES | - | アップロードユーザーID |
| version | integer | YES | 1 | バージョン |
| is_deleted | boolean | YES | false | 削除フラグ |

### インデックス
```sql
CREATE INDEX idx_purchase_order_files_po_id ON purchase_order_files(po_id);
CREATE INDEX idx_purchase_order_files_uploaded_by ON purchase_order_files(uploaded_by);
CREATE INDEX idx_purchase_order_files_version ON purchase_order_files(po_id, version);
```

## purchase_order_attachments
発注書の添付ファイルを管理するテーブル

### カラム定義
| カラム名 | データ型 | NULL | デフォルト | 説明 |
|---------|----------|------|------------|------|
| id | uuid | NO | uuid_generate_v4() | 主キー |
| po_id | uuid | YES | - | 発注ID (FK) |
| file_name | varchar | NO | - | ファイル名 |
| file_path | text | NO | - | ファイルパス |
| file_size | integer | NO | - | ファイルサイズ |
| mime_type | varchar | YES | - | MIMEタイプ |
| uploaded_at | timestamptz | YES | CURRENT_TIMESTAMP | アップロード日時 |
| uploaded_by | uuid | YES | - | アップロードユーザーID |
| is_deleted | boolean | YES | false | 削除フラグ |

### インデックス
```sql
CREATE INDEX idx_purchase_order_attachments_po_id ON purchase_order_attachments(po_id);
CREATE INDEX idx_purchase_order_attachments_uploaded_by ON purchase_order_attachments(uploaded_by);
```

## 共通仕様

### ファイルストレージ
- ファイル本体はストレージサービス（例：AWS S3）に保存
- file_pathにはストレージ上のパスを保存
- アクセスURLは動的に生成

### フォルダ構造
```
/files
  /cases
    /{case_id}
      /{YYYY-MM}
        /{file_id}_{file_name}
  /quotes
    /{quote_id}
      /main
        /v{version}
          /{file_id}_{file_name}
      /attachments
        /{file_id}_{file_name}
  /purchase_orders
    /{po_id}
      /main
        /v{version}
          /{file_id}_{file_name}
      /attachments
        /{file_id}_{file_name}
```

### RLSポリシー
```sql
-- 例：quote_filesのRLS
CREATE POLICY quote_files_select ON quote_files FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM quotes q
            WHERE q.id = quote_files.quote_id
            AND (
                q.created_by = current_user_id()
                OR EXISTS (
                    SELECT 1 FROM cases c
                    WHERE c.id = q.case_id
                    AND c.assigned_to = current_user_id()
                )
            )
        )
        OR has_role('admin')
    );

CREATE POLICY quote_files_insert ON quote_files FOR INSERT
    WITH CHECK (
        has_role('sales')
        OR has_role('admin')
    );

CREATE POLICY quote_files_update ON quote_files FOR UPDATE
    USING (
        uploaded_by = current_user_id()
        OR has_role('admin')
    );

CREATE POLICY quote_files_delete ON quote_files FOR DELETE
    USING (has_role('admin'));
```

### ファイル操作トリガー
```sql
-- ファイルアップロード時のバージョン管理
CREATE OR REPLACE FUNCTION handle_file_version()
    RETURNS trigger AS $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM [file_table]
        WHERE [parent_id] = NEW.[parent_id]
        AND is_deleted = false
    ) THEN
        -- 既存のファイルを論理削除
        UPDATE [file_table]
        SET is_deleted = true
        WHERE [parent_id] = NEW.[parent_id]
        AND is_deleted = false;
        
        -- 新しいバージョンを設定
        NEW.version = (
            SELECT COALESCE(MAX(version), 0) + 1
            FROM [file_table]
            WHERE [parent_id] = NEW.[parent_id]
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### MIME Type制限
```sql
-- 許可されるMIME Typeのチェック
CREATE OR REPLACE FUNCTION check_mime_type()
    RETURNS trigger AS $$
BEGIN
    IF NEW.mime_type NOT IN (
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) THEN
        RAISE EXCEPTION 'Unsupported file type: %', NEW.mime_type;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### ファイルサイズ制限
```sql
-- ファイルサイズの制限チェック
CREATE OR REPLACE FUNCTION check_file_size()
    RETURNS trigger AS $$
BEGIN
    IF NEW.file_size > 10485760 THEN  -- 10MB
        RAISE EXCEPTION 'File size exceeds limit (10MB)';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```
