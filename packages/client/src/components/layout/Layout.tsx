import { Link, Outlet } from "@tanstack/react-router";
import { useAuth } from "../../context/AuthContext";

export function Layout() {
  const auth = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-6">
              <Link to="/" className="text-xl font-bold text-gray-900">
                Debts Tracker
              </Link>
              {auth.isAuthenticated && (
                <>
                  <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                    Dashboard
                  </Link>
                  <Link to="/debts/paid" className="text-gray-600 hover:text-gray-900">
                    Pagadas
                  </Link>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              {auth.isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600">{auth.user?.name}</span>
                  <button
                    onClick={auth.logout}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-gray-900">
                    Iniciar sesión
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
