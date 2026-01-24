import { Link } from 'react-router-dom';
import { useAlerts } from '../../context/AlertContext';
import { AlertCircle } from 'lucide-react';

const FarmerDashboard = () => {
    const { unreadCount, alerts } = useAlerts();
    const latestAlert = alerts.length > 0 ? alerts[0] : null;

    return (
        <div>
             <h1 className="text-2xl font-bold text-gray-800 mb-6">My Dashboard</h1>
             
             {/* Alert Banner */}
             {unreadCount > 0 && latestAlert && (
                 <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r shadow-sm flex items-start justify-between animate-pulse">
                     <div className="flex items-center gap-3">
                         <AlertCircle className="text-red-500" />
                         <div>
                             <h3 className="font-bold text-red-800">Security Alert</h3>
                             <p className="text-red-700 text-sm">{latestAlert.message}</p>
                         </div>
                     </div>
                     <Link to="/farmer/alerts" className="text-sm font-semibold text-red-600 hover:underline">
                         View All ({unreadCount})
                     </Link>
                 </div>
             )}

              <div className="mt-8 bg-green-50 p-6 rounded-xl border border-green-100">
                 <h3 className="text-lg font-bold text-green-900 mb-2">Welcome Farmer</h3>
                 <p className="text-green-700">Click 'My Farm' to set up your farm details or 'Animal Detection' to analyze videos.</p>
            </div>
        </div>
    )
}
export default FarmerDashboard;
