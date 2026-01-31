import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Snackbar from '../components/Snackbar';
import ConfirmDialog from '../components/ConfirmDialog';
import axios from 'axios';

interface Genero {
  id_genero: number;
  nombre_genero: string;
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

const GenerosManage = () => {
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [nombreGenero, setNombreGenero] = useState('');
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

  const fetchGeneros = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:3000/api/generos');
      setGeneros(response.data.data || []);
    } catch (err) {
      setError('Error al cargar los géneros');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeneros();
  }, []);

  const resetForm = () => {
    setNombreGenero('');
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const generoData = {
      nombre_genero: nombreGenero
    };
    
    if (editingId) {
      // Editar
      showConfirm(
        '✏️ Actualizar Género',
        `¿Confirmar la actualización de "${nombreGenero}"?`,
        async () => {
          setSubmitting(true);
          try {
            await axios.put(`http://localhost:3000/api/generos/${editingId}`, generoData);
            showSnackbar(`Género "${nombreGenero}" actualizado exitosamente`, 'success');
            resetForm();
            fetchGeneros();
          } catch (err) {
            console.error('Error al actualizar género:', err);
            showSnackbar('Error al actualizar el género', 'error');
          } finally {
            setSubmitting(false);
          }
        },
        'info'
      );
    } else {
      // Crear
      showConfirm(
        '➕ Crear Género',
        `¿Confirmar la creación del género "${nombreGenero}"?`,
        async () => {
          setSubmitting(true);
          try {
            await axios.post('http://localhost:3000/api/generos', generoData);
            showSnackbar(`Género "${nombreGenero}" creado exitosamente`, 'success');
            resetForm();
            fetchGeneros();
          } catch (err) {
            console.error('Error al crear género:', err);
            showSnackbar('Error al crear el género', 'error');
          } finally {
            setSubmitting(false);
          }
        },
        'info'
      );
    }
  };

  const handleEdit = (genero: Genero) => {
    setEditingId(genero.id_genero);
    setNombreGenero(genero.nombre_genero);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (genero: Genero) => {
    showConfirm(
      '🗑️ Eliminar Género',
      `¿Estás seguro de eliminar el género "${genero.nombre_genero}"?\n\nEsta acción no se puede deshacer.`,
      async () => {
        try {
          await axios.delete(`http://localhost:3000/api/generos/${genero.id_genero}`);
          showSnackbar(`Género "${genero.nombre_genero}" eliminado exitosamente`, 'success');
          fetchGeneros();
        } catch (err) {
          console.error('Error al eliminar género:', err);
          showSnackbar('Error al eliminar el género', 'error');
        }
      },
      'danger'
    );
  };

  if (loading) return <Loading message="Cargando géneros..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchGeneros} />;

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

      <h1 className="text-3xl font-bold text-gray-800">Gestión de Géneros</h1>

      {/* Formulario */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {editingId ? '✏️ Editar Género' : '➕ Nuevo Género'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Género</label>
            <input
              type="text"
              value={nombreGenero}
              onChange={(e) => setNombreGenero(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ingrese el nombre del género"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {submitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Género'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </Card>

      {/* Estadísticas */}
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-5xl font-bold text-pink-600 mb-2">{generos.length}</p>
        <p className="text-gray-600">Total de Géneros Registrados</p>
      </div>

      {/* Lista de Géneros */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🏷️ Lista de Géneros</h2>
        {generos.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay géneros registrados</p>
        ) : (
          <div className="space-y-3">
            {generos.map((genero) => (
              <div
                key={genero.id_genero}
                className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-lg">{genero.nombre_genero}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(genero)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(genero)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default GenerosManage;