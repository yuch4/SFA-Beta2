import { Supplier } from '../types/master';
import { supabase } from '../lib/supabase';
import Papa from 'papaparse';

// CSVヘッダー定義
const CSV_HEADERS = [
  { id: 'supplier_code', name: '仕入先コード' },
  { id: 'supplier_name', name: '仕入先名' },
  { id: 'supplier_name_kana', name: '仕入先名カナ' },
  { id: 'supplier_type', name: '仕入先区分' },
  { id: 'address', name: '住所' },
  { id: 'phone', name: '電話番号' },
  { id: 'email', name: 'メールアドレス' },
  { id: 'contact_person', name: '担当者名' },
  { id: 'contact_phone', name: '担当者電話番号' },
  { id: 'department', name: '部署' },
  { id: 'payment_terms', name: '支払条件' },
  { id: 'notes', name: '備考' },
  { id: 'is_active', name: '有効フラグ' },
];

// CSVエクスポート
export const exportSuppliersToCSV = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('supplier_code', { ascending: true });

    if (error) throw error;

    const csvData = data.map(item => ({
      supplier_code: item.supplier_code,
      supplier_name: item.supplier_name,
      supplier_name_kana: item.supplier_name_kana || '',
      supplier_type: item.supplier_type,
      address: item.address || '',
      phone: item.phone || '',
      email: item.email || '',
      contact_person: item.contact_person || '',
      contact_phone: item.contact_phone || '',
      department: item.department || '',
      payment_terms: item.payment_terms || '',
      notes: item.notes || '',
      is_active: item.is_active ? '1' : '0',
    }));

    const csv = Papa.unparse({
      fields: CSV_HEADERS.map(header => header.name),
      data: csvData,
    });

    return csv;
  } catch (error) {
    console.error('Error exporting suppliers:', error);
    throw error;
  }
};

interface ImportResults {
  success: number;
  errors: string[];
}

// CSVインポート
export const importSuppliersFromCSV = async (file: File): Promise<ImportResults> => {
  return new Promise((resolve, reject) => {
    const results: ImportResults = {
      success: 0,
      errors: [],
    };

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (parseResults) => {
        try {
          const suppliers = (parseResults.data as any[]).map(row => ({
            supplier_code: row['仕入先コード'],
            supplier_name: row['仕入��名'],
            supplier_name_kana: row['仕入先名カナ'] || null,
            supplier_type: row['仕入先区分'],
            address: row['住所'] || null,
            phone: row['電話番号'] || null,
            email: row['メールアドレス'] || null,
            contact_person: row['担当者名'] || null,
            contact_phone: row['担当者電話番号'] || null,
            department: row['部署'] || null,
            payment_terms: row['支払条件'] || null,
            notes: row['備考'] || null,
            is_active: row['有効フラグ'] === '1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));

          // バリデーション
          const validSuppliers = suppliers.filter((item, index) => {
            if (!item.supplier_code || !item.supplier_name) {
              results.errors.push(`行 ${index + 2}: 仕入先コードと仕入先名は必須です`);
              return false;
            }
            if (item.email && !/\S+@\S+\.\S+/.test(item.email)) {
              results.errors.push(`行 ${index + 2}: メールアドレスの形式が正しくありません`);
              return false;
            }
            return true;
          });

          if (validSuppliers.length > 0) {
            const { error } = await supabase
              .from('suppliers')
              .upsert(validSuppliers, {
                onConflict: 'supplier_code',
                ignoreDuplicates: false,
              });

            if (error) throw error;
            results.success = validSuppliers.length;
          }

          resolve(results);
        } catch (error) {
          console.error('Error importing suppliers:', error);
          reject(error);
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        reject(error);
      },
    });
  });
};

// CSVテンプレートの生成
export const generateSupplierTemplate = (): string => {
  const template = Papa.unparse({
    fields: CSV_HEADERS.map(header => header.name),
    data: [{
      '仕入先コード': 'SUPP001',
      '仕入先名': '株式会社サンプル',
      '仕入先名カナ': 'カブシキガイシャサンプル',
      '仕入先区分': 'CORPORATE',
      '住所': '東京都千代田区...',
      '電話番号': '03-1234-5678',
      'メールアドレス': 'info@example.com',
      '担当者名': '山田太郎',
      '担当者電話番号': '090-1234-5678',
      '部署': '営業部',
      '支払条件': '月末締め翌月末払い',
      '備考': '備考欄',
      '有効フラグ': '1',
    }],
  });

  return template;
}; 