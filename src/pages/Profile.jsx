import { useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthContext from '../context/AuthContext';
import authService from '../services/authService';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, Shield, Save, Loader2, Camera, X, Phone, CheckCircle, AlertCircle } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const { isDarkMode } = useTheme();
  
  const [name, setName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

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

  const handleUpdate = async () => {
      setIsLoading(true);
      setMessage(null);
      try {
          const formData = new FormData();
          formData.append('name', name);
          formData.append('phoneNumber', phoneNumber);
          
          if (imageFile) {
              formData.append('image', imageFile);
          }
          
          const updated = await authService.updateMe(formData);
          updateUser(updated);
          setMessage({ type: 'success', text: 'Profile updated successfully' });
          setIsEditing(false);
          setImageFile(null);
          setImagePreview(null);
      } catch (error) {
           setMessage({ type: 'error', text: 'Failed to update profile' });
      } finally {
          setIsLoading(false);
      }
  };

  const themeClasses = {
    card: isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100',
    header: isDarkMode ? 'from-emerald-900 to-green-950' : 'from-emerald-500 to-green-600',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    muted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    label: isDarkMode ? 'text-gray-500' : 'text-gray-400',
    input: isDarkMode ? 'bg-gray-800 border-gray-700 text-white focus:border-emerald-500' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-green-500',
  };

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 md:p-8 max-w-4xl mx-auto pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
              <h1 className={`text-3xl font-black tracking-tight ${themeClasses.text}`}>User Account</h1>
              <p className={`text-sm font-medium ${themeClasses.muted}`}>Manage your personal credentials and security settings</p>
          </div>
          <AnimatePresence>
            {message && (
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl border font-bold text-sm shadow-xl ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}
                >
                    {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    {message.text}
                </motion.div>
            )}
          </AnimatePresence>
      </div>

      <div className={`rounded-[2.5rem] shadow-2xl overflow-hidden border transition-all duration-500 ${themeClasses.card}`}>
          <div className={`bg-gradient-to-br h-40 relative overflow-hidden ${themeClasses.header}`}>
              <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl -mr-20 -mt-20"></div>
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-black rounded-full blur-3xl -ml-20 -mb-20"></div>
              </div>
          </div>
          
          <div className="px-8 pb-10">
              <div className="relative flex flex-col sm:flex-row justify-between items-center sm:items-end -mt-16 mb-10 gap-6">
                  <div className={`p-2 rounded-[2rem] shadow-2xl relative group transition-colors duration-500 ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
                      <div className="relative overflow-hidden rounded-[1.75rem]">
                        {imagePreview ? (
                            <img 
                                src={imagePreview}
                                alt="Preview"
                                className="w-32 h-32 object-cover"
                            />
                        ) : user?.image ? (
                            <img 
                                src={`http://localhost:5000${user.image}`}
                                alt={user.name}
                                className="w-32 h-32 object-cover"
                            />
                        ) : (
                            <div className={`w-32 h-32 flex items-center justify-center ${isDarkMode ? 'bg-gray-800 text-gray-600' : 'bg-gray-50 text-gray-300'}`}>
                                <User size={56} />
                            </div>
                        )}
                        
                        {isEditing && (
                            <motion.label 
                               initial={{ opacity: 0 }}
                               whileHover={{ opacity: 1 }}
                               className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-600/60 backdrop-blur-sm cursor-pointer transition-all border-2 border-emerald-400 border-dashed rounded-[1.75rem] m-1"
                            >
                                <Camera className="text-white mb-2" size={28} />
                                <span className="text-[10px] text-white font-black uppercase tracking-widest">Update Photo</span>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </motion.label>
                        )}
                      </div>
                      
                      {isEditing && imagePreview && (
                          <button
                              type="button"
                              onClick={removeImage}
                              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-xl p-2 hover:bg-red-600 transition shadow-lg shadow-red-500/20"
                          >
                              <X size={16} />
                          </button>
                      )}
                  </div>
                  
                  {!isEditing ? (
                       <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setIsEditing(true)}
                          className={`px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg flex items-center gap-2 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'}`}
                       >
                           Edit Credentials
                       </motion.button>
                  ) : (
                      <div className="flex gap-4">
                          <button 
                            onClick={() => {
                                setIsEditing(false);
                                setImageFile(null);
                                setImagePreview(null);
                                setName(user?.name || '');
                                setPhoneNumber(user?.phoneNumber || '');
                            }}
                            className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
                          >
                            Discard
                          </button>
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleUpdate}
                            disabled={isLoading}
                            className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 transition shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                          >
                             {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                             Sync Profile
                          </motion.button>
                      </div>
                  )}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  <div className="space-y-6">
                      <div className="group">
                          <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1 transition-colors group-focus-within:text-emerald-500 ${themeClasses.label}`}>Full Name</label>
                          <div className="relative">
                              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                              {isEditing ? (
                                  <input 
                                    type="text" 
                                    value={name} 
                                    onChange={(e) => setName(e.target.value)}
                                    className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border outline-none transition-all duration-300 focus:ring-4 focus:ring-emerald-500/10 ${themeClasses.input}`}
                                    placeholder="Enter your name"
                                  />
                              ) : (
                                  <div className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border flex items-center font-bold tracking-tight ${isDarkMode ? 'border-gray-800/50 bg-gray-800/20 text-white' : 'border-gray-100 bg-gray-50/50 text-gray-900 text-lg'}`}>
                                    {user?.name}
                                  </div>
                              )}
                          </div>
                      </div>
                      
                      <div className="group">
                          <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1 transition-colors group-focus-within:text-emerald-500 ${themeClasses.label}`}>Registration Email</label>
                          <div className="relative">
                              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                              <div className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border flex items-center font-bold tracking-tight opacity-70 ${isDarkMode ? 'border-gray-800/50 bg-gray-800/20 text-white' : 'border-gray-100 bg-gray-50/50 text-gray-900 text-lg'}`}>
                                {user?.email}
                              </div>
                          </div>
                          <p className={`text-[10px] mt-2 ml-1 italic ${themeClasses.muted}`}>Email synchronization is managed by admin services</p>
                      </div>
                  </div>
                  
                  <div className="space-y-6">
                       <div className="group">
                           <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1 transition-colors group-focus-within:text-emerald-500 ${themeClasses.label}`}>Contact Number</label>
                           <div className="relative">
                               <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-emerald-500 transition-colors" size={20} />
                               {isEditing ? (
                                   <input 
                                     type="text" 
                                     value={phoneNumber} 
                                     onChange={(e) => setPhoneNumber(e.target.value)}
                                     className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border outline-none transition-all duration-300 focus:ring-4 focus:ring-emerald-500/10 ${themeClasses.input}`}
                                     placeholder="1234567890"
                                   />
                               ) : (
                                   <div className={`w-full pl-12 pr-4 py-3.5 rounded-2xl border flex items-center font-bold tracking-tight ${isDarkMode ? 'border-gray-800/50 bg-gray-800/20 text-white' : 'border-gray-100 bg-gray-50/50 text-gray-900 text-lg'}`}>
                                     {user?.phoneNumber}
                                   </div>
                               )}
                           </div>
                       </div>

                       <div className="group">
                          <label className={`block text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1 ${themeClasses.label}`}>System Authority</label>
                          <div className={`px-6 py-4 rounded-3xl flex items-center justify-between border ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                              <div className="flex items-center gap-3">
                                  <Shield className="text-emerald-500" size={24} />
                                  <span className="text-sm font-black uppercase tracking-[0.1em] text-emerald-500">{user?.role} Access Access</span>
                              </div>
                              <div className={`w-3 h-3 rounded-full animate-pulse bg-emerald-500 shadow-lg shadow-emerald-500/50`}></div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </motion.div>
  );
};

export default Profile;
