import { Customer } from '../types/master';
import { supabase } from '../lib/supabase';
import Papa from 'papaparse';

// CSVヘッダー定義
const CSV_HEADERS = [
  { id: 'customer_code', name: '顧客コード' },
  { id: 'customer_name', name: '顧客名' },
  { id: 'customer_name_kana', name: '顧客名カナ' },
  { id: 'customer_type', name: '顧客区分' },
  { id: 'address', name: '住所' },
  { id: 'phone', name: '電話番号' },
  { id: 'email', name: 'メールアドレス' },
  { id: 'contact_person', name: '担当者名' },
  { id: 'contact_phone', name: '担当者電話番号' },
  { id: 'department', name: '部署' },
  { id: 'payment_terms', name: '支払条件' },
  { id: 'credit_limit', name: '与信限度額' },
  { id: 'notes', name: '備考' },
  { id: 'is_active', name: '有効フラグ' },
];

// CSVエクスポート
export const exportCustomersToCSV = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('customer_code', { ascending: true });

    if (error) throw error;

    const csvData = data.map(item => ({
      customer_code: item.customer_code,
      customer_name: item.customer_name,
      customer_name_kana: item.customer_name_kana || '',
      customer_type: item.customer_type,
      address: item.address || '',
      phone: item.phone || '',
      email: item.email || '',
      contact_person: item.contact_person || '',
      contact_phone: item.contact_phone || '',
      department: item.department || '',
      payment_terms: item.payment_terms || '',
      credit_limit: item.credit_limit || 0,
      notes: item.notes || '',
      is_active: item.is_active ? '1' : '0',
    }));

    const csv = Papa.unparse({
      fields: CSV_HEADERS.map(header => header.name),
      data: csvData,
    });

    return csv;
  } catch (error) {
    console.error('Error exporting customers:', error);
    throw error;
  }
};

interface ImportResults {
  success: number;
  errors: string[];
}

// CSVインポート
export const importCustomersFromCSV = async (file: File): Promise<ImportResults> => {
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
          const customers = (parseResults.data as any[]).map(row => ({
            customer_code: row['顧客コード'],
            customer_name: row['顧客名'],
            customer_name_kana: row['顧客名カナ'] || null,
            customer_type: row['顧客区分'],
            address: row['住所'] || null,
            phone: row['電話番号'] || null,
            email: row['メールアドレス'] || null,
            contact_person: row['担当者名'] || null,
            contact_phone: row['担当者電話番号'] || null,
            department: row['部署'] || null,
            payment_terms: row['支払条件'] || null,
            credit_limit: row['与信限度額'] ? parseFloat(row['与信限度額']) : 0,
            notes: row['備考'] || null,
            is_active: row['有効フラグ'] === '1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));

          // バリデーション
          const validCustomers = customers.filter((item, index) => {
            if (!item.customer_code || !item.customer_name) {
              results.errors.push(`行 ${index + 2}: 顧客コードと顧客名は必須です`);
              return false;
            }
            if (item.email && !/\S+@\S+\.\S+/.test(item.email)) {
              results.errors.push(`行 ${index + 2}: メールアドレスの形式が正しくあ��ません`);
              return false;
            }
            return true;
          });

          if (validCustomers.length > 0) {
            const { error } = await supabase
              .from('customers')
              .upsert(validCustomers, {
                onConflict: 'customer_code',
                ignoreDuplicates: false,
              });

            if (error) throw error;
            results.success = validCustomers.length;
          }

          resolve(results);
        } catch (error) {
          console.error('Error importing customers:', error);
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
export const generateCustomerTemplate = (): string => {
  const template = Papa.unparse({
    fields: CSV_HEADERS.map(header => header.name),
    data: [{
      '顧客コード': 'CUST001',
      '顧客名': '株式会社サンプル',
      '顧客名カナ': 'カブシキガイシャサンプル',
      '顧客区分': 'CORPORATE',
      '住所': '東京都千代田区...',
      '電話番号': '03-1234-5678',
      'メールアドレス': 'info@example.com',
      '担当者名': '山田太郎',
      '担当者電話番号': '090-1234-5678',
      '部署': '営業部',
      '支払条件': '月末締め翌月末払い',
      '与信限度額': '1000000',
      '備考': '備考欄',
      '有効フラグ': '1',
    }],
  });

  return template;
}; 