import { ReactNode } from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Navbar />
      
      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Sistema de Biblioteca</h2>
              <p className="text-sm text-gray-500">Gestión y control de préstamos</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-6 mt-auto">
          <div className="px-8 text-center">
            <p className="text-sm text-gray-500">© 2026 Sistema de Biblioteca - Todos los derechos reservados</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
