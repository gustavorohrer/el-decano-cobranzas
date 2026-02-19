
import { Member, MemberPayment, AccountingMovement, MembershipRate, AdvertisingPanel, User, UserRole, AdvertisingRate, AdvertisingContract, PanelType, PanelStatus, ClubConfig, SyncTask, Collector } from '../types';

const STORAGE_KEY = 'club_barrio_data';
const SESSION_KEY = 'club_barrio_session';

interface StorageData {
  users: User[];
  socios: Member[];
  pagos: MemberPayment[];
  movimientos: AccountingMovement[];
  cuotasConfig: MembershipRate[];
  paneles: AdvertisingPanel[];
  contratosPublicidad: AdvertisingContract[];
  publicidadValores: AdvertisingRate[];
  clubConfig: ClubConfig;
  reciboCounter: { [año: number]: number };
  syncQueue: SyncTask[];
}

const INITIAL_DATA: StorageData = {
  users: [
    { id: 'admin-1', email: 'admin@club.com', password: 'admin', role: UserRole.ADMIN_GENERAL, active: true },
    { id: 'admin-tony', email: 'Agalli33@hotmail.com', password: 'Tony1433', role: UserRole.ADMIN_GENERAL, active: true }
  ],
  socios: [],
  pagos: [],
  movimientos: [],
  cuotasConfig: Array.from({ length: 12 }, (_, i) => ([
    { id: `c-gen-${2024}-${i+1}`, año: 2024, mes: i + 1, categoria: 'general' as const, valor: 2500 },
    { id: `c-fam-${2024}-${i+1}`, año: 2024, mes: i + 1, categoria: 'grupo_familiar' as const, valor: 4500 },
  ])).flat(),
  publicidadValores: [
    { id: 'v1-2024', año: 2024, tipo_panel: '1_panel', valor_contado: 150000, valor_1_cuota: 160000, valor_2_cuotas: 85000, valor_3_cuotas: 60000 },
    { id: 'v2-2024', año: 2024, tipo_panel: '1_5_panel', valor_contado: 220000, valor_1_cuota: 235000, valor_2_cuotas: 125000, valor_3_cuotas: 90000 },
    { id: 'v3-2024', año: 2024, tipo_panel: '2_paneles', valor_contado: 280000, valor_1_cuota: 300000, valor_2_cuotas: 160000, valor_3_cuotas: 115000 },
    { id: 'v4-2024', año: 2024, tipo_panel: '3_paneles', valor_contado: 400000, valor_1_cuota: 430000, valor_2_cuotas: 230000, valor_3_cuotas: 165000 },
  ],
  contratosPublicidad: [],
  paneles: Array.from({ length: 72 }, (_, i) => ({
    id: `p-${i + 1}`,
    numero_panel: i + 1,
    estado: 'disponible',
  })),
  clubConfig: {
    presidente: { nombre_apellido: '', dni: '', estado_civil: '', direccion: '' },
    agentes_cobranza: []
  },
  reciboCounter: { 2024: 0 },
  syncQueue: []
};

export const StorageService = {
  getData(): StorageData {
    const data = localStorage.getItem(STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : INITIAL_DATA;

    if (parsed.users && !parsed.users.find((u: User) => u.email === 'Agalli33@hotmail.com')) {
      parsed.users.push({ id: 'admin-tony', email: 'Agalli33@hotmail.com', password: 'Tony1433', role: UserRole.ADMIN_GENERAL, active: true });
      this.saveData(parsed);
    }

    if (!parsed.users) parsed.users = INITIAL_DATA.users;
    if (!parsed.contratosPublicidad) parsed.contratosPublicidad = [];
    if (!parsed.clubConfig) parsed.clubConfig = INITIAL_DATA.clubConfig;
    if (!parsed.reciboCounter) parsed.reciboCounter = INITIAL_DATA.reciboCounter;
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

  initializeYear(año: number) {
    const data = this.getData();
    const hasCuotas = data.cuotasConfig.some(c => c.año === año);
    if (!hasCuotas) {
      const newCuotas = Array.from({ length: 12 }, (_, i) => ([
        { id: `c-gen-${año}-${i+1}`, año: año, mes: i + 1, categoria: 'general' as const, valor: 2500 },
        { id: `c-fam-${año}-${i+1}`, año: año, mes: i + 1, categoria: 'grupo_familiar' as const, valor: 4500 },
      ])).flat();
      data.cuotasConfig = [...data.cuotasConfig, ...newCuotas];
    }
    const hasPublicidad = data.publicidadValores.some(v => v.año === año);
    if (!hasPublicidad) {
      const newPublicidad = [
        { id: `v1-${año}`, año: año, tipo_panel: '1_panel' as const, valor_contado: 150000, valor_1_cuota: 160000, valor_2_cuotas: 85000, valor_3_cuotas: 60000 },
        { id: `v2-${año}`, año: año, tipo_panel: '1_5_panel' as const, valor_contado: 220000, valor_1_cuota: 235000, valor_2_cuotas: 125000, valor_3_cuotas: 90000 },
        { id: `v3-${año}`, año: año, tipo_panel: '2_paneles' as const, valor_contado: 280000, valor_1_cuota: 300000, valor_2_cuotas: 160000, valor_3_cuotas: 115000 },
        { id: `v4-${año}`, año: año, tipo_panel: '3_paneles' as const, valor_contado: 400000, valor_1_cuota: 430000, valor_2_cuotas: 230000, valor_3_cuotas: 165000 },
      ];
      data.publicidadValores = [...data.publicidadValores, ...newPublicidad];
    }
    if (!data.reciboCounter[año]) {
      data.reciboCounter[año] = 0;
    }
    this.saveData(data);
  },

  updateClubConfig(config: ClubConfig) {
    const data = this.getData();
    data.clubConfig = config;
    this.saveData(data);
  },

  addAgente(agente: Collector) {
    const data = this.getData();
    data.clubConfig.agentes_cobranza.push(agente);
    this.saveData(data);
  },

  removeAgente(id: string) {
    const data = this.getData();
    data.clubConfig.agentes_cobranza = data.clubConfig.agentes_cobranza.filter(a => a.id !== id);
    this.saveData(data);
  },

  addSocio(socio: Member) {
    const data = this.getData();
    data.socios.push(socio);
    this.addToSyncQueue('SOCIO_CREATE', socio);
    this.saveData(data);
  },

  importSocios(newSocios: Member[]) {
    const data = this.getData();
    data.socios = [...data.socios, ...newSocios];
    newSocios.forEach(s => this.addToSyncQueue('SOCIO_CREATE', s));
    this.saveData(data);
  },

  updateCuotaConfig(id: string, valor: number) {
    const data = this.getData();
    const config = data.cuotasConfig.find(c => c.id === id);
    if (config) {
      config.valor = valor;
      this.saveData(data);
    }
  },

  updatePublicidadConfig(id: string, field: keyof AdvertisingRate, valor: number) {
    const data = this.getData();
    const config = data.publicidadValores.find(c => c.id === id);
    if (config) {
      (config as any)[field] = valor;
      this.saveData(data);
    }
  },

  addMovimiento(movimiento: AccountingMovement) {
    const data = this.getData();
    data.movimientos.push(movimiento);
    if (movimiento.tipo === 'egreso') {
      this.addToSyncQueue('EGRESO_ADD', movimiento);
    }
    this.saveData(data);
  },

  updateMovimiento(id: string, updates: Partial<AccountingMovement>) {
    const data = this.getData();
    const index = data.movimientos.findIndex(m => m.id === id);
    if (index !== -1) {
      data.movimientos[index] = { ...data.movimientos[index], ...updates };

      if (data.movimientos[index].referencia_tipo === 'pago_socio' && updates.monto !== undefined) {
        const pago = data.pagos.find(p => p.id === data.movimientos[index].referencia_id);
        if (pago) pago.monto = updates.monto;
      }

      this.saveData(data);
    }
  },

  deleteMovimiento(id: string) {
    const data = this.getData();
    const mov = data.movimientos.find(m => m.id === id);

    if (mov) {
      if (mov.referencia_tipo === 'pago_socio') {
        data.pagos = data.pagos.filter(p => p.id !== mov.referencia_id);
      } else if (mov.referencia_tipo === 'contrato_publicidad') {
        const contrato = data.contratosPublicidad.find(c => c.id === mov.referencia_id);
        if (contrato) {
          contrato.cuotas_pagadas = Math.max(0, contrato.cuotas_pagadas - 1);
        }
      }

      data.movimientos = data.movimientos.filter(m => m.id !== id);
      this.saveData(data);
    }
  },

  registerPago(pago: MemberPayment) {
    const data = this.getData();
    data.pagos.push(pago);

    const movimiento: AccountingMovement = {
      id: crypto.randomUUID(),
      fecha: pago.fecha_pago,
      tipo: 'ingreso',
      categoria_id: 'cuotas_socios',
      descripcion: `Cobro cuota ${pago.mes}/${pago.año} - Socio ${pago.socio_id}`,
      monto: pago.monto,
      origen: 'socios',
      referencia_tipo: 'pago_socio',
      referencia_id: pago.id,
      anulado: false,
      usuario_registro: pago.usuario_registro,
    };
    data.movimientos.push(movimiento);
    this.addToSyncQueue('PAGO_REGISTER', { pago, movimiento });
    this.saveData(data);
  },

  annulPago(pagoId: string) {
    const data = this.getData();
    const pago = data.pagos.find(p => p.id === pagoId);
    if (pago) {
      pago.anulado = true;
      const mov = data.movimientos.find(m => m.referencia_id === pagoId && m.referencia_tipo === 'pago_socio');
      if (mov) mov.anulado = true;
      this.saveData(data);
    }
  },

  addContratoPublicidad(contrato: AdvertisingContract, usuario_id: string) {
    const data = this.getData();
    data.contratosPublicidad.push(contrato);
    const panel = data.paneles.find(p => p.id === contrato.panel_id);
    let movimiento: AccountingMovement | null = null;

    if (panel) {
      panel.estado = 'vendido';
      panel.contrato_id = contrato.id;
      if (panel.agrupacion_id) {
        data.paneles.forEach(p => {
          if (p.agrupacion_id === panel.agrupacion_id) {
            p.estado = 'vendido';
            p.contrato_id = contrato.id;
          }
        });
      }
    }
    if (contrato.modalidad_pago === 'contado') {
      movimiento = {
        id: crypto.randomUUID(),
        fecha: contrato.created_at,
        tipo: 'ingreso',
        categoria_id: 'publicidad',
        descripcion: `Contrato Publicidad - Cliente: ${contrato.cliente} (Contado)`,
        monto: contrato.valor_total,
        origen: 'publicidad',
        referencia_tipo: 'contrato_publicidad',
        referencia_id: contrato.id,
        anulado: false,
        usuario_registro: usuario_id,
      };
      data.movimientos.push(movimiento);
      contrato.cuotas_pagadas = 1;
    }
    this.addToSyncQueue('PUBLICIDAD_CONTRACT', { contrato, movimiento });
    this.saveData(data);
  },

  updatePanelStatus(panelId: string, status: PanelStatus) {
    const data = this.getData();
    const panel = data.paneles.find(p => p.id === panelId);
    if (panel) {
      const panelsToUpdate = panel.agrupacion_id
        ? data.paneles.filter(p => p.agrupacion_id === panel.agrupacion_id)
        : [panel];

      panelsToUpdate.forEach(p => {
        p.estado = status;
        if (status === 'disponible') {
          p.contrato_id = undefined;
        }
      });
      this.saveData(data);
    }
  },

  associatePanels(ids: string[]) {
    const data = this.getData();
    const group_id = crypto.randomUUID();
    ids.forEach(id => {
      const p = data.paneles.find(panel => panel.id === id);
      if (p) p.agrupacion_id = group_id;
    });
    this.saveData(data);
  },

  disassociatePanels(group_id: string) {
    const data = this.getData();
    data.paneles.forEach(p => {
      if (p.agrupacion_id === group_id) {
        delete p.agrupacion_id;
      }
    });
    this.saveData(data);
  },

  registerPagoPublicidad(contrato_id: string, monto: number, usuario_id: string) {
    const data = this.getData();
    const contrato = data.contratosPublicidad.find(c => c.id === contrato_id);
    if (contrato) {
      contrato.cuotas_pagadas++;
      const movimiento: AccountingMovement = {
        id: crypto.randomUUID(),
        fecha: new Date().toISOString(),
        tipo: 'ingreso',
        categoria_id: 'publicidad',
        descripcion: `Pago Publicidad - Cliente: ${contrato.cliente} (Cuota ${contrato.cuotas_pagadas})`,
        monto: monto,
        origen: 'publicidad',
        referencia_tipo: 'contrato_publicidad',
        referencia_id: contrato.id,
        anulado: false,
        usuario_registro: usuario_id,
      };
      data.movimientos.push(movimiento);
      this.addToSyncQueue('PUBLICIDAD_PAY', { contrato_id, monto, movimiento });
      this.saveData(data);
    }
  },

  getNextRecibo(año: number): string {
    const data = this.getData();
    if (!data.reciboCounter[año]) data.reciboCounter[año] = 0;
    data.reciboCounter[año]++;
    this.saveData(data);
    return `${año}-${data.reciboCounter[año].toString().padStart(4, '0')}`;
  }
};
