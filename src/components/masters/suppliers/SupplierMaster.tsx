import React, { useEffect, useState } from 'react';
import { Supplier } from '../../../types/master';
import MasterLayout from '../../common/MasterLayout';
import SupplierTable from './SupplierTable';
import SupplierForm from './SupplierForm';
import Modal from '../../common/Modal';
import { useSuppliers } from '../../../hooks/useSuppliers';

const SupplierMaster: React.FC = () => {
  const { suppliers, loading, fetchSuppliers, deleteSupplier } = useSuppliers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | undefined>();

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleAdd = () => {
    setSelectedSupplier(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleDelete = async (supplier: Supplier) => {
    if (!window.confirm('この仕入先を削除してもよろしいですか？')) return;
    await deleteSupplier(supplier.id);
  };

  const handleFormSubmit = () => {
    setIsModalOpen(false);
    fetchSuppliers();
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <MasterLayout title="仕入先マスタ">
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
        title="仕入先マスタ"
        onAdd={handleAdd}
      >
        <SupplierTable
          suppliers={suppliers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </MasterLayout>

      <Modal
        isOpen={isModalOpen}
        onClose={handleFormCancel}
        title={selectedSupplier ? '仕入先編集' : '仕入先登録'}
      >
        <SupplierForm
          supplier={selectedSupplier}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </Modal>
    </>
  );
};

export default SupplierMaster;