import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { QuoteListView } from '../../types/quote';
import { DataTable } from '../common/DataTable';
import MasterLayout from '../common/MasterLayout';
import Modal from '../common/Modal';
import QuoteForm from './QuoteForm';
import { useQuotes } from '../../hooks/useQuotes';

const QuoteList: React.FC = () => {
  const { quotes, loading, fetchQuotes, fetchQuoteById, deleteQuote } = useQuotes();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isCopy, setIsCopy] = useState(false);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const handleAdd = () => {
    setSelectedQuote(undefined);
    setIsCopy(false);
    setIsModalOpen(true);
  };

  const handleEdit = async (quote: QuoteListView) => {
    try {
      setIsLoading(true);
      const fullQuote = await fetchQuoteById(quote.id);
      setSelectedQuote(fullQuote);
      setIsCopy(false);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching quote details:', error);
      toast.error('見積書の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (quote: QuoteListView) => {
    try {
      setIsLoading(true);
      const fullQuote = await fetchQuoteById(quote.id);
      setSelectedQuote(fullQuote);
      setIsCopy(true);
      setIsModalOpen(true);
      toast.success('見積書をコピーしました。内容を編集して保存してください。');
    } catch (error) {
      console.error('Error fetching quote details:', error);
      toast.error('見積書のコピーに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (quote: QuoteListView) => {
    if (!window.confirm('この見積書を削除してもよろしいですか？')) return;
    try {
      await deleteQuote(quote.id);
      toast.success('見積書を削除しました');
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast.error('見積書の削除に失敗しました');
    }
  };

  const handleFormSubmit = () => {
    setIsModalOpen(false);
    fetchQuotes();
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
  };

  const columns = [
    { key: 'quote_number', header: '見積番号' },
    { key: 'case_name', header: '案件名' },
    { key: 'customer_name', header: '顧客名' },
    {
      key: 'quote_date',
      header: '見積日付',
      render: (value: string) => format(new Date(value), 'yyyy/MM/dd')
    },
    {
      key: 'valid_until',
      header: '有効期限',
      render: (value: string) => format(new Date(value), 'yyyy/MM/dd')
    },
    {
      key: 'total_amount',
      header: '見積金額',
      render: (value: number) => value.toLocaleString('ja-JP', {
        style: 'currency',
        currency: 'JPY'
      })
    },
    {
      key: 'profit_rate',
      header: '粗利率',
      render: (value: number) => `${value.toFixed(1)}%`
    },
    {
      key: 'status',
      header: 'ステータス',
      render: (value: string) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
          value === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
          value === 'APPROVED' ? 'bg-green-100 text-green-800' :
          value === 'REJECTED' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {value === 'DRAFT' ? '下書き' :
           value === 'PENDING' ? '承認待ち' :
           value === 'APPROVED' ? '承認済' :
           value === 'REJECTED' ? '却下' :
           value === 'EXPIRED' ? '期限切れ' : value}
        </span>
      )
    },
    {
      key: 'actions',
      header: '',
      render: (_: any, row: QuoteListView) => (
        <button
          onClick={() => handleCopy(row)}
          className="text-indigo-600 hover:text-indigo-900 mr-4"
        >
          コピー
        </button>
      )
    }
  ];

  if (loading || isLoading) {
    return (
      <MasterLayout title="見積管理">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </MasterLayout>
    );
  }

  return (
    <>
      <MasterLayout
        title="見積管理"
        onAdd={handleAdd}
      >
        <DataTable
          data={quotes}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </MasterLayout>

      <Modal
        isOpen={isModalOpen}
        onClose={handleFormCancel}
        title={selectedQuote ? (isCopy ? '見積書コピー' : '見積書編集') : '見積書作成'}
        size="full"
      >
        <QuoteForm
          quote={selectedQuote}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isCopy={isCopy}
        />
      </Modal>
    </>
  );
};

export default QuoteList;