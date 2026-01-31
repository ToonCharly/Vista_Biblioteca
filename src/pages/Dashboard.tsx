import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import axios from 'axios';

interface DashboardStats {
  totalUsuarios: number;
  totalLibros: number;
  prestamosActivos: number;
  totalAutores: number;
  totalGeneros: number;
  usuariosMorosos: number;
  proximosVencer: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsuarios: 0,
    totalLibros: 0,
    prestamosActivos: 0,
    totalAutores: 0,
    totalGeneros: 0,
    usuariosMorosos: 0,
    proximosVencer: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Usar el endpoint de estadísticas del dashboard + datos adicionales
      const [dashboardRes, autoresRes, generosRes, proximosRes] = await Promise.all([
        axios.get('http://localhost:3000/api/estadisticas/dashboard'),
        axios.get('http://localhost:3000/api/autores'),
        axios.get('http://localhost:3000/api/generos'),
        axios.get('http://localhost:3000/api/notificaciones/proximos-vencer').catch(() => ({ data: { count: 0 } }))
      ]);

      const dashData = dashboardRes.data.data;
      
      setStats({
        totalUsuarios: dashData.total_usuarios || 0,
        totalLibros: dashData.total_libros || 0,
        prestamosActivos: dashData.prestamos_activos || 0,
        totalAutores: autoresRes.data.count || 0,
        totalGeneros: generosRes.data.count || 0,
        usuariosMorosos: dashData.usuarios_morosos || 0,
        proximosVencer: proximosRes.data.count || 0
      });
    } catch (err) {
      setError('Error al cargar las estadísticas del dashboard');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <Loading message="Cargando estadísticas..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchDashboardData} />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">📊 Dashboard Principal</h1>
      
      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-4xl font-bold text-blue-600 mb-2">{stats.totalLibros}</p>
            <p className="text-gray-600">📚 Total Libros</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <p className="text-4xl font-bold text-green-600 mb-2">{stats.totalUsuarios}</p>
            <p className="text-gray-600">👥 Total Usuarios</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <p className="text-4xl font-bold text-purple-600 mb-2">{stats.totalAutores}</p>
            <p className="text-gray-600">✍️ Total Autores</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <p className="text-4xl font-bold text-pink-600 mb-2">{stats.totalGeneros}</p>
            <p className="text-gray-600">🏷️ Total Géneros</p>
          </div>
        </Card>
      </div>

      {/* Estadísticas de Préstamos */}
      <h2 className="text-2xl font-bold text-gray-800 mt-8">📖 Estado de Préstamos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-5xl font-bold text-blue-600 mb-2">{stats.prestamosActivos}</p>
            <p className="text-gray-600">Préstamos Activos</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <p className="text-5xl font-bold text-yellow-600 mb-2">{stats.proximosVencer}</p>
            <p className="text-gray-600">Próximos a Vencer</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <p className="text-5xl font-bold text-red-600 mb-2">{stats.usuariosMorosos}</p>
            <p className="text-gray-600">Usuarios Morosos</p>
          </div>
        </Card>
      </div>

      {/* Accesos Rápidos */}
      <h2 className="text-2xl font-bold text-gray-800 mt-8">🚀 Accesos Rápidos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <a href="/usuarios" className="block">
          <Card className="hover:bg-blue-50 transition-colors cursor-pointer">
            <div className="text-center p-4">
              <p className="text-3xl mb-2">👥</p>
              <p className="font-bold text-gray-800">Gestionar Usuarios</p>
              <p className="text-sm text-gray-500">Crear, editar usuarios</p>
            </div>
          </Card>
        </a>
        
        <a href="/libros-manage" className="block">
          <Card className="hover:bg-green-50 transition-colors cursor-pointer">
            <div className="text-center p-4">
              <p className="text-3xl mb-2">📚</p>
              <p className="font-bold text-gray-800">Gestionar Libros</p>
              <p className="text-sm text-gray-500">Crear, editar libros</p>
            </div>
          </Card>
        </a>
        
        <a href="/prestamos" className="block">
          <Card className="hover:bg-yellow-50 transition-colors cursor-pointer">
            <div className="text-center p-4">
              <p className="text-3xl mb-2">📖</p>
              <p className="font-bold text-gray-800">Gestionar Préstamos</p>
              <p className="text-sm text-gray-500">Registrar, devolver</p>
            </div>
          </Card>
        </a>
        
        <a href="/libros" className="block">
          <Card className="hover:bg-purple-50 transition-colors cursor-pointer">
            <div className="text-center p-4">
              <p className="text-3xl mb-2">📊</p>
              <p className="font-bold text-gray-800">Ver Estadísticas</p>
              <p className="text-sm text-gray-500">Reportes detallados</p>
            </div>
          </Card>
        </a>
      </div>
    </div>
  );
};

export default Dashboard;
