import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Mail, Lock, User, Loader2, Shield } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      password: ''
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      await register(formData);
      navigate('/login'); // Redirect to login after successful register
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gray-800 p-6 text-center">
            <h2 className="text-2xl font-bold text-white">Create Account</h2>
            <p className="text-gray-300 mt-1">Join the Smart Farm Security Dashboard</p>
        </div>
        
        <div className="p-8">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-center">
                   {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                   <div className="relative">
                       <User className="absolute left-3 top-3 text-gray-400" size={18} />
                       <input 
                         type="text" 
                         name="name"
                         className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                         placeholder="John Doe"
                         value={formData.name}
                         onChange={handleChange}
                         required
                       />
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                   <div className="relative">
                       <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                       <input 
                         type="email" 
                         name="email"
                         className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                         placeholder="you@example.com"
                         value={formData.email}
                         onChange={handleChange}
                         required
                       />
                   </div>
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                   <div className="relative">
                       <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                       <input 
                         type="password"
                         name="password"
                         className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                         placeholder="••••••••"
                         value={formData.password}
                         onChange={handleChange}
                         required
                       />
                   </div>
                </div>

{/* Role selection removed, defaults to Farmer */}

                <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold py-2.5 rounded-lg transition shadow-lg flex justify-center items-center gap-2"
                    >
                      {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin" size={20} />
                            Creating Account...
                          </>
                      ) : (
                          'Register'
                      )}
                    </button>
                </div>
            </form>
            
             <div className="mt-6 text-center text-sm text-gray-500">
                Already have an account? <span onClick={() => navigate('/login')} className="text-green-600 hover:underline cursor-pointer font-medium">Login here</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
