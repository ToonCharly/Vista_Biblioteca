import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Snackbar from '../components/Snackbar';
import ConfirmDialog from '../components/ConfirmDialog';
import axios from 'axios';

interface Autor {
  id_autor: number;
  nombre_autor: string;
  id_pais: number;
  nombre_pais: string;
}

interface Pais {
  id_pais: number;
  nombre_pais: string;
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

const AutoresManage = () => {
  const [autores, setAutores] = useState<Autor[]>([]);
  const [paises] = useState<Pais[]>([
    { id_pais: 1, nombre_pais: 'México' },
    { id_pais: 2, nombre_pais: 'España' },
    { id_pais: 3, nombre_pais: 'Argentina' },
    { id_pais: 4, nombre_pais: 'Estados Unidos' },
    { id_pais: 5, nombre_pais: 'Colombia' }
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [nombreAutor, setNombreAutor] = useState('');
  const [idPais, setIdPais] = useState('');
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

  const fetchAutores = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:3000/api/autores');
      setAutores(response.data.data || []);
    } catch (err) {
      setError('Error al cargar los autores');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutores();
  }, []);

  const resetForm = () => {
    setNombreAutor('');
    setIdPais('');
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const autorData = {
      nombre_autor: nombreAutor,
      id_pais: parseInt(idPais)
    };
    
    if (editingId) {
      // Editar
      showConfirm(
        '✏️ Actualizar Autor',
        `¿Confirmar la actualización de "${nombreAutor}"?`,
        async () => {
          setSubmitting(true);
          try {
            await axios.put(`http://localhost:3000/api/autores/${editingId}`, autorData);
            showSnackbar(`Autor "${nombreAutor}" actualizado exitosamente`, 'success');
            resetForm();
            fetchAutores();
          } catch (err) {
            console.error('Error al actualizar autor:', err);
            showSnackbar('Error al actualizar el autor', 'error');
          } finally {
            setSubmitting(false);
          }
        },
        'info'
      );
    } else {
      // Crear
      showConfirm(
        '➕ Crear Autor',
        `¿Confirmar la creación del autor "${nombreAutor}"?`,
        async () => {
          setSubmitting(true);
          try {
            await axios.post('http://localhost:3000/api/autores', autorData);
            showSnackbar(`Autor "${nombreAutor}" creado exitosamente`, 'success');
            resetForm();
            fetchAutores();
          } catch (err) {
            console.error('Error al crear autor:', err);
            showSnackbar('Error al crear el autor', 'error');
          } finally {
            setSubmitting(false);
          }
        },
        'info'
      );
    }
  };

  const handleEdit = (autor: Autor) => {
    setEditingId(autor.id_autor);
    setNombreAutor(autor.nombre_autor);
    setIdPais(autor.id_pais.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (autor: Autor) => {
    showConfirm(
      '🗑️ Eliminar Autor',
      `¿Estás seguro de eliminar a "${autor.nombre_autor}"?\n\nEsta acción no se puede deshacer.`,
      async () => {
        try {
          await axios.delete(`http://localhost:3000/api/autores/${autor.id_autor}`);
          showSnackbar(`Autor "${autor.nombre_autor}" eliminado exitosamente`, 'success');
          fetchAutores();
        } catch (err) {
          console.error('Error al eliminar autor:', err);
          showSnackbar('Error al eliminar el autor', 'error');
        }
      },
      'danger'
    );
  };

  if (loading) return <Loading message="Cargando autores..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchAutores} />;

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

      <h1 className="text-3xl font-bold text-gray-800">Gestión de Autores</h1>

      {/* Formulario */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {editingId ? '✏️ Editar Autor' : '➕ Nuevo Autor'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Autor</label>
              <input
                type="text"
                value={nombreAutor}
                onChange={(e) => setNombreAutor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingrese el nombre del autor"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
              <select
                value={idPais}
                onChange={(e) => setIdPais(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar país</option>
                {paises.map(p => (
                  <option key={p.id_pais} value={p.id_pais}>
                    {p.nombre_pais}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {submitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Autor'}
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
        <p className="text-5xl font-bold text-green-600 mb-2">{autores.length}</p>
        <p className="text-gray-600">Total de Autores Registrados</p>
      </div>

      {/* Lista de Autores */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">✍️ Lista de Autores</h2>
        {autores.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay autores registrados</p>
        ) : (
          <div className="space-y-3">
            {autores.map((autor) => (
              <div
                key={autor.id_autor}
                className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{autor.nombre_autor}</p>
                  <p className="text-sm text-gray-600">🌍 {autor.nombre_pais}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(autor)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(autor)}
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

export default AutoresManage;