import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import { useAlerts } from '../context/AlertContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  Users, 
  Map, 
  LogOut, 
  Shield, 
  Video, 
  Tractor,
  ScanEye,
  Bell,
  AlertTriangle,
  Images
} from 'lucide-react';

const Sidebar = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowLogoutModal(false);
  };

  const isActive = (path) => location.pathname === path;

  const themeClasses = {
    sidebar: isDarkMode ? 'bg-gray-950 border-gray-800 text-gray-200' : 'bg-white shadow-xl border-r border-gray-200 text-gray-800',
    itemActive: isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border-l-4 border-emerald-500' : 'bg-green-50 text-green-700 border-l-4 border-green-600 font-medium',
    itemHover: isDarkMode ? 'hover:bg-gray-900 hover:text-white' : 'hover:bg-gray-50 hover:text-green-700',
    muted: isDarkMode ? 'text-gray-500' : 'text-gray-400',
    modal: isDarkMode ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white text-gray-800',
  };

  const menuItems = user?.role === 'admin' ? [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/farmers', label: 'Manage Farmers', icon: Users },
    { to: '/admin/farms', label: 'Farms Overview', icon: Map },
  ] : [
    { to: '/farmer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/farmer/my-farm', label: 'My Farm', icon: Tractor },
    { to: '/farmer/zones', label: 'My Zones', icon: Map },
    { to: '/farmer/detection', label: 'Animal Detection', icon: ScanEye },
    { to: '/farmer/gallery', label: 'Farm Gallery', icon: Images },
  ];

  return (
    <motion.aside 
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed left-0 top-16 w-64 h-[calc(100vh-4rem)] z-40 flex flex-col transition-colors duration-500 ${themeClasses.sidebar}`}
    >
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="flex items-center gap-3 px-2 mb-8">
           <div className={`p-2 rounded-xl transition-colors duration-500 ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-green-100 text-green-700'}`}>
              {user?.role === 'admin' ? <Shield size={24} /> : <Tractor size={24} />}
           </div>
           <div>
               <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${themeClasses.muted}`}>{user?.role === 'admin' ? 'Administrator' : 'Farmer Portal'}</p>
               <h3 className={`font-bold transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{user?.name}</h3>
           </div>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item, idx) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
            >
              <Link 
                to={item.to} 
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive(item.to) ? themeClasses.itemActive : `text-gray-500 ${themeClasses.itemHover}`}`}
              >
                <item.icon size={20} className={`transition-transform duration-300 ${isActive(item.to) ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            </motion.div>
          ))}

          {user?.role === 'farmer' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + menuItems.length * 0.05 }}
            >
              <AlertsLink isActive={isActive} themeClasses={themeClasses} isDarkMode={isDarkMode} />
            </motion.div>
          )}
        </nav>
      </div>

      <div className={`p-4 border-t transition-colors duration-500 ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
        <button 
          onClick={() => setShowLogoutModal(true)}
          className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all duration-300 font-medium group ${isDarkMode ? 'text-red-400 hover:bg-red-500/10' : 'text-red-600 hover:bg-red-50'}`}
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          Logout
        </button>
      </div>

      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`${themeClasses.modal} rounded-3xl shadow-2xl p-8 max-w-md w-full border ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}
            >
              <div className="flex items-center gap-5 mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-500 ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
                  <AlertTriangle className="text-red-600" size={28} />
                </div>
                <div>
                  <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Confirm Logout</h3>
                  <p className={`text-sm ${themeClasses.muted}`}>Are you sure you want to end your session?</p>
                </div>
              </div>
              
              <p className={`mb-8 leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                You will need to sign in again to access your dashboard, monitor farm zones, and receive real-time alerts.
              </p>
              
              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className={`px-8 py-3 rounded-2xl font-semibold transition-all duration-300 ${isDarkMode ? 'text-gray-300 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-8 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all duration-300 shadow-xl shadow-red-600/30 active:scale-95"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
};

const AlertsLink = ({ isActive, themeClasses, isDarkMode }) => {
    const { unreadCount } = useAlerts();
    const active = isActive('/farmer/alerts');
    
    return (
        <Link 
            to="/farmer/alerts" 
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative group ${active ? themeClasses.itemActive : `text-gray-500 ${themeClasses.itemHover}`}`}
        >
            <div className="relative">
                <Bell size={20} className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                )}
            </div>
            <span className="font-medium">Alerts</span>
            {unreadCount > 0 && (
                <span className={`ml-auto font-bold px-2 py-0.5 rounded-full text-xs transition-colors duration-500 ${isDarkMode ? 'bg-red-500 text-white' : 'bg-red-100 text-red-600'}`}>
                    {unreadCount}
                </span>
            )}
        </Link>
    );
};

export default Sidebar;