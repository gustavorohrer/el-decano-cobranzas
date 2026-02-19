
import { Member, MemberPayment, AccountingMovement, MembershipRate, AdvertisingPanel, User, UserRole, AdvertisingRate, AdvertisingContract, PanelType, PanelStatus, ClubConfig, SyncTask, Collector } from '../types';

const STORAGE_KEY = 'club_barrio_data';
const SESSION_KEY = 'club_barrio_session';

interface StorageData {
  users: User[];
  members: Member[];
  payments: MemberPayment[];
  movements: AccountingMovement[];
  membershipRates: MembershipRate[];
  panels: AdvertisingPanel[];
  advertisingContracts: AdvertisingContract[];
  advertisingRates: AdvertisingRate[];
  clubConfig: ClubConfig;
  receiptCounter: { [year: number]: number };
  syncQueue: SyncTask[];
}

const INITIAL_DATA: StorageData = {
  users: [
    { id: 'admin-1', email: 'admin@club.com', password: 'admin', role: UserRole.ADMIN_GENERAL, active: true },
    { id: 'admin-tony', email: 'Agalli33@hotmail.com', password: 'Tony1433', role: UserRole.ADMIN_GENERAL, active: true }
  ],
  members: [],
  payments: [],
  movements: [],
  membershipRates: Array.from({ length: 12 }, (_, i) => ([
    { id: `c-gen-${2024}-${i+1}`, year: 2024, month: i + 1, category: 'general' as const, amount: 2500 },
    { id: `c-fam-${2024}-${i+1}`, year: 2024, month: i + 1, category: 'family_group' as const, amount: 4500 },
  ])).flat(),
  advertisingRates: [
    { id: 'v1-2024', year: 2024, panel_type: '1_panel', cash_price: 150000, one_installment_price: 160000, two_installments_price: 85000, three_installments_price: 60000 },
    { id: 'v2-2024', year: 2024, panel_type: '1_5_panel', cash_price: 220000, one_installment_price: 235000, two_installments_price: 125000, three_installments_price: 90000 },
    { id: 'v3-2024', year: 2024, panel_type: '2_panels', cash_price: 280000, one_installment_price: 300000, two_installments_price: 160000, three_installments_price: 115000 },
    { id: 'v4-2024', year: 2024, panel_type: '3_panels', cash_price: 400000, one_installment_price: 430000, two_installments_price: 230000, three_installments_price: 165000 },
  ],
  advertisingContracts: [],
  panels: Array.from({ length: 72 }, (_, i) => ({
    id: `p-${i + 1}`,
    panel_number: i + 1,
    status: 'available',
  })),
  clubConfig: {
    president: { full_name: '', dni: '', civil_status: '', address: '' },
    collectors: []
  },
  receiptCounter: { 2024: 0 },
  syncQueue: []
};

const migrateData = (data: any): StorageData => {
  if (!data) return INITIAL_DATA;

  // Check if data is already in English format
  if (data.members !== undefined) return data;

  // Migration from Spanish to English
  const migrated: StorageData = {
    users: data.users || INITIAL_DATA.users,
    members: (data.socios || []).map((s: any) => ({
      id: s.id,
      member_number: s.numero_socio,
      first_name: s.nombre,
      last_name: s.apellido,
      dni: s.dni,
      phone: s.telefono,
      address: s.direccion,
      category: s.categoria === 'grupo_familiar' ? 'family_group' : 'general',
      created_at: s.created_at
    })),
    payments: (data.pagos || []).map((p: any) => ({
      id: p.id,
      member_id: p.socio_id,
      year: p.año,
      month: p.mes,
      amount: p.monto,
      payment_date: p.fecha_pago,
      receipt_number: p.recibo_numero,
      is_annulled: p.anulado,
      created_by: p.usuario_registro
    })),
    movements: (data.movimientos || []).map((m: any) => ({
      id: m.id,
      date: m.fecha,
      type: m.tipo === 'ingreso' ? 'income' : 'expense',
      expense_group: m.grupo_egreso === 'socios' ? 'members' : (m.grupo_egreso === 'publicidad' ? 'advertising' : m.grupo_egreso),
      category_id: m.categoria_id,
      description: m.description || m.descripcion,
      amount: m.monto,
      origin: m.origen === 'socios' ? 'members' : (m.origen === 'publicidad' ? 'advertising' : m.origen),
      reference_type: m.referencia_tipo === 'pago_socio' ? 'member_payment' : (m.referencia_tipo === 'contrato_publicidad' ? 'advertising_contract' : m.referencia_tipo),
      reference_id: m.referencia_id,
      is_annulled: m.anulado,
      created_by: m.usuario_registro
    })),
    membershipRates: (data.cuotasConfig || []).map((c: any) => ({
      id: c.id,
      year: c.año,
      month: c.mes,
      category: c.categoria === 'grupo_familiar' ? 'family_group' : 'general',
      amount: c.valor
    })),
    panels: (data.paneles || []).map((p: any) => ({
      id: p.id,
      panel_number: p.numero_panel,
      status: p.estado === 'disponible' ? 'available' : (p.estado === 'reservado' ? 'reserved' : 'sold'),
      group_id: p.agrupacion_id,
      contract_id: p.contrato_id
    })),
    advertisingContracts: (data.contratosPublicidad || []).map((c: any) => ({
      id: c.id,
      year: c.año,
      client_name: c.cliente,
      legal_representative: c.representante_legal,
      representative_dni: c.dni_representante,
      phone: c.telefono,
      address: c.direccion,
      panel_id: c.panel_id,
      panel_type: c.tipo_panel === '2_paneles' ? '2_panels' : (c.tipo_panel === '3_paneles' ? '3_panels' : c.tipo_panel),
      payment_method: c.modalidad_pago === 'contado' ? 'cash' : c.modalidad_pago,
      total_amount: c.valor_total,
      installment_amount: c.monto_cuota,
      installments_paid: c.cuotas_pagadas,
      collector_id: c.agente_cobranza_id,
      created_at: c.created_at,
      start_date: c.fecha_inicio,
      expiry_date: c.fecha_vencimiento
    })),
    advertisingRates: (data.publicidadValores || []).map((r: any) => ({
      id: r.id,
      year: r.año,
      panel_type: r.tipo_panel === '2_paneles' ? '2_panels' : (r.tipo_panel === '3_paneles' ? '3_panels' : r.tipo_panel),
      cash_price: r.valor_contado,
      one_installment_price: r.valor_1_cuota,
      two_installments_price: r.valor_2_cuotas,
      three_installments_price: r.valor_3_cuotas
    })),
    clubConfig: {
      president: {
        full_name: data.clubConfig?.presidente?.nombre_apellido || '',
        dni: data.clubConfig?.presidente?.dni || '',
        civil_status: data.clubConfig?.presidente?.estado_civil || '',
        address: data.clubConfig?.presidente?.direccion || ''
      },
      collectors: (data.clubConfig?.agentes_cobranza || []).map((a: any) => ({
        id: a.id,
        full_name: a.nombre_apellido,
        dni: a.dni
      }))
    },
    receiptCounter: data.reciboCounter || INITIAL_DATA.receiptCounter,
    syncQueue: data.syncQueue || []
  };

  return migrated;
};

export const StorageService = {
  getData(): StorageData {
    const data = localStorage.getItem(STORAGE_KEY);
    let parsed = data ? JSON.parse(data) : INITIAL_DATA;

    parsed = migrateData(parsed);

    if (parsed.users && !parsed.users.find((u: User) => u.email === 'Agalli33@hotmail.com')) {
      parsed.users.push({ id: 'admin-tony', email: 'Agalli33@hotmail.com', password: 'Tony1433', role: UserRole.ADMIN_GENERAL, active: true });
      this.saveData(parsed);
    }

    if (!parsed.users) parsed.users = INITIAL_DATA.users;
    if (!parsed.advertisingContracts) parsed.advertisingContracts = [];
    if (!parsed.clubConfig) parsed.clubConfig = INITIAL_DATA.clubConfig;
    if (!parsed.receiptCounter) parsed.receiptCounter = INITIAL_DATA.receiptCounter;
    if (!parsed.syncQueue) parsed.syncQueue = [];
    return parsed;
  },

  saveData(data: StorageData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  addToSyncQueue(type: SyncTask['type'], payload: any) {
    const data = this.getData();
    const task: SyncTask = {
      id: crypto.randomUUID(),
      type,
      payload,
      timestamp: new Date().toISOString()
    };
    data.syncQueue.push(task);
    this.saveData(data);
  },

  clearSyncQueue() {
    const data = this.getData();
    data.syncQueue = [];
    this.saveData(data);
  },

  getCurrentUser(): User | null {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  },

  addUser(user: User) {
    const data = this.getData();
    data.users.push(user);
    this.saveData(data);
  },

  updateUser(id: string, updates: Partial<User>) {
    const data = this.getData();
    const index = data.users.findIndex(u => u.id === id);
    if (index !== -1) {
      data.users[index] = { ...data.users[index], ...updates };
      this.saveData(data);
    }
  },

  deleteUser(id: string) {
    const data = this.getData();
    data.users = data.users.filter(u => u.id !== id);
    this.saveData(data);
  },

  initializeYear(year: number) {
    const data = this.getData();
    const hasCuotas = data.membershipRates.some(c => c.year === year);
    if (!hasCuotas) {
      const newCuotas = Array.from({ length: 12 }, (_, i) => ([
        { id: `c-gen-${year}-${i+1}`, year: year, month: i + 1, category: 'general' as const, amount: 2500 },
        { id: `c-fam-${year}-${i+1}`, year: year, month: i + 1, category: 'family_group' as const, amount: 4500 },
      ])).flat();
      data.membershipRates = [...data.membershipRates, ...newCuotas];
    }
    const hasPublicidad = data.advertisingRates.some(v => v.year === year);
    if (!hasPublicidad) {
      const newPublicidad = [
        { id: `v1-${year}`, year: year, panel_type: '1_panel' as const, cash_price: 150000, one_installment_price: 160000, two_installments_price: 85000, three_installments_price: 60000 },
        { id: `v2-${year}`, year: year, panel_type: '1_5_panel' as const, cash_price: 220000, one_installment_price: 235000, two_installments_price: 125000, three_installments_price: 90000 },
        { id: `v3-${year}`, year: year, panel_type: '2_panels' as const, cash_price: 280000, one_installment_price: 300000, two_installments_price: 160000, three_installments_price: 115000 },
        { id: `v4-${year}`, year: year, panel_type: '3_panels' as const, cash_price: 400000, one_installment_price: 430000, two_installments_price: 230000, three_installments_price: 165000 },
      ];
      data.advertisingRates = [...data.advertisingRates, ...newPublicidad];
    }
    if (!data.receiptCounter[year]) {
      data.receiptCounter[year] = 0;
    }
    this.saveData(data);
  },

  updateClubConfig(config: ClubConfig) {
    const data = this.getData();
    data.clubConfig = config;
    this.saveData(data);
  },

  addCollector(collector: Collector) {
    const data = this.getData();
    data.clubConfig.collectors.push(collector);
    this.saveData(data);
  },

  removeCollector(id: string) {
    const data = this.getData();
    data.clubConfig.collectors = data.clubConfig.collectors.filter(a => a.id !== id);
    this.saveData(data);
  },

  addMember(member: Member) {
    const data = this.getData();
    data.members.push(member);
    this.addToSyncQueue('SOCIO_CREATE', member);
    this.saveData(data);
  },

  importMembers(newMembers: Member[]) {
    const data = this.getData();
    data.members = [...data.members, ...newMembers];
    newMembers.forEach(s => this.addToSyncQueue('SOCIO_CREATE', s));
    this.saveData(data);
  },

  updateMembershipRate(id: string, amount: number) {
    const data = this.getData();
    const config = data.membershipRates.find(c => c.id === id);
    if (config) {
      config.amount = amount;
      this.saveData(data);
    }
  },

  updateAdvertisingRate(id: string, field: keyof AdvertisingRate, amount: number) {
    const data = this.getData();
    const config = data.advertisingRates.find(c => c.id === id);
    if (config) {
      (config as any)[field] = amount;
      this.saveData(data);
    }
  },

  addMovement(movement: AccountingMovement) {
    const data = this.getData();
    data.movements.push(movement);
    if (movement.type === 'expense') {
      this.addToSyncQueue('EGRESO_ADD', movement);
    }
    this.saveData(data);
  },

  updateMovement(id: string, updates: Partial<AccountingMovement>) {
    const data = this.getData();
    const index = data.movements.findIndex(m => m.id === id);
    if (index !== -1) {
      data.movements[index] = { ...data.movements[index], ...updates };

      if (data.movements[index].reference_type === 'member_payment' && updates.amount !== undefined) {
        const payment = data.payments.find(p => p.id === data.movements[index].reference_id);
        if (payment) payment.amount = updates.amount;
      }

      this.saveData(data);
    }
  },

  deleteMovement(id: string) {
    const data = this.getData();
    const mov = data.movements.find(m => m.id === id);

    if (mov) {
      if (mov.reference_type === 'member_payment') {
        data.payments = data.payments.filter(p => p.id !== mov.reference_id);
      } else if (mov.reference_type === 'advertising_contract') {
        const contract = data.advertisingContracts.find(c => c.id === mov.reference_id);
        if (contract) {
          contract.installments_paid = Math.max(0, contract.installments_paid - 1);
        }
      }

      data.movements = data.movements.filter(m => m.id !== id);
      this.saveData(data);
    }
  },

  registerPayment(payment: MemberPayment) {
    const data = this.getData();
    data.payments.push(payment);

    const movement: AccountingMovement = {
      id: crypto.randomUUID(),
      date: payment.payment_date,
      type: 'income',
      category_id: 'membership_fees',
      description: `Cobro cuota ${payment.month}/${payment.year} - Member ${payment.member_id}`,
      amount: payment.amount,
      origin: 'members',
      reference_type: 'member_payment',
      reference_id: payment.id,
      is_annulled: false,
      created_by: payment.created_by,
    };
    data.movements.push(movement);
    this.addToSyncQueue('PAGO_REGISTER', { payment, movement });
    this.saveData(data);
  },

  annulPayment(paymentId: string) {
    const data = this.getData();
    const payment = data.payments.find(p => p.id === paymentId);
    if (payment) {
      payment.is_annulled = true;
      const mov = data.movements.find(m => m.reference_id === paymentId && m.reference_type === 'member_payment');
      if (mov) mov.is_annulled = true;
      this.saveData(data);
    }
  },

  addAdvertisingContract(contract: AdvertisingContract, userId: string) {
    const data = this.getData();
    data.advertisingContracts.push(contract);
    const panel = data.panels.find(p => p.id === contract.panel_id);
    let movement: AccountingMovement | null = null;

    if (panel) {
      panel.status = 'sold';
      panel.contract_id = contract.id;
      if (panel.group_id) {
        data.panels.forEach(p => {
          if (p.group_id === panel.group_id) {
            p.status = 'sold';
            p.contract_id = contract.id;
          }
        });
      }
    }
    if (contract.payment_method === 'cash') {
      movement = {
        id: crypto.randomUUID(),
        date: contract.created_at,
        type: 'income',
        category_id: 'advertising',
        description: `Contrato Publicidad - Cliente: ${contract.client_name} (Cash)`,
        amount: contract.total_amount,
        origin: 'advertising',
        reference_type: 'advertising_contract',
        reference_id: contract.id,
        is_annulled: false,
        created_by: userId,
      };
      data.movements.push(movement);
      contract.installments_paid = 1;
    }
    this.addToSyncQueue('PUBLICIDAD_CONTRACT', { contract, movement });
    this.saveData(data);
  },

  updatePanelStatus(panelId: string, status: PanelStatus) {
    const data = this.getData();
    const panel = data.panels.find(p => p.id === panelId);
    if (panel) {
      const panelsToUpdate = panel.group_id
        ? data.panels.filter(p => p.group_id === panel.group_id)
        : [panel];

      panelsToUpdate.forEach(p => {
        p.status = status;
        if (status === 'available') {
          p.contract_id = undefined;
        }
      });
      this.saveData(data);
    }
  },

  associatePanels(ids: string[]) {
    const data = this.getData();
    const groupId = crypto.randomUUID();
    ids.forEach(id => {
      const p = data.panels.find(panel => panel.id === id);
      if (p) p.group_id = groupId;
    });
    this.saveData(data);
  },

  disassociatePanels(groupId: string) {
    const data = this.getData();
    data.panels.forEach(p => {
      if (p.group_id === groupId) {
        delete p.group_id;
      }
    });
    this.saveData(data);
  },

  registerAdvertisingPayment(contractId: string, amount: number, userId: string) {
    const data = this.getData();
    const contract = data.advertisingContracts.find(c => c.id === contractId);
    if (contract) {
      contract.installments_paid++;
      const movement: AccountingMovement = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        type: 'income',
        category_id: 'advertising',
        description: `Pago Publicidad - Cliente: ${contract.client_name} (Cuota ${contract.installments_paid})`,
        amount: amount,
        origin: 'advertising',
        reference_type: 'advertising_contract',
        reference_id: contract.id,
        is_annulled: false,
        created_by: userId,
      };
      data.movements.push(movement);
      this.addToSyncQueue('PUBLICIDAD_PAY', { contract_id: contractId, amount, movement });
      this.saveData(data);
    }
  },

  getNextReceipt(year: number): string {
    const data = this.getData();
    if (!data.receiptCounter[year]) data.receiptCounter[year] = 0;
    data.receiptCounter[year]++;
    this.saveData(data);
    return `${year}-${data.receiptCounter[year].toString().padStart(4, '0')}`;
  }
};
