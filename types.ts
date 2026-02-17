
export enum UserRole {
  ADMIN_GENERAL = 'ADMIN_GENERAL',
  TESORERO = 'TESORERO',
  PRESIDENTE = 'PRESIDENTE',
  COBRADOR = 'COBRADOR'
}

export type SocioCategory = 'general' | 'grupo_familiar';

export interface Socio {
  id: string;
  numero_socio: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  direccion: string;
  categoria: SocioCategory;
  created_at: string;
}

export interface CuotaConfig {
  id: string;
  año: number;
  mes: number;
  categoria: SocioCategory;
  valor: number;
}

export interface PagoSocio {
  id: string;
  socio_id: string;
  año: number;
  mes: number;
  monto: number;
  fecha_pago: string;
  recibo_numero: string;
  anulado: boolean;
  usuario_registro: string;
}

export type PanelStatus = 'disponible' | 'reservado' | 'vendido';
export type PanelType = '1_panel' | '1_5_panel' | '2_paneles' | '3_paneles';

export interface PanelPublicidad {
  id: string;
  numero_panel: number;
  estado: PanelStatus;
  agrupacion_id?: string;
  contrato_id?: string;
}

export interface ContratoPublicidad {
  id: string;
  año: number;
  cliente: string;
  representante_legal?: string;
  dni_representante?: string;
  telefono: string;
  direccion: string;
  panel_id: string;
  tipo_panel: PanelType;
  modalidad_pago: 'contado' | '1' | '2' | '3';
  valor_total: number;
  monto_cuota: number;
  cuotas_pagadas: number;
  agente_cobranza_id?: string;
  created_at: string;
  fecha_inicio: string; // Nuevo campo
  fecha_vencimiento: string; 
}

export interface PublicidadValorConfig {
  id: string;
  año: number;
  tipo_panel: PanelType;
  valor_contado: number;
  valor_1_cuota: number;
  valor_2_cuotas: number;
  valor_3_cuotas: number;
}

export interface MovimientoContable {
  id: string;
  fecha: string;
  tipo: 'ingreso' | 'egreso';
  grupo_egreso?: 'socios' | 'publicidad';
  categoria_id: string;
  descripcion: string;
  monto: number;
  origen: 'manual' | 'socios' | 'publicidad';
  referencia_tipo?: 'pago_socio' | 'contrato_publicidad' | 'none';
  referencia_id?: string;
  anulado: boolean;
  usuario_registro: string;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  role: UserRole;
  active: boolean;
}

export interface AgenteCobranza {
  id: string;
  nombre_apellido: string;
  dni: string;
}

export interface ClubConfig {
  presidente: {
    nombre_apellido: string;
    dni: string;
    estado_civil: string;
    direccion: string;
  };
  agentes_cobranza: AgenteCobranza[];
}

// Nueva interfaz para tareas de sincronización
export interface SyncTask {
  id: string;
  type: 'SOCIO_CREATE' | 'PAGO_REGISTER' | 'EGRESO_ADD' | 'PUBLICIDAD_CONTRACT' | 'PUBLICIDAD_PAY';
  payload: any;
  timestamp: string;
}

export interface AppState {
  user: User | null;
  socios: Socio[];
  pagos: PagoSocio[];
  movimientos: MovimientoContable[];
  cuotasConfig: CuotaConfig[];
  paneles: PanelPublicidad[];
  contratosPublicidad: ContratoPublicidad[];
  publicidadValores: PublicidadValorConfig[];
  clubConfig: ClubConfig;
  isOffline: boolean;
  syncQueue: SyncTask[];
}
