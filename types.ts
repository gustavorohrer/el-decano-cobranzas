
export enum UserRole {
  ADMIN_GENERAL = 'ADMIN_GENERAL',
  TESORERO = 'TESORERO',
  PRESIDENTE = 'PRESIDENTE',
  COBRADOR = 'COBRADOR'
}

export type MemberCategory = 'general' | 'family_group';

export interface Member {
  id: string;
  member_number: string;
  first_name: string;
  last_name: string;
  dni: string;
  phone: string;
  address: string;
  category: MemberCategory;
  created_at: string;
}

export interface MembershipRate {
  id: string;
  year: number;
  month: number;
  category: MemberCategory;
  amount: number;
}

export interface MemberPayment {
  id: string;
  member_id: string;
  year: number;
  month: number;
  amount: number;
  payment_date: string;
  receipt_number: string;
  is_annulled: boolean;
  created_by: string;
}

export type PanelStatus = 'available' | 'reserved' | 'sold';
export type PanelType = '1_panel' | '1_5_panel' | '2_panels' | '3_panels';

export interface AdvertisingPanel {
  id: string;
  panel_number: number;
  status: PanelStatus;
  group_id?: string;
  contract_id?: string;
}

export interface AdvertisingContract {
  id: string;
  year: number;
  client_name: string;
  legal_representative?: string;
  representative_dni?: string;
  phone: string;
  address: string;
  panel_id: string;
  panel_type: PanelType;
  payment_method: 'cash' | '1' | '2' | '3';
  total_amount: number;
  installment_amount: number;
  installments_paid: number;
  collector_id?: string;
  created_at: string;
  start_date: string; // Nuevo campo
  expiry_date: string;
}

export interface AdvertisingRate {
  id: string;
  year: number;
  panel_type: PanelType;
  cash_price: number;
  one_installment_price: number;
  two_installments_price: number;
  three_installments_price: number;
}

export interface AccountingMovement {
  id: string;
  date: string;
  type: 'income' | 'expense';
  expense_group?: 'members' | 'advertising';
  category_id: string;
  description: string;
  amount: number;
  origin: 'manual' | 'members' | 'advertising';
  reference_type?: 'member_payment' | 'advertising_contract' | 'none';
  reference_id?: string;
  is_annulled: boolean;
  created_by: string;
}

export interface User {
  id: string;
  email: string;
  password?: string;
  role: UserRole;
  active: boolean;
}

export interface Collector {
  id: string;
  full_name: string;
  dni: string;
}

export interface ClubConfig {
  president: {
    full_name: string;
    dni: string;
    civil_status: string;
    address: string;
  };
  collectors: Collector[];
}

// Nueva interfaz para tareas de sincronización
export interface SyncTask {
  id: string;
  type: 'MEMBER_CREATE' | 'PAYMENT_REGISTER' | 'EXPENSE_ADD' | 'ADVERTISING_CONTRACT' | 'ADVERTISING_PAY';
  payload: any;
  timestamp: string;
}

export interface AppState {
  user: User | null;
  members: Member[];
  payments: MemberPayment[];
  movements: AccountingMovement[];
  membershipRates: MembershipRate[];
  panels: AdvertisingPanel[];
  advertisingContracts: AdvertisingContract[];
  advertisingRates: AdvertisingRate[];
  clubConfig: ClubConfig;
  isOffline: boolean;
  syncQueue: SyncTask[];
}
