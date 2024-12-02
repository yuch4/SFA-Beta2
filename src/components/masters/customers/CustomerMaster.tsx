import React, { useEffect, useState } from 'react';
import { Customer } from '../../../types/master';
import MasterLayout from '../../common/MasterLayout';
import CustomerTable from './CustomerTable';
import CustomerForm from './CustomerForm';
import Modal from '../../common/Modal';
import { useCustomers } from '../../../hooks/useCustomers';

const CustomerMaster: React.FC = () => {
  const { customers, loading, fetchCustomers, deleteCustomer } = useCustomers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>();

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleAdd = () => {
    setSelectedCustomer(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleDelete = async (customer: Customer) => {
    if (!window.confirm('この顧客を削除してもよろしいですか？')) return;
    await deleteCustomer(customer.id);
  };

  const handleFormSubmit = () => {
    setIsModalOpen(false);
    fetchCustomers();
  };

  const handleFormCancel = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <MasterLayout title="顧客マスタ">
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
        title="顧客マスタ"
        onAdd={handleAdd}
      >
        <CustomerTable
          customers={customers}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </MasterLayout>

      <Modal
        isOpen={isModalOpen}
        onClose={handleFormCancel}
        title={selectedCustomer ? '顧客編集' : '顧客登録'}
      >
        <CustomerForm
          customer={selectedCustomer}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </Modal>
    </>
  );
};

export default CustomerMaster;