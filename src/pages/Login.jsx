import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Mail, Lock, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      await login({ email, password });
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-green-600 p-6 text-center">
            <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
            <p className="text-green-100 mt-1">Sign in to your dashboard</p>
        </div>
        
        <div className="p-8">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-center">
                   {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                   <div className="relative">
                       <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                       <input 
                         type="email" 
                         className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                         placeholder="you@example.com"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
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
                         className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                         placeholder="••••••••"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         required
                       />
                   </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg transition shadow-lg shadow-green-200 flex justify-center items-center gap-2"
                >
                  {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Signing in...
                      </>
                  ) : (
                      'Sign In'
                  )}
                </button>
            </form>
            
            <div className="mt-6 text-center text-sm text-gray-500">
                Don't have an account? <span onClick={() => navigate('/register')} className="text-green-600 hover:underline cursor-pointer font-medium">Register here</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
