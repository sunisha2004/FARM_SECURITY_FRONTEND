import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center z-10">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-green-700">Smart Farm Security</span>
      </div>

      {user ? (
        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
               <span className="text-sm font-medium text-gray-700">{user.name}</span>
               <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-semibold uppercase">{user.role}</span>
           </div>
           
           <div className="relative group">
              <button className="flex items-center gap-2 text-gray-600 hover:text-green-700 transition">
                  <User size={20} />
              </button>
              {/* Dropdown could go here, but keeping it simple for now */}
           </div>

           <button 
             onClick={handleLogout} 
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
  );
};

export default Navbar;
