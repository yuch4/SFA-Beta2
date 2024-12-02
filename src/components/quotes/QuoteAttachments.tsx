import React, { useCallback } from 'react';
import { FileUp, Trash2, Download } from 'lucide-react';
import { supabase, STORAGE_BUCKET } from '../../lib/supabase';
import { QuoteAttachment } from '../../types/quote';

interface QuoteAttachmentsProps {
  quoteId: string;
  attachments: QuoteAttachment[];
  onAttachmentsChange: (attachments: QuoteAttachment[]) => void;
}

const QuoteAttachments: React.FC<QuoteAttachmentsProps> = ({
  quoteId,
  attachments,
  onAttachmentsChange,
}) => {
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const totalSize = Array.from(files).reduce((sum, file) => sum + file.size, 0);
    const currentTotalSize = attachments.reduce((sum, att) => sum + att.file_size, 0);

    if (totalSize + currentTotalSize > 200 * 1024 * 1024) {
      alert('合計ファイルサイズが200MBを超えています');
      return;
    }

    for (const file of Array.from(files)) {
      if (file.size > 50 * 1024 * 1024) {
        alert(`${file.name}のファイルサイズが50MBを超えています`);
        continue;
      }

      try {
        const filePath = `quotes/${quoteId}/${crypto.randomUUID()}-${file.name}`;
        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, file);

        if (error) throw error;

        const newAttachment: QuoteAttachment = {
          id: crypto.randomUUID(),
          quote_id: quoteId,
          file_name: file.name,
          file_path: data.path,
          file_size: file.size,
          mime_type: file.type,
          uploaded_at: new Date().toISOString(),
          is_deleted: false,
        };

        onAttachmentsChange([...attachments, newAttachment]);
      } catch (error) {
        console.error('Error uploading file:', error);
        alert('ファイルのアップロードに失敗しました');
      }
    }
  }, [quoteId, attachments, onAttachmentsChange]);

  const handleDownload = async (attachment: QuoteAttachment) => {
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .download(attachment.file_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('ファイルのダウンロードに失敗しました');
    }
  };

  const handleDelete = async (attachment: QuoteAttachment) => {
    if (!window.confirm('このファイルを削除してもよろしいですか？')) return;

    try {
      await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([attachment.file_path]);

      const updatedAttachments = attachments.filter(a => a.id !== attachment.id);
      onAttachmentsChange(updatedAttachments);
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('ファイルの削除に失敗しました');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">添付ファイル</h3>
        <label className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
          <FileUp className="h-4 w-4 mr-2" />
          ファイルを追加
          <input
            type="file"
            className="hidden"
            multiple
            onChange={handleFileUpload}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
          />
        </label>
      </div>

      <div className="border rounded-lg divide-y">
        {attachments.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            添付ファイルはありません
          </div>
        ) : (
          attachments.map(attachment => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-4 hover:bg-gray-50"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {attachment.file_name}
                  </p>
                  <span className="ml-2 text-sm text-gray-500">
                    ({formatFileSize(attachment.file_size)})
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  アップロード日時: {new Date(attachment.uploaded_at).toLocaleString()}
                </p>
              </div>
              <div className="ml-4 flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => handleDownload(attachment)}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(attachment)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuoteAttachments;