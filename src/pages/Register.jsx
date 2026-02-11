import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Mail, Lock, User, Loader2, Shield, Camera, X, Phone, AlertTriangle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
      name: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useContext(AuthContext);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setImageFile(file);
          const reader = new FileReader();
          reader.onloadend = () => {
              setImagePreview(reader.result);
          };
          reader.readAsDataURL(file);
      }
  };

  const removeImage = () => {
      setImageFile(null);
      setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (formData.password !== formData.confirmPassword) {
        return setError("Passwords do not match");
    }

    if (!/^\d{10}$/.test(formData.phoneNumber)) {
        return setError("Please enter a valid 10-digit phone number");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        return setError("Please enter a valid email address");
    }

    setIsSubmitting(true);
    
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('phoneNumber', formData.phoneNumber);
      data.append('password', formData.password);
      
      if (imageFile) {
          data.append('image', imageFile);
      }
      
      await register(data);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
        className={`max-w-md w-full rounded-3xl shadow-2xl overflow-hidden border ${themeClasses.card} my-8`}
      >
        <div className="bg-gradient-to-br from-emerald-600 to-green-700 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            </div>
            <div className="inline-flex p-3 rounded-2xl bg-white/10 backdrop-blur-sm mb-4 border border-white/20">
              <Shield className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Create Account</h2>
            <p className="text-emerald-50 mt-2 font-medium">Join the AgriGuard secure ecosystem</p>
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
            
            <form onSubmit={handleSubmit} className="space-y-5">
                 <div className="flex flex-col items-center mb-6">
                     <div className="relative group">
                         {imagePreview ? (
                             <motion.div 
                               initial={{ scale: 0.9, opacity: 0 }}
                               animate={{ scale: 1, opacity: 1 }}
                               className="relative"
                             >
                                 <img 
                                     src={imagePreview} 
                                     alt="Profile preview" 
                                     className="w-28 h-28 rounded-3xl object-cover border-4 border-emerald-500/20 shadow-xl"
                                 />
                                 <button
                                     type="button"
                                     onClick={removeImage}
                                     className="absolute -top-3 -right-3 bg-red-500 text-white rounded-xl p-2 hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                                 >
                                     <X size={16} />
                                 </button>
                             </motion.div>
                         ) : (
                             <label className={`w-28 h-28 rounded-3xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all duration-300 hover:border-emerald-500 group ${isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-800/50' : 'bg-green-50 border-green-200 hover:bg-green-100'}`}>
                                 <Camera className="text-emerald-500 group-hover:scale-110 transition-transform" size={32} />
                                 <input 
                                     type="file" 
                                     accept="image/*"
                                     onChange={handleImageChange}
                                     className="hidden"
                                 />
                             </label>
                         )}
                     </div>
                     <p className={`text-xs font-bold mt-3 uppercase tracking-wider ${themeClasses.muted}`}>Profile Picture</p>
                 </div>

                 <div className="grid grid-cols-1 gap-5">
                   <div>
                     <label className={`block text-sm font-semibold mb-2 ml-1 ${themeClasses.label}`}>Full Name</label>
                     <div className="relative group">
                         <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                         <input 
                           type="text" 
                           name="name"
                           className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border outline-none transition-all duration-300 focus:ring-4 focus:ring-emerald-500/10 ${themeClasses.input}`}
                           placeholder="John Doe"
                           value={formData.name}
                           onChange={handleChange}
                           required
                         />
                     </div>
                   </div>

                   <div>
                     <label className={`block text-sm font-semibold mb-2 ml-1 ${themeClasses.label}`}>Email Address</label>
                     <div className="relative group">
                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                         <input 
                           type="email" 
                           name="email"
                           className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border outline-none transition-all duration-300 focus:ring-4 focus:ring-emerald-500/10 ${themeClasses.input}`}
                           placeholder="you@example.com"
                           value={formData.email}
                           onChange={handleChange}
                           required
                         />
                     </div>
                   </div>

                   <div>
                     <label className={`block text-sm font-semibold mb-2 ml-1 ${themeClasses.label}`}>Phone Number</label>
                     <div className="relative group">
                         <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                         <input 
                           type="text" 
                           name="phoneNumber"
                           className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border outline-none transition-all duration-300 focus:ring-4 focus:ring-emerald-500/10 ${themeClasses.input}`}
                           placeholder="1234567890"
                           value={formData.phoneNumber}
                           onChange={handleChange}
                           required
                         />
                     </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div>
                       <label className={`block text-sm font-semibold mb-2 ml-1 ${themeClasses.label}`}>Password</label>
                       <div className="relative group">
                           <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                           <input 
                             type="password"
                             name="password"
                             className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border outline-none transition-all duration-300 focus:ring-4 focus:ring-emerald-500/10 ${themeClasses.input}`}
                             placeholder="••••••••"
                             value={formData.password}
                             onChange={handleChange}
                             required
                           />
                       </div>
                     </div>

                     <div>
                       <label className={`block text-sm font-semibold mb-2 ml-1 ${themeClasses.label}`}>Confirm</label>
                       <div className="relative group">
                           <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
                           <input 
                             type="password"
                             name="confirmPassword"
                             className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border outline-none transition-all duration-300 focus:ring-4 focus:ring-emerald-500/10 ${themeClasses.input}`}
                             placeholder="••••••••"
                             value={formData.confirmPassword}
                             onChange={handleChange}
                             required
                           />
                       </div>
                     </div>
                   </div>
                 </div>

                 <motion.button 
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   type="submit" 
                   disabled={isSubmitting}
                   className="w-full bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-bold py-4 rounded-2xl transition shadow-xl shadow-emerald-500/20 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                 >
                   {isSubmitting ? (
                       <>
                         <Loader2 className="animate-spin" size={20} />
                         Creating Account...
                       </>
                   ) : (
                       'Register Now'
                   )}
                 </motion.button>
            </form>
            
             <div className={`mt-8 text-center text-sm font-medium ${themeClasses.muted}`}>
                Already registered? <span onClick={() => navigate('/login')} className="text-emerald-500 hover:text-emerald-400 cursor-pointer font-bold transition-colors">Login here</span>
            </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
