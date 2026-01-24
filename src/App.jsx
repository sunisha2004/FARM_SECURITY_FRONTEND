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
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import MyFarm from './pages/farmer/MyFarm';
import MyZones from './pages/farmer/MyZones';
import AlertList from './pages/farmer/AlertList';
import AlertDetails from './pages/farmer/AlertDetails';
import { AlertProvider } from './context/AlertContext';


import { DetectionProvider } from './context/DetectionContext';
import GlobalSurveillance from './components/GlobalSurveillance';

function App() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  return (
    <DetectionProvider>
    <AlertProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Navbar />
        {/* Persistent Surveillance Overlay */}
        <GlobalSurveillance />
        
        <div className="flex flex-1 pt-14"> {/* pt-14 for navbar height */}
          {!isAuthPage && <Sidebar />}
          <main className={`flex-1 p-6 transition-all duration-300 ${!isAuthPage ? 'ml-64' : ''}`}>
             <Routes>

                 <Route path="/login" element={<Login />} />
                 <Route path="/register" element={<Register />} />
                 
                 {/* Admin Routes */}
                 <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/farmers" element={<ManageFarmers />} />
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
                 </Route>

                 {/* Shared/Common (Profile) - Accessible by both if needed, or restrict */}
                 <Route element={<ProtectedRoute allowedRoles={['admin', 'farmer']} />}>
                    <Route path="/profile" element={<Profile />} />
                 </Route>

                 <Route path="/" element={<Navigate to="/login" replace />} />
             </Routes>
          </main>
        </div>
      </div>
    </AlertProvider>
    </DetectionProvider>
  );
}

export default App;
