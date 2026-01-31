import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Snackbar from '../components/Snackbar';
import ConfirmDialog from '../components/ConfirmDialog';
import axios from 'axios';

interface Libro {
  id_libro: number;
  titulo: string;
  nombre_genero: string;
  nombre_autor: string;
  nombre_pais: string;
}

interface Autor {
  id_autor: number;
  nombre_autor: string;
}

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

const LibrosManage = () => {
  const [libros, setLibros] = useState<Libro[]>([]);
  const [autores, setAutores] = useState<Autor[]>([]);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [titulo, setTitulo] = useState('');
  const [idAutor, setIdAutor] = useState('');
  const [idGenero, setIdGenero] = useState('');
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
      const [librosRes, autoresRes, generosRes] = await Promise.all([
        axios.get('http://localhost:3000/api/libros?limit=1000'),
        axios.get('http://localhost:3000/api/autores'),
        axios.get('http://localhost:3000/api/generos')
      ]);
      setLibros(librosRes.data.data || []);
      setAutores(autoresRes.data.data || []);
      setGeneros(generosRes.data.data || []);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setTitulo('');
    setIdAutor('');
    setIdGenero('');
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const libroData = {
      titulo,
      id_autor: parseInt(idAutor),
      id_genero: parseInt(idGenero)
    };
    
    if (editingId) {
      // Editar
      showConfirm(
        '✏️ Actualizar Libro',
        `¿Confirmar la actualización de "${titulo}"?`,
        async () => {
          setSubmitting(true);
          try {
            await axios.put(`http://localhost:3000/api/libros/${editingId}`, libroData);
            showSnackbar(`Libro "${titulo}" actualizado exitosamente`, 'success');
            resetForm();
            fetchData();
          } catch (err) {
            console.error('Error al actualizar libro:', err);
            showSnackbar('Error al actualizar el libro', 'error');
          } finally {
            setSubmitting(false);
          }
        },
        'info'
      );
    } else {
      // Crear
      showConfirm(
        '➕ Crear Libro',
        `¿Confirmar la creación del libro "${titulo}"?`,
        async () => {
          setSubmitting(true);
          try {
            await axios.post('http://localhost:3000/api/libros', libroData);
            showSnackbar(`Libro "${titulo}" creado exitosamente`, 'success');
            resetForm();
            fetchData();
          } catch (err) {
            console.error('Error al crear libro:', err);
            showSnackbar('Error al crear el libro', 'error');
          } finally {
            setSubmitting(false);
          }
        },
        'info'
      );
    }
  };

  const handleEdit = (libro: Libro) => {
    setEditingId(libro.id_libro);
    setTitulo(libro.titulo);
    // Buscar los IDs basado en los nombres
    const autor = autores.find(a => a.nombre_autor === libro.nombre_autor);
    const genero = generos.find(g => g.nombre_genero === libro.nombre_genero);
    
    setIdAutor(autor ? autor.id_autor.toString() : '');
    setIdGenero(genero ? genero.id_genero.toString() : '');
    
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDelete = (libro: Libro) => {
    showConfirm(
      '🗑️ Eliminar Libro',
      `¿Estás seguro de eliminar "${libro.titulo}"?\n\nEsta acción no se puede deshacer.`,
      async () => {
        try {
          await axios.delete(`http://localhost:3000/api/libros/${libro.id_libro}`);
          showSnackbar(`Libro "${libro.titulo}" eliminado exitosamente`, 'success');
          fetchData();
        } catch (err) {
          console.error('Error al eliminar libro:', err);
          showSnackbar('Error al eliminar el libro', 'error');
        }
      },
      'danger'
    );
  };

  if (loading) return <Loading message="Cargando libros..." />;
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

      <h1 className="text-3xl font-bold text-gray-800">Gestión de Libros</h1>

      {/* Formulario */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {editingId ? '✏️ Editar Libro' : '➕ Nuevo Libro'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingrese el título del libro"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Autor</label>
              <select
                value={idAutor}
                onChange={(e) => setIdAutor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar autor</option>
                {autores.map(a => (
                  <option key={a.id_autor} value={a.id_autor}>
                    {a.nombre_autor}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Género</label>
              <select
                value={idGenero}
                onChange={(e) => setIdGenero(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Seleccionar género</option>
                {generos.map(g => (
                  <option key={g.id_genero} value={g.id_genero}>
                    {g.nombre_genero}
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
              {submitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Libro'}
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
        <p className="text-5xl font-bold text-purple-600 mb-2">{libros.length}</p>
        <p className="text-gray-600">Total de Libros Registrados</p>
      </div>

      {/* Lista de Libros */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📚 Lista de Libros</h2>
        {libros.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay libros registrados</p>
        ) : (
          <div className="space-y-3">
            {libros.map((libro) => (
              <div
                key={libro.id_libro}
                className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{libro.titulo}</p>
                  <p className="text-sm text-gray-600">
                    ✍️ {libro.nombre_autor}
                  </p>
                  <p className="text-sm text-gray-600">
                    🏷️ {libro.nombre_genero}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(libro)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(libro)}
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

export default LibrosManage;
