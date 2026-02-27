export interface Expediente {
  id: number;
  numero_expediente: string;
  denunciante_nombre: string;
  denunciante_dni: string;
  denunciante_email: string;
  denunciante_telefono: string;
  denunciante_calle?: string;
  denunciante_numeracion?: string;
  denunciante_barrio?: string;
  denunciante_entre_calle_1?: string;
  denunciante_entre_calle_2?: string;
  denunciante_lote?: string;
  empresa_denunciada: string;
  empresa_denunciada_2?: string;
  empresa_denunciada_3?: string;
  empresa_denunciada_4?: string;
  motivo_reclamo: string;
  peticiones?: string;
  estado: 'Ingresado' | 'En proceso' | 'Resuelto' | 'Archivado';
  fecha_ingreso: string;
  fecha_resolucion?: string;
  observaciones?: string;
}

export interface Movimiento {
  id: number;
  expediente_id: number;
  fecha: string;
  accion: string;
  usuario: string;
  observacion: string;
}

export interface Audiencia {
  id: number;
  expediente_id: number;
  fecha_hora: string;
  tipo: string;
  estado: string;
}

export interface DashboardStats {
  total: number;
  activos: number;
  resueltos: number;
  archivados: number;
  avgResolutionTime: number;
  monthly: { month: string; count: number }[];
  distribution: { estado: string; value: number }[];
}
