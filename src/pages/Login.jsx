import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Mail, Lock, Loader2, Shield } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useContext(AuthContext);
  const { isDarkMode } = useTheme();
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

  const themeClasses = {
    bg: isDarkMode ? 'bg-gray-950' : 'bg-gray-50',
    card: isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100',
    input: isDarkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-emerald-500' : 'bg-gray-50 border-gray-300 text-gray-900 focus:border-green-500',
    label: isDarkMode ? 'text-gray-300' : 'text-gray-700',
    muted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${themeClasses.bg}`}>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`max-w-md w-full rounded-3xl shadow-2xl overflow-hidden border ${themeClasses.card}`}
      >
        <div className="bg-gradient-to-br from-emerald-600 to-green-700 p-8 text-center relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            </div>
            
            <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-sm mb-4 border border-white/20">
              <Shield className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h2>
            <p className="text-emerald-50 mt-2 font-medium">Securely access your farm dashboard</p>
        </div>
        
        <div className="p-8">
            {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm mb-6 flex items-center gap-2"
                >
                   <AlertTriangle size={18} />
                   {error}
                </motion.div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                   <label className={`block text-sm font-semibold mb-2 ml-1 ${themeClasses.label}`}>Email Address</label>
                   <div className="relative group">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                       <input 
                         type="email" 
                         className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border outline-none transition-all duration-300 focus:ring-4 focus:ring-emerald-500/10 ${themeClasses.input}`}
                         placeholder="you@example.com"
                         value={email}
                         onChange={(e) => setEmail(e.target.value)}
                         required
                       />
                   </div>
                </div>

                <div>
                   <label className={`block text-sm font-semibold mb-2 ml-1 ${themeClasses.label}`}>Password</label>
                   <div className="relative group">
                       <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                       <input 
                         type="password" 
                         className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border outline-none transition-all duration-300 focus:ring-4 focus:ring-emerald-500/10 ${themeClasses.input}`}
                         placeholder="••••••••"
                         value={password}
                         onChange={(e) => setPassword(e.target.value)}
                         required
                       />
                   </div>
                </div>

                <div className="flex items-center justify-end">
                  <span className="text-sm font-medium text-emerald-500 hover:text-emerald-400 cursor-pointer transition-colors">Forgot Password?</span>
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-bold py-4 rounded-2xl transition shadow-xl shadow-emerald-500/20 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                >
                  {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Signing in...
                      </>
                  ) : (
                      'Sign In'
                  )}
                </motion.button>
            </form>
            
            <div className={`mt-8 text-center text-sm font-medium ${themeClasses.muted}`}>
                New to AgriGuard? <span onClick={() => navigate('/register')} className="text-emerald-500 hover:text-emerald-400 cursor-pointer font-bold transition-colors">Create an account</span>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
