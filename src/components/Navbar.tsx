import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [dashboardOpen, setDashboardOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navLinks = [
    { 
      path: '/', 
      label: 'Dashboard', 
      icon: '📊',
      isMain: true,
      submenu: [
        { path: '/libros', label: 'Estad. Libros', icon: '📈' },
        { path: '/autores', label: 'Estad. Autores', icon: '📋' }
      ]
    },
    { path: '/prestamos', label: 'Préstamos', icon: '📖' },
    { path: '/usuarios', label: 'Usuarios', icon: '👥' },
    { path: '/libros-manage', label: 'Gest. Libros', icon: '📕' },
    { path: '/autores-manage', label: 'Gest. Autores', icon: '🖋️' },
    { path: '/generos-manage', label: 'Géneros', icon: '🏷️' }
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white shadow-2xl flex flex-col">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <span className="text-2xl">📖</span>
          </div>
          <div>
            <h1 className="text-lg font-bold">Biblioteca</h1>
            <p className="text-xs text-gray-400">Sistema de Gestión</p>
          </div>
        </div>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {navLinks.map((link) => (
            <li key={link.path}>
              {link.isMain ? (
                // Dashboard con submenu
                <div>
                  <button
                    onClick={() => setDashboardOpen(!dashboardOpen)}
                    className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive(link.path) || 
                      link.submenu?.some(sub => sub.path === location.pathname)
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{link.icon}</span>
                      <span className="font-medium">{link.label}</span>
                    </div>
                    <span className={`transform transition-transform ${dashboardOpen ? 'rotate-90' : ''}`}>
                      ▶
                    </span>
                  </button>
                  
                  {/* Submenu */}
                  {dashboardOpen && (
                    <ul className="ml-6 mt-2 space-y-1 border-l-2 border-gray-600 pl-4">
                      <li>
                        <Link
                          to={link.path}
                          className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                            isActive(link.path)
                              ? 'bg-blue-600 text-white shadow-lg'
                              : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          <span className="text-lg">🏠</span>
                          <span className="font-medium">Principal</span>
                        </Link>
                      </li>
                      {link.submenu?.map((sublink) => (
                        <li key={sublink.path}>
                          <Link
                            to={sublink.path}
                            className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                              isActive(sublink.path)
                                ? 'bg-blue-600 text-white shadow-lg'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                          >
                            <span className="text-lg">{sublink.icon}</span>
                            <span className="font-medium">{sublink.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                // Enlaces normales
                <Link
                  to={link.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(link.path)
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3 px-4 py-2">
          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
            <span className="text-sm">👤</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Admin</p>
            <p className="text-xs text-gray-400">Administrador</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Navbar;
