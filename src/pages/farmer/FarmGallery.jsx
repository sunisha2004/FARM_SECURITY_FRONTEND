import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Trash2, 
  Edit, 
  X, 
  Maximize2, 
  Plus,
  Loader2,
  Image as ImageIcon,
  Camera,
  Calendar,
  Layers,
  Search
} from 'lucide-react';
import AuthContext from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const FarmGallery = () => {
  const { isDarkMode } = useTheme();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const { user } = useContext(AuthContext);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const { data } = await axios.get('http://localhost:5000/api/gallery', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setImages(data);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      setUploading(true);
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const { data } = await axios.post('http://localhost:5000/api/gallery', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setImages([...data, ...images]);
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this visual record?')) return;

    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      await axios.delete(`http://localhost:5000/api/gallery/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setImages(images.filter(img => img._id !== id));
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleReplace = async (id, file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = JSON.parse(localStorage.getItem('user'))?.token;
      const { data } = await axios.put(`http://localhost:5000/api/gallery/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setImages(images.map(img => img._id === id ? data : img));
      if (selectedImage && selectedImage._id === id) {
          setSelectedImage(data);
      }
    } catch (error) {
      console.error('Error replacing image:', error);
    }
  };

  const themeClasses = {
    card: isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-100',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    muted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    panel: isDarkMode ? 'bg-gray-900/50 backdrop-blur-xl border-gray-800' : 'bg-white border-gray-100 shadow-sm',
  };

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto pb-24"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className={`text-4xl font-black tracking-tighter flex items-center gap-4 ${themeClasses.text}`}>
            <Camera className="text-emerald-500" size={40} />
            VISUAL ARCHIVE
          </h1>
          <p className={`text-sm font-medium mt-2 max-w-lg ${themeClasses.muted}`}>Secure encrypted repository for farm photography and operational surveillance stills.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <input 
            type="file" 
            multiple 
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden" 
            id="multi-upload"
            disabled={uploading}
          />
          <motion.label 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            htmlFor="multi-upload"
            className={`flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all cursor-pointer ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {uploading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            {uploading ? 'INGESTING DATA...' : 'UPLOAD NEW ENTITY'}
          </motion.label>
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-16 h-16 rounded-[2rem] border-4 border-emerald-500 border-t-transparent animate-spin mb-6"></div>
          <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${themeClasses.muted}`}>Retrieving Biometric Records...</p>
        </div>
      ) : images.length === 0 ? (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-[3rem] p-20 text-center border-2 border-dashed flex flex-col items-center justify-center min-h-[500px] transition-colors duration-500 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}
        >
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 ${isDarkMode ? 'bg-gray-800' : 'bg-white shadow-lg'}`}>
            <ImageIcon className="text-gray-400" size={40} />
          </div>
          <h3 className={`text-2xl font-black tracking-tight mb-4 ${themeClasses.text}`}>REPOSITORY DEVOID OF ENTRIES</h3>
          <p className={`max-w-md mx-auto mb-10 text-sm font-medium leading-relaxed ${themeClasses.muted}`}>
            The visual ledger currently contains no data points. Populate the archive to maintain comprehensive operational visibility.
          </p>
          <label 
            htmlFor="multi-upload"
            className="group flex items-center gap-2 px-8 py-3 bg-emerald-500/10 text-emerald-500 rounded-2xl border border-emerald-500/20 font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-500/20 transition-all cursor-pointer"
          >
            <Upload size={18} className="transition-transform group-hover:-translate-y-1" />
            Initialize Primary Ingest
          </label>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence>
            {images.map((img, idx) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                key={img._id} 
                className={`group relative rounded-[2.5rem] overflow-hidden border transition-all duration-500 shadow-lg ${themeClasses.card} hover:border-emerald-500/50 hover:shadow-emerald-500/10`}
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img 
                    src={`http://localhost:5000${img.imageUrl}`} 
                    alt={img.title || 'Farm Image'} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4">
                    <motion.button 
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedImage(img)}
                      className="p-4 bg-white/20 backdrop-blur-xl rounded-full text-white border border-white/20 hover:bg-emerald-500 transition-all shadow-xl"
                      title="Tactical View"
                    >
                      <Maximize2 size={24} />
                    </motion.button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="truncate flex-1">
                      <p className={`text-sm font-black truncate tracking-tight transition-colors group-hover:text-emerald-500 ${themeClasses.text}`}>{img.title || 'UNNAMED_ENTITY'}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar size={10} className="text-emerald-500" />
                        <p className={`text-[9px] font-black uppercase tracking-widest ${themeClasses.muted}`}>{new Date(img.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <label 
                        className={`p-2 rounded-xl transition-all cursor-pointer ${isDarkMode ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-400/10' : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'}`}
                        title="Update Record"
                      >
                        <input 
                          type="file" 
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleReplace(img._id, e.target.files[0])}
                        />
                        <Edit size={18} />
                      </label>
                      <button 
                        onClick={(e) => handleDelete(e, img._id)}
                        className={`p-2 rounded-xl transition-all ${isDarkMode ? 'text-gray-400 hover:text-red-400 hover:bg-red-400/10' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                        title="Purge Record"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-2xl"
          >
            {/* Background click to close */}
            <div className="absolute inset-0 cursor-pointer" onClick={() => setSelectedImage(null)}></div>

            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative z-10 w-full max-w-6xl h-full flex flex-col items-center justify-center pointer-events-none"
            >
              <div className="relative pointer-events-auto group/modal">
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-6 -right-6 md:-top-10 md:-right-10 p-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all z-[120] shadow-[0_0_30px_rgba(16,185,129,0.5)] border-2 border-white/50"
                  title="Terminate Protocol (Esc)"
                >
                  <X size={28} />
                </motion.button>

                <div className="bg-black/40 p-2 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
                    <img 
                    src={`http://localhost:5000${selectedImage.imageUrl}`} 
                    alt={selectedImage.title} 
                    className="max-w-full max-h-[75vh] md:max-h-[80vh] object-contain rounded-2xl"
                    />
                </div>
                
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="mt-8 text-center bg-black/60 backdrop-blur-2xl px-10 py-6 rounded-3xl border border-white/10 shadow-3xl"
                >
                   <h3 className="text-white font-black text-2xl tracking-tighter uppercase">{selectedImage.title || 'Tactical_Record_01'}</h3>
                   <div className="flex items-center justify-center gap-4 mt-3">
                        <div className="flex items-center gap-2">
                             <Clock size={14} className="text-emerald-500" />
                             <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">{new Date(selectedImage.createdAt).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}</p>
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/30"></div>
                        <div className="flex items-center gap-2">
                             <Layers size={14} className="text-emerald-500" />
                             <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Encrypted Metadata</p>
                        </div>
                   </div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FarmGallery;
