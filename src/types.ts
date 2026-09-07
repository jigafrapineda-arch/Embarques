export interface Localidad {
  id: string;
  nombre: string;
}

export interface Operador {
  id: string;
  clave: string;
  nombre: string;
  telefono: string;
  licencia?: string;
  contactoEmergencia?: string;
  tipoSangre?: string;
  fechaIngreso?: string;
  localidad: string;
  foto?: string;
}

export interface Camioneta {
  id: string;
  clave: string;
  placa: string;
  claveToka?: string;
  modelo: string;
  localidad: string;
}

export interface Ruta {
  id?: string;
  codigo: string;
  nombre: string;
  localidad: string;
}

export interface UsuarioVigilancia {
  id: string;
  nombre: string;
  email: string;
  password?: string;
  rol: 'Admin' | 'Operador' | 'Vigilante' | 'Supervisor';
  localidadPrincipal: string;
  localidadesPermitidas: string[];
  estado: 'Activo' | 'Inactivo';
  permisos: {
    bloque1Salida: boolean;
    bloque2Embarque: boolean;
    bloque3Arribo: boolean;
    bloque4Cierre: boolean;
    soloVisualizar: boolean;
    editarHistorial: boolean;
    gestionarOperadores: boolean;
    gestionarCamionetas: boolean;
    gestionarRutas: boolean;
    gestionarVigilancia: boolean;
    gestionarLocalidades: boolean;
    gestionarConfiguracion: boolean;
  };
}

export interface BitacoraRegistro {
  id: string;
  // Bloque 1: Salida
  fecha: string; // YYYY-MM-DD
  claveOperador: string;
  unidad: string;
  nombreOperador: string;
  placas: string;
  modelo?: string;
  ultimaGasolina: string;
  kmSalida: number | string;
  gasolinaSalida: string;
  claveRuta: string;
  nombreRuta: string;
  inicioEmbarque: string;
  horaEntrada?: string;
  bloque1Completado: boolean;

  // Bloque 2: Embarque
  pedidos?: string;
  horaSalida?: string;
  bloque2Completado: boolean;

  // Bloque 3: Arribo
  kmArribo?: number | string;
  gasolinaArribo?: string;
  horaArribo?: string;
  bloque3Completado: boolean;

  // Bloque 4: Cierre / Incidencias
  observaciones?: string;
  incidencia?: boolean;
  detalleIncidencia?: string;
  bloque4Completado: boolean;
  estado: 'Salida' | 'En Ruta' | 'Arribado' | 'Cerrado';
}

export interface ModuloVisibilidad {
  bitacora: boolean;
  embarques: boolean;
  historial: boolean;
  dashboard: boolean;
  vigilancia: boolean;
  operadores: boolean;
  localidades: boolean;
  camionetas: boolean;
  rutas: boolean;
}

export interface AppConfig {
  empresaNombre: string;
  logoUrl: string;
  modulos: ModuloVisibilidad;
}

export type ViewType =
  | 'bitacora'
  | 'embarques'
  | 'historial'
  | 'dashboard'
  | 'vigilancia'
  | 'operadores'
  | 'localidades'
  | 'camionetas'
  | 'rutas'
  | 'configuracion';
