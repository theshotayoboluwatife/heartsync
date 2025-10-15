export default function Test() {
  return (
    <div className="min-h-screen bg-red-500 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">TEST PAGE</h1>
        <p className="text-white">This is a simple test page to verify routing works</p>
        <div className="mt-4 space-y-2">
          <button 
            onClick={() => window.location.href = "/"}
            className="block w-full bg-white text-red-500 p-2 rounded hover:bg-gray-100"
          >
            Go to Home
          </button>
          <button 
            onClick={() => window.location.href = "/debug"}
            className="block w-full bg-white text-red-500 p-2 rounded hover:bg-gray-100"
          >
            Go to Debug
          </button>
        </div>
      </div>
    </div>
  );
}