import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Snackbar from '../components/Snackbar';
import ConfirmDialog from '../components/ConfirmDialog';
import axios from 'axios';

interface PrestamoActivo {
  id_prestamo: number;
  id_usuario: number;
  nombre_usuario: string;
  email_usuario: string;
  id_libro: number;
  titulo_libro: string;
  fecha_prestamo: string;
  fecha_devolucion: string | null;
  dias_prestado: number;
}

interface ProximoVencer {
  id_prestamo: number;
  id_usuario: number;
  nombre_usuario: string;
  email_usuario: string;
  id_libro: number;
  titulo_libro: string;
  fecha_prestamo: string;
  dias_restantes: number;
}

interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
}

interface Libro {
  id_libro: number;
  titulo: string;
}

interface SnackbarState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ConfirmState {
  show: boolean;
  title: string;
  message: string;
  type: 'warning' | 'danger' | 'info';
  onConfirm: () => void;
}

const Prestamos = () => {
  const [prestamosActivos, setPrestamosActivos] = useState<PrestamoActivo[]>([]);
  const [proximosVencer, setProximosVencer] = useState<ProximoVencer[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [libros, setLibros] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [selectedUsuario, setSelectedUsuario] = useState('');
  const [selectedLibro, setSelectedLibro] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    show: false,
    message: '',
    type: 'success'
  });

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<ConfirmState>({
    show: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {}
  });

  const showSnackbar = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setSnackbar({ show: true, message, type });
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, show: false }));
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: 'warning' | 'danger' | 'info' = 'info'
  ) => {
    setConfirmDialog({ show: true, title, message, type, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmDialog({ ...confirmDialog, show: false });
  };

  const handleConfirm = () => {
    confirmDialog.onConfirm();
    closeConfirm();
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [activos, proximos, usuariosData, librosData] = await Promise.all([
        axios.get('http://localhost:3000/api/prestamos/activos'),
        axios.get('http://localhost:3000/api/notificaciones/proximos-vencer'),
        axios.get('http://localhost:3000/api/usuarios'),
        axios.get('http://localhost:3000/api/libros?limit=100')
      ]);
      
      setPrestamosActivos(activos.data.data || []);
      setProximosVencer(proximos.data.data || []);
      setUsuarios(usuariosData.data.data || []);
      setLibros(librosData.data.data || []);
    } catch (err) {
      setError('Error al cargar los datos de préstamos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCrearPrestamo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUsuario || !selectedLibro) return;

    // Obtener nombres para la confirmación
    const usuario = usuarios.find(u => u.id_usuario === parseInt(selectedUsuario));
    const libro = libros.find(l => l.id_libro === parseInt(selectedLibro));

    showConfirm(
      '📝 Registrar Préstamo',
      `¿Estás seguro de registrar este préstamo?\n\nUsuario: ${usuario?.nombre}\nLibro: ${libro?.titulo}`,
      async () => {
        setSubmitting(true);
        try {
          await axios.post('http://localhost:3000/api/prestamos', {
            id_usuario: parseInt(selectedUsuario),
            id_libro: parseInt(selectedLibro)
          });
          
          showSnackbar(`Préstamo registrado exitosamente para ${usuario?.nombre}`, 'success');
          setSelectedUsuario('');
          setSelectedLibro('');
          fetchData();
        } catch (err) {
          console.error('Error al crear préstamo:', err);
          showSnackbar('Error al crear el préstamo', 'error');
        } finally {
          setSubmitting(false);
        }
      },
      'info'
    );
  };

  const handleDevolver = async (id_prestamo: number, titulo: string, usuario: string) => {
    showConfirm(
      '📚 Devolver Libro',
      `¿Confirmar la devolución?\n\nLibro: ${titulo}\nUsuario: ${usuario}`,
      async () => {
        try {
          await axios.put(`http://localhost:3000/api/prestamos/${id_prestamo}/devolver`);
          showSnackbar(`Libro "${titulo}" devuelto exitosamente`, 'success');
          fetchData();
        } catch (err) {
          console.error('Error al devolver libro:', err);
          showSnackbar('Error al procesar la devolución', 'error');
        }
      },
      'warning'
    );
  };

  if (loading) return <Loading message="Cargando préstamos..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      {snackbar.show && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={closeSnackbar}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.show}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />

      <h1 className="text-3xl font-bold text-gray-800">Gestión de Préstamos</h1>

      {/* Notificaciones - Próximos a vencer */}
      {proximosVencer.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <h3 className="text-yellow-800 font-bold">Préstamos Próximos a Vencer</h3>
              <p className="text-yellow-700 text-sm">{proximosVencer.length} préstamo(s) vence(n) en menos de 3 días</p>
            </div>
          </div>
        </div>
      )}

      {/* Formulario Crear Préstamo */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📝 Registrar Nuevo Préstamo</h2>
        <form onSubmit={handleCrearPrestamo} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
            <select
              value={selectedUsuario}
              onChange={(e) => setSelectedUsuario(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Seleccionar usuario</option>
              {usuarios.map(u => (
                <option key={u.id_usuario} value={u.id_usuario}>
                  {u.nombre} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Libro</label>
            <select
              value={selectedLibro}
              onChange={(e) => setSelectedLibro(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Seleccionar libro</option>
              {libros.map(l => (
                <option key={l.id_libro} value={l.id_libro}>
                  {l.titulo}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {submitting ? 'Registrando...' : 'Registrar Préstamo'}
            </button>
          </div>
        </form>
      </Card>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-5xl font-bold text-blue-600 mb-2">{prestamosActivos.length}</p>
          <p className="text-gray-600">Préstamos Activos</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-5xl font-bold text-yellow-600 mb-2">{proximosVencer.length}</p>
          <p className="text-gray-600">Por Vencer (3 días)</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-5xl font-bold text-green-600 mb-2">{usuarios.length}</p>
          <p className="text-gray-600">Usuarios Registrados</p>
        </div>
      </div>

      {/* Lista de Préstamos Activos */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📚 Préstamos Activos</h2>
        {prestamosActivos.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay préstamos activos</p>
        ) : (
          <div className="space-y-3">
            {prestamosActivos.map((prestamo) => (
              <div
                key={prestamo.id_prestamo}
                className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                  prestamo.dias_prestado > 35 ? 'bg-red-50 border-red-300' : 
                  prestamo.dias_prestado > 21 ? 'bg-yellow-50 border-yellow-300' : 
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{prestamo.titulo_libro}</p>
                  <p className="text-sm text-gray-600">
                    Usuario: {prestamo.nombre_usuario} • {prestamo.email_usuario}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Prestado: {new Date(prestamo.fecha_prestamo).toLocaleDateString('es-ES')} 
                    ({prestamo.dias_prestado} días)
                  </p>
                </div>
                <button
                  onClick={() => handleDevolver(prestamo.id_prestamo, prestamo.titulo_libro, prestamo.nombre_usuario)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Devolver
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Próximos a Vencer - Detalle */}
      {proximosVencer.length > 0 && (
        <Card>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">⏰ Próximos a Vencer</h2>
          <div className="space-y-3">
            {proximosVencer.map((prestamo) => (
              <div
                key={prestamo.id_prestamo}
                className="flex items-center justify-between p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg"
              >
                <div>
                  <p className="font-bold text-gray-800">{prestamo.titulo_libro}</p>
                  <p className="text-sm text-gray-600">{prestamo.nombre_usuario}</p>
                  <p className="text-xs text-yellow-700 font-semibold mt-1">
                    ⚠️ Vence en {prestamo.dias_restantes} día(s)
                  </p>
                </div>
                <button
                  onClick={() => handleDevolver(prestamo.id_prestamo, prestamo.titulo_libro, prestamo.nombre_usuario)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Devolver
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default Prestamos;
