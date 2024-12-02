import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { PurchaseOrderListView, PurchaseOrderStatus } from '../../types/purchase-order';
import { DataTable } from '../common/DataTable';
import MasterLayout from '../common/MasterLayout';
import Modal from '../common/Modal';
import PurchaseOrderForm from './PurchaseOrderForm';
import { usePurchaseOrders } from '../../hooks/usePurchaseOrders';
import { PurchaseOrderStatusSelect } from './PurchaseOrderStatus';
import { supabase } from '../../lib/supabase';

const PurchaseOrderList: React.FC = () => {
  const { purchaseOrders, loading, fetchPurchaseOrders, fetchPurchaseOrderById, deletePurchaseOrder } = usePurchaseOrders();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<any | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  const handleAdd = () => {
    setSelectedPurchaseOrder(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = async (po: PurchaseOrderListView) => {
    try {
      setIsLoading(true);
      const fullPO = await fetchPurchaseOrderById(po.id);
      setSelectedPurchaseOrder(fullPO);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching purchase order details:', error);
      toast.error('発注書の取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (po: PurchaseOrderListView) => {
    if (!window.confirm('この発注書を削除してもよろしいですか？')) return;
    try {
      await deletePurchaseOrder(po.id);
      toast.success('発注書を削除しました');
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      toast.error('発注書の削除に失敗しました');
    }
  };

  const handleStatusChange = async (poId: string, newStatus: PurchaseOrderStatus) => {
    try {
      const { error } = await supabase
        .from('purchase_orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', poId);

      if (error) throw error;
      
      await fetchPurchaseOrders();
      toast.success('ステータスを更新しました');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('ステータスの更新に失敗しました');
    }
  };

  const handleFormSubmit = () => {
    setIsModalOpen(false);
    fetchPurchaseOrders();
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
  };

  const columns = [
    { key: 'po_number', header: '発注番号' },
    { key: 'case_name', header: '案件名' },
    { key: 'quote_number', header: '見積番号' },
    { key: 'supplier_name', header: '仕入先' },
    {
      key: 'po_date',
      header: '発注日付',
      render: (value: string) => format(new Date(value), 'yyyy/MM/dd')
    },
    {
      key: 'delivery_date',
      header: '納期',
      render: (value: string) => format(new Date(value), 'yyyy/MM/dd')
    },
    {
      key: 'total_amount',
      header: '発注金額',
      render: (value: number) => value.toLocaleString('ja-JP', {
        style: 'currency',
        currency: 'JPY'
      })
    },
    {
      key: 'status',
      header: 'ステータス',
      render: (value: PurchaseOrderStatus, row: PurchaseOrderListView) => (
        <PurchaseOrderStatusSelect
          status={value}
          onChange={(newStatus) => handleStatusChange(row.id, newStatus)}
        />
      )
    }
  ];

  if (loading || isLoading) {
    return (
      <MasterLayout title="発注管理">
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
        title="発注管理"
        onAdd={handleAdd}
      >
        <DataTable
          data={purchaseOrders}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </MasterLayout>

      <Modal
        isOpen={isModalOpen}
        onClose={handleFormCancel}
        title={selectedPurchaseOrder ? '発注書編集' : '発注書作成'}
        size="full"
      >
        <PurchaseOrderForm
          purchaseOrder={selectedPurchaseOrder}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </Modal>
    </>
  );
};

export default PurchaseOrderList;