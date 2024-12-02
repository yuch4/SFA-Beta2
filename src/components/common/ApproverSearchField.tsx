import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { ApproverType } from '../../types/approval';
import { UserProfile } from '../../types/auth';
import { Role } from '../../types/auth';
import { supabase } from '../../lib/supabase';
import { SearchDialog } from './SearchDialog';

interface Department {
  id: string;
  name: string;
  code: string;
}

interface ApproverSearchFieldProps {
  label: string;
  approverType: ApproverType;
  selectedId?: string;
  error?: string;
  required?: boolean;
  onSelect: (id: string, name: string) => void;
}

export function ApproverSearchField({
  label,
  approverType,
  selectedId,
  error,
  required,
  onSelect,
}: ApproverSearchFieldProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchData, setSearchData] = useState<(UserProfile | Role | Department)[]>([]);
  const [selectedItem, setSelectedItem] = useState<UserProfile | Role | Department | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let data;
        switch (approverType) {
          case 'USER':
            const { data: users } = await supabase
              .from('user_profiles')
              .select('*')
              .eq('is_active', true);
            data = users;
            break;
          case 'ROLE':
            const { data: roles } = await supabase
              .from('roles')
              .select('*')
              .eq('is_active', true);
            data = roles;
            break;
          case 'DEPARTMENT':
            const { data: departments } = await supabase
              .from('departments')
              .select('*')
              .eq('is_active', true);
            data = departments;
            break;
        }
        setSearchData(data || []);

        if (selectedId) {
          const selected = data?.find((item: any) => item.id === selectedId);
          setSelectedItem(selected);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [approverType, selectedId]);

  const renderItem = (item: UserProfile | Role | Department) => {
    switch (approverType) {
      case 'USER':
        const user = item as UserProfile;
        return (
          <div>
            <div className="font-medium">{user.display_name}</div>
            <div className="text-sm text-gray-500">
              {user.department} - {user.position}
            </div>
          </div>
        );
      case 'ROLE':
        const role = item as Role;
        return (
          <div>
            <div className="font-medium">{role.role_name}</div>
            <div className="text-sm text-gray-500">{role.description}</div>
          </div>
        );
      case 'DEPARTMENT':
        const dept = item as Department;
        return (
          <div>
            <div className="font-medium">{dept.name}</div>
            <div className="text-sm text-gray-500">{dept.code}</div>
          </div>
        );
    }
  };

  const renderSelected = (item: UserProfile | Role | Department) => {
    switch (approverType) {
      case 'USER':
        return (item as UserProfile).display_name;
      case 'ROLE':
        return (item as Role).role_name;
      case 'DEPARTMENT':
        return (item as Department).name;
    }
  };

  const getSearchFields = () => {
    switch (approverType) {
      case 'USER':
        return ['display_name', 'email', 'department', 'position'];
      case 'ROLE':
        return ['role_name', 'description'];
      case 'DEPARTMENT':
        return ['name', 'code'];
    }
  };

  const handleSelect = (item: UserProfile | Role | Department) => {
    setSelectedItem(item);
    onSelect(item.id, 'name' in item ? item.name : 'role_name' in item ? item.role_name : item.display_name);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          type="text"
          className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            error ? 'border-red-300' : 'border-gray-300'
          } ${selectedItem ? 'bg-gray-50' : 'bg-white'}`}
          placeholder={`${label}を選択...`}
          value={selectedItem ? renderSelected(selectedItem) : ''}
          onClick={() => setIsDialogOpen(true)}
          readOnly
        />
        <Search
          className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 cursor-pointer"
          onClick={() => setIsDialogOpen(true)}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      <SearchDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={`${label}を選択`}
        data={searchData}
        onSelect={handleSelect}
        renderItem={renderItem}
        searchFields={getSearchFields()}
        selectedId={selectedId}
      />
    </div>
  );
}