import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { autoresService } from '../services/api';
import type { PaisAutores, PaisPublicaciones } from '../types';

const Autores = () => {
  const [paisMasAutores, setPaisMasAutores] = useState<PaisAutores | null>(null);
  const [paisesPublicaciones, setPaisesPublicaciones] = useState<PaisPublicaciones | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [autores, publicaciones] = await Promise.all([
        autoresService.getPaisMasAutores(),
        autoresService.getPaisesPublicaciones(),
      ]);
      console.log('Datos de autores:', autores);
      console.log('Datos de publicaciones:', publicaciones);
      setPaisMasAutores(autores);
      setPaisesPublicaciones(publicaciones);
    } catch (err) {
      setError('Error al cargar los datos de autores. Verifica que el backend esté ejecutándose.');
      console.error('Error completo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <Loading message="Cargando información de autores..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;
  
  // Validación completa de datos
  if (
    !paisMasAutores || 
    !paisesPublicaciones || 
    !paisesPublicaciones.paises_con_mas_publicaciones?.length ||
    !paisesPublicaciones.paises_con_menos_publicaciones?.length
  ) {
    return <Loading message="Cargando datos..." />;
  }

  // Tomar el primer país de cada array
  const paisMasPublicaciones = paisesPublicaciones.paises_con_mas_publicaciones[0];
  const paisMenosPublicaciones = paisesPublicaciones.paises_con_menos_publicaciones[0];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Gestión de Autores</h1>

      {/* País con Más Autores */}
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500 mb-2">🌍 País con Más Autores</p>
        <p className="text-3xl font-bold text-gray-800 mb-4">{paisMasAutores.nombre_pais}</p>
        <p className="text-6xl font-bold text-blue-600">{paisMasAutores.total_autores}</p>
        <p className="text-gray-500">autores registrados</p>
      </div>

      {/* Comparativa de Publicaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-4">📚 País con Más Publicaciones</h2>
          <div className="text-center py-4">
            <p className="text-2xl font-bold text-gray-800 mb-2">{paisMasPublicaciones.nombre_pais}</p>
            <p className="text-5xl font-bold text-green-600">{paisMasPublicaciones.total_publicaciones}</p>
            <p className="text-gray-500">libros publicados</p>
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-4">📖 País con Menos Publicaciones</h2>
          <div className="text-center py-4">
            <p className="text-2xl font-bold text-gray-800 mb-2">{paisMenosPublicaciones.nombre_pais}</p>
            <p className="text-5xl font-bold text-orange-600">{paisMenosPublicaciones.total_publicaciones}</p>
            <p className="text-gray-500">libros publicados</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Autores;
