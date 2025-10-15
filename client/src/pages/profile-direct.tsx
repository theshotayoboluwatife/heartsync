// Direct profile page that bypasses all complex routing
export default function ProfileDirect() {
  console.log("ProfileDirect component rendering - DIRECT ACCESS");
  
  // Test if React is even working
  const testClick = () => {
    alert("Button clicked - React is working!");
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          🎯 DIRECT PROFILE PAGE
        </h1>
        
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">✅ SUCCESS: Direct component loaded!</p>
          <p className="text-sm">This bypasses all routing complexity</p>
        </div>

        <div className="space-y-3">
          <div className="bg-blue-50 p-3 rounded text-sm">
            <p><strong>URL:</strong> {window.location.href}</p>
            <p><strong>Time:</strong> {new Date().toLocaleTimeString()}</p>
          </div>

          <button 
            onClick={testClick}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Test React Click
          </button>

          <button 
            onClick={() => window.location.href = "/"}
            className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}