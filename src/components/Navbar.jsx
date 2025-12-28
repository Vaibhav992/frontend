import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-600">
              AssignmentHub
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="text-gray-700">
                  Welcome, <span className="font-semibold">{user.name}</span>
                  <span className="ml-2 px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                    {user.role}
                  </span>
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-gray-700 hover:text-primary-600 transition"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

