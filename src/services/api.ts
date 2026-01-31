import axios from 'axios';
import type {
  ApiResponse,
  UsuarioMoroso,
  LibroPrestamo,
  Libro,
  EstadisticasSemestre,
  GeneroMasSolicitado,
  PaisAutores,
  PaisPublicaciones,
} from '../types';

const API_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Accept': 'application/json',
  },
  responseType: 'json',
});

// Interceptor para asegurar la correcta decodificación UTF-8
api.interceptors.response.use(
  (response) => {
    // Si la respuesta tiene datos, asegurarse de que estén correctamente decodificados
    if (response.data && typeof response.data === 'object') {
      response.data = JSON.parse(JSON.stringify(response.data));
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Servicios de Usuarios
export const usuariosService = {
  getMorosos5a10Semanas: async (): Promise<UsuarioMoroso[]> => {
    const response = await api.get<ApiResponse<UsuarioMoroso[]>>('/usuarios/morosos/5-10-semanas');
    return response.data.data || [];
  },

  getMorososMas10Semanas: async (): Promise<UsuarioMoroso[]> => {
    const response = await api.get<ApiResponse<UsuarioMoroso[]>>('/usuarios/morosos/mas-10-semanas');
    return response.data.data || [];
  },
};

// Servicios de Libros
export const librosService = {
  getMasPrestados: async (): Promise<LibroPrestamo[]> => {
    const response = await api.get<ApiResponse<LibroPrestamo[]>>('/libros/mas-prestados');
    return response.data.data || [];
  },

  getMenosPrestados: async (): Promise<LibroPrestamo[]> => {
    const response = await api.get<ApiResponse<LibroPrestamo[]>>('/libros/menos-prestados');
    return response.data.data || [];
  },

  getEstadisticasSemestre: async (): Promise<EstadisticasSemestre> => {
    const response = await api.get<ApiResponse<EstadisticasSemestre>>('/libros/estadisticas-semestre');
    return response.data.data!;
  },

  getGeneroMasSolicitado: async (): Promise<GeneroMasSolicitado> => {
    const response = await api.get<ApiResponse<GeneroMasSolicitado>>('/libros/genero-mas-solicitado');
    return response.data.data!;
  },

  getAleatorios: async (): Promise<Libro[]> => {
    const response = await api.get<ApiResponse<Libro[]>>('/libros/aleatorios');
    return response.data.data || [];
  },
};

// Servicios de Autores
export const autoresService = {
  getPaisMasAutores: async (): Promise<PaisAutores> => {
    const response = await api.get<ApiResponse<PaisAutores>>('/autores/pais-mas-autores');
    return response.data.data!;
  },

  getPaisesPublicaciones: async (): Promise<PaisPublicaciones> => {
    const response = await api.get<ApiResponse<PaisPublicaciones>>('/autores/paises-publicaciones');
    return response.data.data!;
  },
};
