import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useAlerts } from '../context/AlertContext';
import { 
  LayoutDashboard, 
  Users, 
  Map, 
  LogOut, 
  Shield, 
  Video, 
  Tractor,
  ScanEye,
  Bell
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-14 w-64 h-[calc(100vh-3.5rem)] bg-white shadow-lg border-r border-gray-200 z-10 flex flex-col transition-all duration-300">
      <div className="p-6">
        <div className="flex items-center gap-3 px-2 mb-6">
           <div className="p-2 bg-green-100 rounded-lg text-green-700">
              {user?.role === 'admin' ? <Shield size={24} /> : <Tractor size={24} />}
           </div>
           <div>
               <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{user?.role === 'admin' ? 'Administrator' : 'Farmer Portal'}</p>
               <h3 className="font-bold text-gray-800">{user?.name}</h3>
           </div>
        </div>

        <nav className="space-y-1">
          {/* Admin Menu */}
          {user?.role === 'admin' && (
            <>
              <Link 
                to="/admin/dashboard" 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/admin/dashboard') ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <LayoutDashboard size={20} />
                Dashboard
              </Link>
              <Link 
                to="/admin/farmers" 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/admin/farmers') ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Users size={20} />
                Manage Farmers
              </Link>
               <Link 
                to="/admin/farms" 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/admin/farms') ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Map size={20} />
                Farms Overview
              </Link>
            </>
          )}

          {/* Farmer Menu */}
          {user?.role === 'farmer' && (
             <>
              <Link 
                to="/farmer/dashboard" 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/farmer/dashboard') ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <LayoutDashboard size={20} />
                Dashboard
              </Link>
              <Link 
                to="/farmer/my-farm" 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/farmer/my-farm') ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Tractor size={20} />
                My Farm
              </Link>
               <Link 
                to="/farmer/zones" 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/farmer/zones') ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Map size={20} />
                My Zones
              </Link>
               <Link 
                to="/farmer/detection" 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive('/farmer/detection') ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <ScanEye size={20} />
                Animal Detection
              </Link>
              
               <AlertsLink isActive={isActive} />

             </>
          )}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-gray-100">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
};

const AlertsLink = ({ isActive }) => {
    const { unreadCount } = useAlerts();
    return (
        <Link 
            to="/farmer/alerts" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors relative ${isActive('/farmer/alerts') ? 'bg-green-50 text-green-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
        >
            <div className="relative">
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                )}
            </div>
            Alerts
            {unreadCount > 0 && (
                <span className="ml-auto bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                </span>
            )}
        </Link>
    );
};

export default Sidebar;