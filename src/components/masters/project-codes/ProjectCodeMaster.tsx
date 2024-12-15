import React, { useEffect, useState, useRef } from 'react';
import { ProjectCode } from '../../../types/master';
import MasterLayout from '../../common/MasterLayout';
import ProjectCodeTable from './ProjectCodeTable';
import ProjectCodeForm from './ProjectCodeForm';
import Modal from '../../common/Modal';
import { useProjectCodes } from '../../../hooks/useProjectCodes';
import { toast } from 'react-hot-toast';
import { Download, Upload, FileText, Plus } from 'lucide-react';
import { 
  exportProjectCodesToCSV, 
  importProjectCodesFromCSV, 
  generateProjectCodeTemplate 
} from '../../../utils/projectCodeUtils';

const ProjectCodeMaster: React.FC = () => {
  const { projectCodes, loading, fetchProjectCodes, deleteProjectCode } = useProjectCodes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProjectCode, setSelectedProjectCode] = useState<ProjectCode | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProjectCodes();
  }, [fetchProjectCodes]);

  const handleAdd = () => {
    setSelectedProjectCode(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (projectCode: ProjectCode) => {
    setSelectedProjectCode(projectCode);
    setIsModalOpen(true);
  };

  const handleDelete = async (projectCode: ProjectCode) => {
    if (!window.confirm('このプロジェクトコードを削除してもよろしいですか？')) return;
    await deleteProjectCode(projectCode.id);
  };

  const handleFormSubmit = () => {
    setIsModalOpen(false);
    fetchProjectCodes();
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
  };

  // CSVエクスポート
  const handleExport = async () => {
    try {
      const csv = await exportProjectCodesToCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `project_codes_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      toast.success('CSVエクスポートが完了しました');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('CSVエクスポートに失敗しました');
    }
  };

  // CSVインポート
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const results = await importProjectCodesFromCSV(file);
      
      if (results.errors.length > 0) {
        toast.error(
          <div>
            <p>一部のデータのインポートに失敗しました:</p>
            <ul className="list-disc list-inside">
              {results.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        );
      }

      if (results.success > 0) {
        toast.success(`${results.success}件のデータをインポートしました`);
        fetchProjectCodes();
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('CSVインポートに失敗しました');
    }

    // ファイル選択をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // CSVテンプレートのダウンロード
  const handleDownloadTemplate = () => {
    try {
      const template = generateProjectCodeTemplate();
      const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'project_codes_template.csv';
      link.click();
      toast.success('テンプレートのダウンロードが完了しました');
    } catch (error) {
      console.error('Template download error:', error);
      toast.error('テンプレートのダウンロードに失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">プロジェクトコード</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            title="CSVテンプレートをダウンロード"
          >
            <FileText className="h-4 w-4 mr-2" />
            テンプレート
          </button>
          <button
            onClick={handleExport}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            title="CSVエクスポート"
          >
            <Download className="h-4 w-4 mr-2" />
            エクスポート
          </button>
          <label className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
            title="CSVインポート">
            <Upload className="h-4 w-4 mr-2" />
            インポート
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".csv"
              className="hidden"
            />
          </label>
          <button
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            新規登録
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <ProjectCodeTable
          projectCodes={projectCodes}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleFormCancel}
        title={selectedProjectCode ? 'プロジェクトコード編集' : 'プロジェクトコード登録'}
      >
        <ProjectCodeForm
          projectCode={selectedProjectCode}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </Modal>
    </div>
  );
};

export default ProjectCodeMaster;