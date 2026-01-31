// Tipos de Usuario
export interface Usuario {
  id_usuario: number;
  nombre: string;
  email: string;
  telefono: string;
}

export interface UsuarioMoroso extends Usuario {
  semanas_retraso: number;
  id_libro: number;
  titulo: string;
  fecha_prestamo: string;
}

// Tipos de Libro
export interface Libro {
  id_libro: number;
  titulo: string;
  nombre_autor: string;
  nombre_genero: string;
  anio_publicacion: number;
  cantidad_disponible: number;
}

export interface LibroPrestamo extends Libro {
  total_prestamos: number;
}

// Estadísticas de Libros
export interface EstadisticasSemestre {
  libro_mas_prestado: {
    id_libro: number;
    titulo: string;
    nombre_autor: string;
    total_prestamos_semestre: number;
  };
  usuario_top: {
    id_usuario: number;
    nombre: string;
    total_prestamos: number;
  };
}

export interface GeneroMasSolicitado {
  id_genero: number;
  nombre_genero: string;
  total_solicitudes: number;
}

// Tipos de Autor y País
export interface PaisAutores {
  id_pais: number;
  nombre_pais: string;
  total_autores: number;
}

export interface PaisConPublicaciones {
  id_pais: number;
  nombre_pais: string;
  total_libros: number;
  total_publicaciones: number;
}

export interface PaisPublicaciones {
  paises_con_mas_publicaciones: PaisConPublicaciones[];
  paises_con_menos_publicaciones: PaisConPublicaciones[];
}

// Respuesta API genérica
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
