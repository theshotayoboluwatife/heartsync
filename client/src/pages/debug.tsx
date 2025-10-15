import { useAuth } from "@/hooks/useAuth";

export default function Debug() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
        
        <div className="bg-white p-4 rounded-lg shadow space-y-4">
          <div>
            <strong>Authentication Status:</strong>
            <ul className="ml-4 mt-2 space-y-1">
              <li>isLoading: {isLoading ? "true" : "false"}</li>
              <li>isAuthenticated: {isAuthenticated ? "true" : "false"}</li>
              <li>user: {user ? "exists" : "null"}</li>
            </ul>
          </div>
          
          {user && (
            <div>
              <strong>User Data:</strong>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          )}
          
          <div>
            <strong>Current URL:</strong>
            <p className="mt-1 text-sm">{window.location.href}</p>
          </div>
          
          <div className="space-y-2">
            <button 
              onClick={() => window.location.href = "/api/login"}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Go to Login
            </button>
            <button 
              onClick={() => window.location.href = "/api/logout"}
              className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600"
            >
              Go to Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}