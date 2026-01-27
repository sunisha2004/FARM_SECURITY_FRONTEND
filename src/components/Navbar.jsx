import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { LogOut, User, AlertTriangle } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowLogoutModal(false);
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold text-green-700">Smart Farm Security</span>
        </div>

        {user ? (
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
                 <span className="text-sm font-medium text-gray-700">{user.name}</span>
                 <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-semibold uppercase">{user.role}</span>
             </div>
             
             <button 
                onClick={goToProfile}
                className="relative group"
                title="View Profile"
             >
                 {user?.image ? (
                     <img 
                         src={`http://localhost:5000${user.image}`}
                         alt={user.name}
                         className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 hover:border-green-500 transition cursor-pointer"
                     />
                 ) : (
                     <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-green-50 hover:text-green-600 transition cursor-pointer border-2 border-gray-200 hover:border-green-500">
                         <User size={20} />
                     </div>
                 )}
             </button>

             <button 
               onClick={() => setShowLogoutModal(true)} 
               className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition text-sm font-medium"
             >
               <LogOut size={18} />
               Logout
             </button>
          </div>
        ) : (
          <div className="flex gap-4">
               <Link to="/login" className="text-gray-600 hover:text-green-700 font-medium">Login</Link>
               <Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm">Register</Link>
          </div>
        )}
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all animate-scale-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">Confirm Logout</h3>
                <p className="text-gray-500 text-sm">Are you sure you want to logout?</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">
              You will need to login again to access your dashboard and farm data.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-6 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-medium transition"
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
