import { useState, useEffect } from 'react';
import Card from '../components/Card';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Snackbar from '../components/Snackbar';
import ConfirmDialog from '../components/ConfirmDialog';
import axios from 'axios';

interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  fecha_registro: string;
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

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
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

  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:3000/api/usuarios');
      setUsuarios(response.data.data || []);
    } catch (err) {
      setError('Error al cargar los usuarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const resetForm = () => {
    setNombre('');
    setEmail('');
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const usuarioData = { nombre, email };
    
    if (editingId) {
      // Editar
      showConfirm(
        '✏️ Actualizar Usuario',
        `¿Confirmar la actualización de ${nombre}?`,
        async () => {
          setSubmitting(true);
          try {
            await axios.put(`http://localhost:3000/api/usuarios/${editingId}`, usuarioData);
            showSnackbar(`Usuario "${nombre}" actualizado exitosamente`, 'success');
            resetForm();
            fetchUsuarios();
          } catch (err) {
            console.error('Error al actualizar usuario:', err);
            showSnackbar('Error al actualizar el usuario', 'error');
          } finally {
            setSubmitting(false);
          }
        },
        'info'
      );
    } else {
      // Crear
      showConfirm(
        '➕ Crear Usuario',
        `¿Confirmar la creación del usuario ${nombre}?`,
        async () => {
          setSubmitting(true);
          try {
            await axios.post('http://localhost:3000/api/usuarios', usuarioData);
            showSnackbar(`Usuario "${nombre}" creado exitosamente`, 'success');
            resetForm();
            fetchUsuarios();
          } catch (err) {
            console.error('Error al crear usuario:', err);
            showSnackbar('Error al crear el usuario', 'error');
          } finally {
            setSubmitting(false);
          }
        },
        'info'
      );
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingId(usuario.id_usuario);
    setNombre(usuario.nombre);
    setEmail(usuario.email);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (usuario: Usuario) => {
    showConfirm(
      '🗑️ Eliminar Usuario',
      `¿Estás seguro de eliminar a ${usuario.nombre}?\n\nEsta acción no se puede deshacer.`,
      async () => {
        try {
          await axios.delete(`http://localhost:3000/api/usuarios/${usuario.id_usuario}`);
          showSnackbar(`Usuario "${usuario.nombre}" eliminado exitosamente`, 'success');
          fetchUsuarios();
        } catch (err) {
          console.error('Error al eliminar usuario:', err);
          showSnackbar('Error al eliminar el usuario', 'error');
        }
      },
      'danger'
    );
  };

  if (loading) return <Loading message="Cargando usuarios..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchUsuarios} />;

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

      <h1 className="text-3xl font-bold text-gray-800">Gestión de Usuarios</h1>

      {/* Formulario */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {editingId ? '✏️ Editar Usuario' : '➕ Nuevo Usuario'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingrese el nombre"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingrese el email"
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {submitting ? 'Guardando...' : editingId ? 'Actualizar' : 'Crear Usuario'}
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
        <p className="text-5xl font-bold text-blue-600 mb-2">{usuarios.length}</p>
        <p className="text-gray-600">Total de Usuarios Registrados</p>
      </div>

      {/* Lista de Usuarios */}
      <Card>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">👥 Lista de Usuarios</h2>
        {usuarios.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay usuarios registrados</p>
        ) : (
          <div className="space-y-3">
            {usuarios.map((usuario) => (
              <div
                key={usuario.id_usuario}
                className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-bold text-gray-800">{usuario.nombre}</p>
                  <p className="text-sm text-gray-600">📧 {usuario.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Registrado: {new Date(usuario.fecha_registro).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(usuario)}
                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => handleDelete(usuario)}
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

export default Usuarios;
