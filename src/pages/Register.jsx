import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Mail, Lock, User, Loader2, Shield, Camera, X, Phone } from 'lucide-react';

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
  const navigate = useNavigate();

  const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          setImageFile(file);
          // Create preview
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
    
    // Frontend Validation
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
      // Create FormData to handle file upload
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('phoneNumber', formData.phoneNumber);
      data.append('password', formData.password);
      
      if (imageFile) {
          data.append('image', imageFile);
      }
      
      await register(data);
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
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-center">
            <h2 className="text-2xl font-bold text-white">Create Account</h2>
            <p className="text-green-50 mt-1">Join the Smart Farm Security Dashboard</p>
        </div>
        
        <div className="p-8">
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-center">
                   {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
                 {/* Profile Image Upload */}
                 <div className="flex flex-col items-center mb-4">
                     <div className="relative">
                         {imagePreview ? (
                             <div className="relative">
                                 <img 
                                     src={imagePreview} 
                                     alt="Profile preview" 
                                     className="w-24 h-24 rounded-full object-cover border-4 border-green-100"
                                 />
                                 <button
                                     type="button"
                                     onClick={removeImage}
                                     className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                                 >
                                     <X size={16} />
                                 </button>
                             </div>
                         ) : (
                             <label className="w-24 h-24 rounded-full bg-green-50 border-2 border-dashed border-green-300 flex items-center justify-center cursor-pointer hover:bg-green-100 transition">
                                 <Camera className="text-green-500" size={32} />
                                 <input 
                                     type="file" 
                                     accept="image/*"
                                     onChange={handleImageChange}
                                     className="hidden"
                                 />
                             </label>
                         )}
                     </div>
                     <p className="text-xs text-gray-500 mt-2">Profile Picture (Optional)</p>
                 </div>

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
                   <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                   <div className="relative">
                       <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                       <input 
                         type="text" 
                         name="phoneNumber"
                         className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                         placeholder="1234567890"
                         value={formData.phoneNumber}
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

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                   <div className="relative">
                       <Lock className="absolute left-3 top-3 text-gray-400" size={18} />
                       <input 
                         type="password"
                         name="confirmPassword"
                         className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                         placeholder="••••••••"
                         value={formData.confirmPassword}
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
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-lg transition shadow-lg flex justify-center items-center gap-2"
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
