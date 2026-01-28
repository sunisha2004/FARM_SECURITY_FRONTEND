import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { 
  Upload, 
  Trash2, 
  Edit, 
  X, 
  Maximize2, 
  Plus,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import AuthContext from '../../context/AuthContext';

const FarmGallery = () => {
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

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

  return (
    <div className="max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Farm Gallery</h1>
          <p className="text-gray-500 mt-1">Manage and showcase your farm's visual records</p>
        </div>
        
        <div className="relative group">
          <input 
            type="file" 
            multiple 
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden" 
            id="multi-upload"
            disabled={uploading}
          />
          <label 
            htmlFor="multi-upload"
            className={`flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all cursor-pointer ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {uploading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            {uploading ? 'Uploading...' : 'Upload Images'}
          </label>
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="animate-spin text-green-600 mb-4" size={48} />
          <p className="text-gray-500 font-medium text-lg">Loading gallery...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200 shadow-sm min-h-[400px] flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <ImageIcon className="text-gray-300" size={40} />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No farm images uploaded yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto mb-6">
            Start building your gallery by uploading images of your farm, equipment, or zones.
          </p>
          <label 
            htmlFor="multi-upload"
            className="text-green-600 font-semibold hover:text-green-700 cursor-pointer flex items-center gap-2"
          >
            <Upload size={18} />
            Click here to upload your first image
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((img) => (
            <div 
              key={img._id} 
              className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="aspect-[4/3] overflow-hidden relative">
                <img 
                  src={`http://localhost:5000${img.imageUrl}`} 
                  alt={img.title || 'Farm Image'} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button 
                    onClick={() => setSelectedImage(img)}
                    className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors"
                    title="View Fullscreen"
                  >
                    <Maximize2 size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-4 flex items-center justify-between">
                <div className="truncate pr-4">
                  <p className="text-sm font-medium text-gray-800 truncate">{img.title || 'Untitled Image'}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{new Date(img.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <label 
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Replace Image"
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
                    onClick={() => handleDelete(img._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Image"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-fade-in backdrop-blur-lg">
          {/* Transparent Backdrop to capture clicks */}
          <div 
            className="absolute inset-0 z-0 cursor-pointer" 
            onClick={() => setSelectedImage(null)}
          ></div>

          <div className="relative z-10 w-full h-full p-4 md:p-16 flex flex-col items-center justify-center pointer-events-none">
            <div className="relative pointer-events-auto max-w-full max-h-full group/modal">
              {/* Close Button - Placed on top-right of the image */}
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-4 -right-4 md:-top-5 md:-right-5 p-2 bg-white text-gray-900 rounded-full hover:bg-gray-100 transition-all z-[120] border-2 border-white shadow-xl flex items-center justify-center hover:scale-110 active:scale-95"
                title="Close (Esc)"
              >
                <X size={24} />
              </button>

              <img 
                src={`http://localhost:5000${selectedImage.imageUrl}`} 
                alt={selectedImage.title} 
                className="max-w-full max-h-[80vh] md:max-h-[85vh] object-contain rounded-xl shadow-2xl animate-scale-in outline outline-1 outline-white/10"
              />
              
              <div className="mt-6 text-center bg-black/40 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/10">
                 {/* <h3 className="text-white font-bold text-xl">{selectedImage.title}</h3> */}
                 <p className="text-gray-400 text-sm mt-1">{new Date(selectedImage.createdAt).toLocaleString(undefined, { dateStyle: 'long', timeStyle: 'short' })}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmGallery;
