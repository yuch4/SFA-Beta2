import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  ShoppingCart,
  Users,
  Database,
  Building2,
  FolderKanban,
  Tags,
  FileSpreadsheet,
  CheckSquare,
  ClipboardCheck,
  LogOut
} from 'lucide-react';
import { useAuth } from '../lib/auth';

const Sidebar = () => {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="w-64 bg-gray-900 min-h-screen p-4 flex flex-col">
      <div className="text-white text-xl font-bold mb-8">営業支援システム</div>
      
      {profile && (
        <div className="px-2 py-4 mb-6 border-b border-gray-700">
          <p className="text-white font-medium">{profile.display_name}</p>
          <p className="text-gray-400 text-sm">{profile.email}</p>
        </div>
      )}

      <nav className="space-y-2 flex-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg ${
              isActive ? 'bg-blue-600' : 'hover:bg-gray-800'
            } text-white`
          }
        >
          <LayoutDashboard size={20} />
          <span>ダッシュボード</span>
        </NavLink>

        <NavLink
          to="/cases"
          className={({ isActive }) =>
            `flex items-center space-x-2 p-2 rounded-lg ${
              isActive ? 'bg-blue-600' : 'hover:bg-gray-800'
            } text-white`
          }
        >
          <FileSpreadsheet size={20} />
          <span>案件管理</span>
        </NavLink>

        <div className="pt-4">
          <div className="text-gray-400 text-xs uppercase font-semibold px-2 mb-2">
            マスタ管理
          </div>
          <NavLink
            to="/masters/customers"
            className={({ isActive }) =>
              `flex items-center space-x-2 p-2 rounded-lg ${
                isActive ? 'bg-blue-600' : 'hover:bg-gray-800'
              } text-white`
            }
          >
            <Users size={20} />
            <span>顧客マスタ</span>
          </NavLink>
          <NavLink
            to="/masters/suppliers"
            className={({ isActive }) =>
              `flex items-center space-x-2 p-2 rounded-lg ${
                isActive ? 'bg-blue-600' : 'hover:bg-gray-800'
              } text-white`
            }
          >
            <Building2 size={20} />
            <span>仕入先マスタ</span>
          </NavLink>
          <NavLink
            to="/masters/project-codes"
            className={({ isActive }) =>
              `flex items-center space-x-2 p-2 rounded-lg ${
                isActive ? 'bg-blue-600' : 'hover:bg-gray-800'
              } text-white`
            }
          >
            <FolderKanban size={20} />
            <span>プロジェクトコード</span>
          </NavLink>
          <NavLink
            to="/masters/statuses"
            className={({ isActive }) =>
              `flex items-center space-x-2 p-2 rounded-lg ${
                isActive ? 'bg-blue-600' : 'hover:bg-gray-800'
              } text-white`
            }
          >
            <Tags size={20} />
            <span>ステータス管理</span>
          </NavLink>
          <NavLink
            to="/masters/approval-flows"
            className={({ isActive }) =>
              `flex items-center space-x-2 p-2 rounded-lg ${
                isActive ? 'bg-blue-600' : 'hover:bg-gray-800'
              } text-white`
            }
          >
            <CheckSquare size={20} />
            <span>承認フロー管理</span>
          </NavLink>
        </div>

        <div className="pt-4">
          <div className="text-gray-400 text-xs uppercase font-semibold px-2 mb-2">
            業務管理
          </div>
          <NavLink
            to="/quotes"
            className={({ isActive }) =>
              `flex items-center space-x-2 p-2 rounded-lg ${
                isActive ? 'bg-blue-600' : 'hover:bg-gray-800'
              } text-white`
            }
          >
            <FileText size={20} />
            <span>見積管理</span>
          </NavLink>
          <NavLink
            to="/purchase-orders"
            className={({ isActive }) =>
              `flex items-center space-x-2 p-2 rounded-lg ${
                isActive ? 'bg-blue-600' : 'hover:bg-gray-800'
              } text-white`
            }
          >
            <ShoppingCart size={20} />
            <span>発注管理</span>
          </NavLink>
          <NavLink
            to="/approvals"
            className={({ isActive }) =>
              `flex items-center space-x-2 p-2 rounded-lg ${
                isActive ? 'bg-blue-600' : 'hover:bg-gray-800'
              } text-white`
            }
          >
            <ClipboardCheck size={20} />
            <span>承認タスク</span>
          </NavLink>
        </div>
      </nav>

      <button
        onClick={handleLogout}
        className="mt-auto flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-800 text-white w-full"
      >
        <LogOut size={20} />
        <span>ログアウト</span>
      </button>
    </div>
  );
};

export default Sidebar;