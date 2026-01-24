const FarmerDashboard = () => {
    return (
        <div>
             <h1 className="text-2xl font-bold text-gray-800 mb-6">My Dashboard</h1>
              <div className="mt-8 bg-green-50 p-6 rounded-xl border border-green-100">
                 <h3 className="text-lg font-bold text-green-900 mb-2">Welcome Farmer</h3>
                 <p className="text-green-700">Click 'My Farm' to set up your farm details or 'Animal Detection' to analyze videos.</p>
            </div>
        </div>
    )
}
export default FarmerDashboard;
