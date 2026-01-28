import { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import authService from '../services/authService';
import { User, Mail, Shield, Save, Loader2, Camera, X, Phone } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
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

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">User Profile</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-32"></div>
          
          <div className="px-8 pb-8">
              <div className="relative flex justify-between items-end -mt-12 mb-6">
                  <div className="bg-white p-2 rounded-full shadow-md relative group">
                      {imagePreview ? (
                          <div className="relative">
                              <img 
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-24 h-24 rounded-full object-cover"
                              />
                              {isEditing && (
                                  <button
                                      type="button"
                                      onClick={removeImage}
                                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                                  >
                                      <X size={16} />
                                  </button>
                              )}
                          </div>
                      ) : user?.image ? (
                          <div className="relative">
                              <img 
                                  src={`http://localhost:5000${user.image}`}
                                  alt={user.name}
                                  className="w-24 h-24 rounded-full object-cover"
                              />
                              {isEditing && (
                                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition">
                                      <Camera className="text-white" size={24} />
                                      <input 
                                          type="file" 
                                          accept="image/*"
                                          onChange={handleImageChange}
                                          className="hidden"
                                      />
                                  </label>
                              )}
                          </div>
                      ) : (
                          <div className="relative">
                              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                  <User size={48} />
                              </div>
                              {isEditing && (
                                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition">
                                      <Camera className="text-white" size={24} />
                                      <input 
                                          type="file" 
                                          accept="image/*"
                                          onChange={handleImageChange}
                                          className="hidden"
                                      />
                                  </label>
                              )}
                          </div>
                      )}
                  </div>
                  
                  {message && (
                     <div className={`text-sm px-4 py-2 rounded-lg font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                         {message.text}
                     </div>
                  )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                      <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                      <div className="flex items-center gap-3">
                          <User className="text-gray-400" />
                          {isEditing ? (
                              <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                className="flex-1 border rounded px-3 py-1.5 focus:ring-2 focus:ring-green-500 outline-none"
                              />
                          ) : (
                              <span className="text-lg font-medium text-gray-900">{user?.name}</span>
                          )}
                      </div>
                  </div>
                  
                   <div className="space-y-4">
                       <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
                       <div className="flex items-center gap-3">
                           <Mail className="text-gray-400" />
                           <span className="text-lg font-medium text-gray-900">{user?.email}</span>
                       </div>
                   </div>

                   <div className="space-y-4">
                       <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wider">Phone Number</label>
                       <div className="flex items-center gap-3">
                           <Phone className="text-gray-400" />
                           {isEditing ? (
                               <input 
                                 type="text" 
                                 value={phoneNumber} 
                                 onChange={(e) => setPhoneNumber(e.target.value)}
                                 className="flex-1 border rounded px-3 py-1.5 focus:ring-2 focus:ring-green-500 outline-none"
                               />
                           ) : (
                               <span className="text-lg font-medium text-gray-900">{user?.phoneNumber}</span>
                           )}
                       </div>
                   </div>

                   <div className="space-y-4">
                      <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wider">Role</label>
                      <div className="flex items-center gap-3">
                          <Shield className="text-gray-400" />
                           <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-bold uppercase">{user?.role}</span>
                      </div>
                  </div>
              </div>
              
              <div className="mt-8 border-t pt-6 flex justify-end">
                  {isEditing ? (
                      <div className="flex gap-3">
                          <button 
                            onClick={() => {
                                setIsEditing(false);
                                setImageFile(null);
                                setImagePreview(null);
                                setName(user?.name || '');
                                setPhoneNumber(user?.phoneNumber || '');
                            }}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={handleUpdate}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition"
                          >
                             {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                             Save Changes
                          </button>
                      </div>
                  ) : (
                      <button 
                         onClick={() => setIsEditing(true)}
                         className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium transition"
                      >
                          Edit Profile
                      </button>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default Profile;
