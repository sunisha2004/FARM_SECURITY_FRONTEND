import { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, User, AlertTriangle, Shield, Sun, Moon } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowLogoutModal(false);
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  const themeClasses = {
    nav: isDarkMode ? 'bg-gray-900/80 border-gray-800 text-white' : 'bg-white shadow-sm border-b text-gray-800',
    link: isDarkMode ? 'text-gray-300 hover:text-emerald-400' : 'text-gray-600 hover:text-green-700',
    modal: isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800',
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 h-16 px-6 flex justify-between items-center z-50 backdrop-blur-md transition-all duration-300 ${themeClasses.nav}`}>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-emerald-500" />
          <span className={`text-xl font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-green-700'}`}>AgriGuard</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {user ? (
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-3">
                   <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>{user.name}</span>
                   <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${isDarkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-green-100 text-green-800'}`}>
                     {user.role}
                   </span>
               </div>
               
               <button 
                  onClick={goToProfile}
                  className="relative group transition-transform hover:scale-105"
                  title="View Profile"
               >
                   {user?.image ? (
                       <img 
                           src={`http://localhost:5000${user.image}`}
                           alt={user.name}
                           className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 hover:border-emerald-500 transition cursor-pointer"
                       />
                   ) : (
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center transition cursor-pointer border-2 ${isDarkMode ? 'bg-gray-800 text-gray-400 border-gray-700 hover:border-emerald-500' : 'bg-gray-100 text-gray-400 border-gray-200 hover:border-green-500 hover:bg-green-50 hover:text-green-600'}`}>
                           <User size={20} />
                       </div>
                   )}
               </button>

               <button 
                 onClick={() => setShowLogoutModal(true)} 
                 className={`flex items-center gap-2 transition text-sm font-medium ${isDarkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-600'}`}
               >
                 <LogOut size={18} />
                 Logout
               </button>
            </div>
          ) : (
            <div className="flex gap-4 items-center">
                 {!['/login', '/register'].includes(location.pathname) && (
                   <>
                     <Link to="/login" className={`font-medium transition-colors ${themeClasses.link}`}>Login</Link>
                     <Link to="/register" className="bg-emerald-600 text-white px-5 py-2 rounded-full font-semibold hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20">
                       Register
                     </Link>
                   </>
                 )}
            </div>
          )}
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in p-4">
          <div className={`${themeClasses.modal} rounded-2xl shadow-2xl p-6 max-w-md w-full transform transition-all animate-scale-in border ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-red-900/30' : 'bg-red-100'}`}>
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>Confirm Logout</h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Are you sure you want to logout?</p>
              </div>
            </div>
            
            <p className={`mb-6 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              You will need to login again to access your dashboard and farm data.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className={`px-6 py-2.5 rounded-lg font-medium transition ${isDarkMode ? 'text-gray-400 hover:bg-white/5' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition shadow-lg shadow-red-600/20 flex items-center gap-2"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

