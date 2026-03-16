export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <span className="text-white text-3xl font-bold">NS</span>
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          You're Offline
        </h1>
        
        <p className="text-gray-600 mb-8">
          No internet connection detected. Some features may not be available, but you can still access:
        </p>
        
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">✓ Your Bookings</h3>
            <p className="text-sm text-gray-600">View your confirmed PG bookings and check-in vouchers</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">✓ Digital Agreements</h3>
            <p className="text-sm text-gray-600">Access your signed rental agreements</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">✓ Property Details</h3>
            <p className="text-sm text-gray-600">View saved property information</p>
          </div>
        </div>
        
        <button
          onClick={() => window.location.reload()}
          className="mt-8 w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
