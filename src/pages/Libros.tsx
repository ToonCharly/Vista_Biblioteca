import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { librosService } from '../services/api';
import type { LibroPrestamo, Libro, EstadisticasSemestre, GeneroMasSolicitado } from '../types';

const Libros = () => {
  const [masPrestados, setMasPrestados] = useState<LibroPrestamo[]>([]);
  const [menosPrestados, setMenosPrestados] = useState<LibroPrestamo[]>([]);
  const [aleatorios, setAleatorios] = useState<Libro[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasSemestre | null>(null);
  const [generoTop, setGeneroTop] = useState<GeneroMasSolicitado | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [mas, menos, random, stats, genero] = await Promise.all([
        librosService.getMasPrestados(),
        librosService.getMenosPrestados(),
        librosService.getAleatorios(),
        librosService.getEstadisticasSemestre(),
        librosService.getGeneroMasSolicitado(),
      ]);
      setMasPrestados(mas);
      setMenosPrestados(menos);
      setAleatorios(random);
      setEstadisticas(stats);
      setGeneroTop(genero);
    } catch (err) {
      setError('Error al cargar los datos de libros. Verifica que el backend esté ejecutándose.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <Loading message="Cargando información de libros..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Gestión de Libros</h1>

      {/* Estadísticas del Semestre */}
      {estadisticas && estadisticas.libro_mas_prestado && estadisticas.usuario_top && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-2">📖 Libro Más Prestado (6 meses)</p>
            <p className="text-3xl font-bold text-gray-800 mb-2">{estadisticas.libro_mas_prestado.titulo}</p>
            <p className="text-gray-600 mb-4">{estadisticas.libro_mas_prestado.nombre_autor}</p>
            <p className="text-5xl font-bold text-purple-600">{estadisticas.libro_mas_prestado.total_prestamos_semestre}</p>
            <p className="text-gray-500">préstamos</p>
          </div>

          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-2">👤 Usuario que Más lo Prestó</p>
            <p className="text-3xl font-bold text-gray-800 mb-4">{estadisticas.usuario_top.nombre}</p>
            <p className="text-5xl font-bold text-indigo-600">{estadisticas.usuario_top.total_prestamos}</p>
            <p className="text-gray-500">préstamos</p>
          </div>
        </div>
      )}

      {/* Género más popular */}
      {generoTop && (
        <div className="bg-green-500 rounded-lg shadow p-8 text-white text-center">
          <p className="text-lg mb-2">📚 Género Más Solicitado</p>
          <p className="text-4xl font-bold mb-2">{generoTop.nombre_genero}</p>
          <p className="text-xl">{generoTop.total_solicitudes} préstamos</p>
        </div>
      )}

      {/* Libros Destacados */}
      {aleatorios.length > 0 && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🎲 Libros Destacados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {aleatorios.map((libro) => (
              <div key={libro.id_libro} className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="text-4xl mb-3">📕</div>
                <h3 className="font-bold text-gray-800 mb-2">{libro.titulo}</h3>
                <p className="text-sm text-gray-600 mb-1">{libro.nombre_autor || 'Autor desconocido'}</p>
                <p className="text-xs text-gray-500">{libro.nombre_genero || 'Sin género'}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top 10 Más Prestados */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🏆 Top 10 Más Prestados</h2>
        <div className="space-y-3">
          {masPrestados.slice(0, 10).map((libro, index) => (
            <div key={libro.id_libro} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4 flex-1">
                <span className="text-3xl font-bold text-gray-400">#{index + 1}</span>
                <div>
                  <p className="font-bold text-gray-800">{libro.titulo}</p>
                  <p className="text-sm text-gray-600">{libro.nombre_autor} • {libro.nombre_genero}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">{libro.total_prestamos}</p>
                <p className="text-xs text-gray-500">préstamos</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Top 10 Menos Prestados */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📉 Top 10 Menos Prestados</h2>
        <div className="space-y-3">
          {menosPrestados.slice(0, 10).map((libro) => (
            <div key={libro.id_libro} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-bold text-gray-800">{libro.titulo}</p>
                <p className="text-sm text-gray-600">{libro.nombre_autor} • {libro.nombre_genero}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-600">{libro.total_prestamos}</p>
                <p className="text-xs text-gray-500">préstamos</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Libros;
