// Import-related types
export interface SystemDiscipline {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  active?: boolean;
}

export interface ClassItem {
  id: string;
  filaOriginal?: number;
  pais: string;
  ciudad: string;
  instructor: string;
  disciplina: string;
  estudio: string;
  salon: string;
  dia: string;
  hora: string;
  semana: number;
  reservasTotales: number;
  listasEspera: number;
  cortesias: number;
  lugares: number;
  reservasPagadas: number;
  textoEspecial: string;
  esInstructorVS: boolean;
  instructoresVS?: string[];
  mapeoDisciplina?: string;
  mapeoSemana?: number;
  instructorExiste: boolean;
  instructorNuevo: boolean;
  eliminada: boolean;
  errores?: string[];
}

export interface TablaClasesResult {
  clases: ClassItem[];
  totalClases: number;
  clasesValidas: number;
  clasesEliminadas: number;
  clasesConErrores: number;
}

export interface ConfiguracionImportacion {
  periodoId: string;
  clases: ClassItem[];
}

export interface ErrorImportacion {
  fila: number;
  mensaje: string;
}

export interface ResultadoImportacion {
  totalRegistros: number;
  registrosImportados: number;
  registrosConError: number;
  instructoresCreados: number;
  errores?: ErrorImportacion[];
}
