
import { UserRole, SocioCategory, PanelStatus } from './types';

export const ROLES_CONFIG = {
  [UserRole.ADMIN_GENERAL]: { label: 'Admin General', canEditConfig: true, canEditAccounting: true },
  [UserRole.TESORERO]: { label: 'Tesorero', canEditConfig: false, canEditAccounting: true },
  [UserRole.PRESIDENTE]: { label: 'Presidente', canEditConfig: false, canEditAccounting: false },
  [UserRole.COBRADOR]: { label: 'Cobrador', canEditConfig: false, canEditAccounting: false },
};

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const CATEGORIES: SocioCategory[] = ['general', 'grupo_familiar'];

export const INITIAL_PANELES = Array.from({ length: 72 }, (_, i) => ({
  id: `p-${i + 1}`,
  numero_panel: i + 1,
  estado: 'disponible' as PanelStatus,
}));
