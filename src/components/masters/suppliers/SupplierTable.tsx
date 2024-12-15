import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Supplier } from '../../../types/master';
import { DataTable } from '../../common/DataTable';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface SupplierTableProps {
  suppliers: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
}

const ITEMS_PER_PAGE = 10;

const SupplierTable: React.FC<SupplierTableProps> = ({ suppliers, onEdit, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<keyof Supplier>('supplier_code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // フィルター処理
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const searchTarget = `${supplier.supplier_code} ${supplier.supplier_name} ${supplier.supplier_name_kana || ''} ${supplier.email || ''}`.toLowerCase();
      return searchTarget.includes(searchQuery.toLowerCase());
    });
  }, [suppliers, searchQuery]);

  // ソート処理
  const sortedSuppliers = useMemo(() => {
    return [...filteredSuppliers].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (aValue === null) return 1;
      if (bValue === null) return -1;

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredSuppliers, sortField, sortDirection]);

  // ページネーション処理
  const paginatedSuppliers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedSuppliers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedSuppliers, currentPage]);

  // 総ページ数の計算
  const totalPages = Math.ceil(sortedSuppliers.length / ITEMS_PER_PAGE);

  // ページ変更ハンドラー
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // ソートの切り替え
  const handleSort = (field: keyof Supplier) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // 検索時にページを1に戻す
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const columns = [
    { 
      key: 'supplier_code', 
      header: '仕入先コード',
      sortable: true,
      sortField: 'supplier_code' as keyof Supplier,
    },
    { 
      key: 'supplier_name', 
      header: '仕入先名',
      sortable: true,
      sortField: 'supplier_name' as keyof Supplier,
    },
    { 
      key: 'supplier_type', 
      header: '仕入先区分',
      sortable: true,
      sortField: 'supplier_type' as keyof Supplier,
    },
    { 
      key: 'phone', 
      header: '電話番号',
      sortable: true,
      sortField: 'phone' as keyof Supplier,
    },
    { 
      key: 'email', 
      header: 'メールアドレス',
      sortable: true,
      sortField: 'email' as keyof Supplier,
    },
    {
      key: 'created_at',
      header: '作成日',
      sortable: true,
      sortField: 'created_at' as keyof Supplier,
      render: (value: string) => format(new Date(value), 'yyyy-MM-dd'),
    },
    {
      key: 'is_active',
      header: '状態',
      sortable: true,
      sortField: 'is_active' as keyof Supplier,
      render: (value: boolean) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {value ? '有効' : '無効'}
        </span>
      ),
    },
  ];

  // ページネーションボタンの生成
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // 前へボタン
    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-2 py-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
    );

    // 最初のページ
    if (startPage > 1) {
      buttons.push(
        <button
          key={1}
          onClick={() => handlePageChange(1)}
          className="px-3 py-1 rounded-md hover:bg-gray-100"
        >
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(<span key="ellipsis1">...</span>);
      }
    }

    // ページ番号ボタン
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-md ${
            currentPage === i
              ? 'bg-indigo-600 text-white'
              : 'hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }

    // 最後のページ
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="ellipsis2">...</span>);
      }
      buttons.push(
        <button
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          className="px-3 py-1 rounded-md hover:bg-gray-100"
        >
          {totalPages}
        </button>
      );
    }

    // 次へボタン
    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-2 py-1 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    );

    return buttons;
  };

  return (
    <div>
      <div className="mb-6 relative">
        <input
          type="text"
          placeholder="検索..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <DataTable
          data={paginatedSuppliers}
          columns={columns}
          onEdit={onEdit}
          onDelete={onDelete}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {sortedSuppliers.length} 件中 {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, sortedSuppliers.length)} 件を表示
        </div>
        <div className="flex items-center space-x-2">
          {renderPaginationButtons()}
        </div>
      </div>
    </div>
  );
};

export default SupplierTable;