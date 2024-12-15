import { ProjectCode } from '../types/master';
import { supabase } from '../lib/supabase';
import Papa from 'papaparse';

// CSVヘッダー定義
const CSV_HEADERS = [
  { id: 'project_code', name: 'プロジェクトコード' },
  { id: 'project_name', name: 'プロジェクト名' },
  { id: 'description', name: '説明' },
  { id: 'start_date', name: '開始日' },
  { id: 'end_date', name: '終了日' },
  { id: 'notes', name: '備考' },
  { id: 'is_active', name: '有効フラグ' },
];

// CSVエクスポート
export const exportProjectCodesToCSV = async (): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('project_codes')
      .select('*')
      .order('project_code', { ascending: true });

    if (error) throw error;

    const csvData = data.map(item => ({
      project_code: item.project_code,
      project_name: item.project_name,
      description: item.description || '',
      start_date: item.start_date || '',
      end_date: item.end_date || '',
      notes: item.notes || '',
      is_active: item.is_active ? '1' : '0',
    }));

    const csv = Papa.unparse({
      fields: CSV_HEADERS.map(header => header.name),
      data: csvData,
    });

    return csv;
  } catch (error) {
    console.error('Error exporting project codes:', error);
    throw error;
  }
};

interface ImportResults {
  success: number;
  errors: string[];
}

// CSVインポート
export const importProjectCodesFromCSV = async (file: File): Promise<ImportResults> => {
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
          const projectCodes = (parseResults.data as any[]).map(row => ({
            project_code: row['プロジェクトコード'],
            project_name: row['プロジェクト名'],
            description: row['説明'] || null,
            start_date: row['開始日'] || null,
            end_date: row['終了日'] || null,
            notes: row['備考'] || null,
            is_active: row['有効フラグ'] === '1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }));

          // バリデーション
          const validProjectCodes = projectCodes.filter((item, index) => {
            if (!item.project_code || !item.project_name) {
              results.errors.push(`行 ${index + 2}: プロジェクトコードとプロジェクト名は必須です`);
              return false;
            }
            return true;
          });

          if (validProjectCodes.length > 0) {
            const { error } = await supabase
              .from('project_codes')
              .upsert(validProjectCodes, {
                onConflict: 'project_code',
                ignoreDuplicates: false,
              });

            if (error) throw error;
            results.success = validProjectCodes.length;
          }

          resolve(results);
        } catch (error) {
          console.error('Error importing project codes:', error);
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
export const generateProjectCodeTemplate = (): string => {
  const template = Papa.unparse({
    fields: CSV_HEADERS.map(header => header.name),
    data: [{
      'プロジェクトコード': 'PRJ001',
      'プロジェクト名': 'サンプルプロジェクト',
      '説明': 'プロジェクトの説明',
      '開始日': '2024-01-01',
      '終了日': '2024-12-31',
      '備考': '備考欄',
      '有効フラグ': '1',
    }],
  });

  return template;
}; 