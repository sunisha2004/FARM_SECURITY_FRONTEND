import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AnimalDetection from './pages/AnimalDetection';
import { useLocation } from 'react-router-dom';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageFarmers from './pages/admin/ManageFarmers';
import FarmerDetails from './pages/admin/FarmerDetails';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import MyFarm from './pages/farmer/MyFarm';
import MyZones from './pages/farmer/MyZones';
import AlertList from './pages/farmer/AlertList';
import AlertDetails from './pages/farmer/AlertDetails';
import FarmGallery from './pages/farmer/FarmGallery';
import { AlertProvider } from './context/AlertContext';
import LandingPage from './pages/LandingPage';
import { ThemeProvider, useTheme } from './context/ThemeContext';


import { DetectionProvider } from './context/DetectionContext';
import GlobalSurveillance from './components/GlobalSurveillance';
import AxiosInterceptor from './components/AxiosInterceptor';

function AppContent() {
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const isAuthPage = ['/login', '/register', '/'].includes(location.pathname);

  return (
    <AxiosInterceptor>
      <div className={`min-h-screen flex flex-col transition-colors duration-500 ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'}`}>
        {location.pathname !== '/' && <Navbar />}
        {/* Persistent Surveillance Overlay */}
        <GlobalSurveillance />
        
        <div className={`flex flex-1 ${location.pathname !== '/' ? 'pt-14' : ''}`}> {/* pt-14 for navbar height */}
          {!isAuthPage && <Sidebar />}
          <main className={`flex-1 transition-all duration-300 ${location.pathname !== '/' ? 'p-6' : ''} ${!isAuthPage ? 'ml-64' : ''}`}>
             <Routes>

                 <Route path="/login" element={<Login />} />
                 <Route path="/register" element={<Register />} />
                 
                 {/* Admin Routes */}
                 <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/farmers" element={<ManageFarmers />} />
                    <Route path="/admin/farmers/:id" element={<FarmerDetails />} />
                    <Route path="/admin/farms" element={<div className="p-10">Farms Overview (Coming Soon)</div>} />
                 </Route>

                 {/* Farmer Routes */}
                 <Route element={<ProtectedRoute allowedRoles={['farmer']} />}>
                    <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
                    <Route path="/farmer/my-farm" element={<MyFarm />} />
                    <Route path="/farmer/zones" element={<MyZones />} />
                    <Route path="/farmer/detection" element={<AnimalDetection />} />
                    <Route path="/farmer/alerts" element={<AlertList />} />
                    <Route path="/farmer/alerts/:id" element={<AlertDetails />} />
                    <Route path="/farmer/gallery" element={<FarmGallery />} />
                 </Route>

                 {/* Shared/Common (Profile) - Accessible by both if needed, or restrict */}
                 <Route element={<ProtectedRoute allowedRoles={['admin', 'farmer']} />}>
                    <Route path="/profile" element={<Profile />} />
                 </Route>

                 <Route path="/" element={<LandingPage />} />
             </Routes>
          </main>
        </div>
      </div>
    </AxiosInterceptor>
  );
}

function App() {
  return (
    <ThemeProvider>
      <DetectionProvider>
        <AlertProvider>
          <AppContent />
        </AlertProvider>
      </DetectionProvider>
    </ThemeProvider>
  );
}

export default App;










