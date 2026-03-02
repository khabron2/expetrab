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
  estado: 'Ingresado' | 'En proceso' | 'Resuelto' | 'Archivado' | 'Paso a Jurídico' | 'Paso a Despacho';
  fecha_ingreso: string;
  fecha_resolucion?: string;
  fecha_cambio_estado?: string;
  tramite?: string;
  prueba_documental_1?: string;
  prueba_documental_2?: string;
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
  ultimoIngresado?: {
    numero_expediente: string;
    denunciante_nombre: string;
    fecha_ingreso: string;
  };
  ultimoModificado?: {
    numero_expediente: string;
    estado: string;
    fecha_cambio_estado: string;
  };
  monthly: { month: string; count: number }[];
  distribution: { estado: string; value: number }[];
  hourly: { hour: string; count: number }[];
}
