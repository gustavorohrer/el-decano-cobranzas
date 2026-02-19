
import React from 'react';
import { AppState, Member, UserRole, MemberPayment, AccountingMovement, MembershipRate, AdvertisingRate, AdvertisingContract, ClubConfig, Collector, User, SyncTask } from './types';
import { StorageService } from './services/storage';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import MembersList from './components/MembersList.tsx';
import PaymentsManagement from './components/PaymentsManagement.tsx';
import MemberForm from './components/MemberForm.tsx';
import AdvertisingPanels from './components/AdvertisingPanels.tsx';
import AccountingModule from './components/AccountingModule.tsx';
import ReportsModule from './components/ReportsModule.tsx';
import ConfirmationModal from './components/ConfirmationModal';
import Login from './components/Login';
import UserManagement from './components/UserManagement';
import { MONTHS } from './constants';
// Added ArrowLeft to lucide-react imports
import { Save, Upload, X, CheckCircle, Image, Download, FileSpreadsheet, AlertCircle, LayoutGrid, CreditCard, FileText, UserCircle, Plus, Trash2, Calendar, Printer, Search, Ban, Users, CloudOff, Wifi, Cloud, Building2, UserPlus, Briefcase, UserCheck, ChevronRight, ArrowLeft } from 'lucide-react';
import * as XLSX from 'xlsx';

const App: React.FC = () => {
  const [appState, setAppState] = React.useState<AppState>({
    user: StorageService.getCurrentUser(),
    members: StorageService.getData().members,
    payments: StorageService.getData().payments,
    movements: StorageService.getData().movements,
    membershipRates: StorageService.getData().membershipRates,
    panels: StorageService.getData().panels,
    advertisingContracts: StorageService.getData().advertisingContracts,
    advertisingRates: StorageService.getData().advertisingRates,
    clubConfig: StorageService.getData().clubConfig,
    isOffline: !navigator.onLine,
    syncQueue: StorageService.getData().syncQueue,
  });

  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [selectedMember, setSelectedMember] = React.useState<Member | null>(null);
  const [isAddingMember, setIsAddingMember] = React.useState(false);
  const [adminView, setAdminView] = React.useState<'main' | 'cuotas' | 'publicidad_config' | 'institucional' | 'recibos' | 'usuarios'>('main');

  // SE ESTABLECE 2026 COMO AÑO DE INICIO PARA CONFIGURACIÓN
  const [adminSelectedYear, setAdminSelectedYear] = React.useState(2026);

  const [showEgresoModal, setShowEgresoModal] = React.useState(false);
  const [expenseGroup, setExpenseGroup] = React.useState<'members' | 'advertising'>('members');
  const [pagoToAnnul, setPagoToAnnul] = React.useState<string | null>(null);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const [newAgenteName, setNewAgenteName] = React.useState('');
  const [newAgenteDni, setNewAgenteDni] = React.useState('');

  const currentYear = new Date().getFullYear();

  const syncPendingData = async () => {
    const queue = StorageService.getData().syncQueue;
    if (queue.length === 0) return;
    setIsSyncing(true);
    for (const task of queue) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    StorageService.clearSyncQueue();
    refreshData();
    setIsSyncing(false);
  };

  React.useEffect(() => {
    // Inicializar el año 2026 al cargar si no existe
    StorageService.initializeYear(2026);
    refreshData();

    const handleOnline = () => {
      setAppState(prev => ({ ...prev, isOffline: false }));
      syncPendingData();
    };
    const handleOffline = () => setAppState(prev => ({ ...prev, isOffline: true }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if (navigator.onLine) syncPendingData();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshData = () => {
    const data = StorageService.getData();
    setAppState(prev => ({ ...prev, ...data, syncQueue: data.syncQueue }));
  };

  const handleLogin = (user: User) => {
    setAppState(prev => ({ ...prev, user }));
    refreshData();
  };

  const handleLogout = () => {
    StorageService.setCurrentUser(null);
    setAppState(prev => ({ ...prev, user: null }));
    setActiveTab('dashboard');
    setAdminView('main');
    setSelectedMember(null);
    setIsAddingMember(false);
    setShowLogoutConfirm(false);
  };

  const handleSaveNewMember = (memberData: Omit<Member, 'id' | 'created_at'>) => {
    const nuevo: Member = { ...memberData, id: crypto.randomUUID(), created_at: new Date().toISOString() };
    StorageService.addMember(nuevo);
    refreshData();
    setIsAddingMember(false);
  };

  const handleRegisterPayment = (months: number[]): MemberPayment[] => {
    if (!selectedMember) return [];
    const newPayments: MemberPayment[] = [];
    months.forEach(month => {
      const config = appState.membershipRates.find(c => c.month === month && c.year === currentYear && c.category === selectedMember.category);
      const amount = config ? config.amount : 2500;
      const payment: MemberPayment = {
        id: crypto.randomUUID(), member_id: selectedMember.id, year: currentYear, month: month, amount: amount,
        payment_date: new Date().toISOString(), receipt_number: StorageService.getNextReceipt(currentYear),
        is_annulled: false, created_by: appState.user?.id || 'sys',
      };
      StorageService.registerPayment(payment);
      newPayments.push(payment);
    });
    refreshData();
    return newPayments;
  };

  const handleAnnulPayment = () => {
    if (pagoToAnnul) {
      StorageService.annulPayment(pagoToAnnul);
      setPagoToAnnul(null);
      refreshData();
    }
  };

  const handleSaveExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get('monto'));
    const description = formData.get('descripcion') as string;
    const category = formData.get('categoria') as string;

    const movement: AccountingMovement = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      type: 'expense',
      expense_group: expenseGroup,
      category_id: category,
      description: description,
      amount: amount,
      origin: 'manual',
      reference_type: 'none',
      is_annulled: false,
      created_by: appState.user?.id || 'admin',
    };

    StorageService.addMovement(movement);
    refreshData();
    setShowEgresoModal(false);
  };

  const handleAddCollector = () => {
    if (!newAgenteName || !newAgenteDni) return;
    StorageService.addCollector({
      id: crypto.randomUUID(),
      full_name: newAgenteName,
      dni: newAgenteDni
    });
    setNewAgenteName('');
    setNewAgenteDni('');
    refreshData();
  };

  const handleSavePresident = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const config = {
      ...appState.clubConfig,
      president: {
        full_name: formData.get('presi_nombre') as string,
        dni: formData.get('presi_dni') as string,
        civil_status: formData.get('presi_civil') as string,
        address: formData.get('presi_dire') as string,
      }
    };
    StorageService.updateClubConfig(config);
    refreshData();
    alert('Datos del presidente actualizados correctamente');
  };

  const printReceipt = (payment: MemberPayment, member: Member) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`<html><head><title>Recibo ${payment.receipt_number}</title><style>body { font-family: sans-serif; padding: 40px; color: #333; } .receipt-box { border: 2px solid #064e3b; padding: 30px; border-radius: 20px; max-width: 600px; margin: 0 auto; } .header { display: flex; justify-content: space-between; border-bottom: 2px solid #f0fdf4; padding-bottom: 20px; margin-bottom: 20px; } .club-name { color: #064e3b; font-size: 24px; font-weight: 900; margin: 0; } .total { background: #f0fdf4; padding: 20px; border-radius: 15px; text-align: right; } .total-val { font-size: 28px; font-weight: 900; color: #064e3b; }</style></head><body><div class="receipt-box"><h1>C.D. 1° DE MAYO</h1><p>Recibo N° ${payment.receipt_number}</p><p>Socio: ${member.first_name} ${member.last_name}</p><p>Concepto: Cuota ${MONTHS[payment.month-1]} / ${payment.year}</p><div class="total">Monto: $${payment.amount.toLocaleString()}</div></div></body></html>`);
    printWindow.document.close();
    printWindow.print();
  };

  if (!appState.user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard membersCount={appState.members.length} movements={appState.movements} />;
      case 'members':
        if (selectedMember) return <PaymentsManagement member={selectedMember} payments={appState.payments.filter(p => p.member_id === selectedMember.id)} membershipRates={appState.membershipRates} onRegister={handleRegisterPayment} onClose={() => setSelectedMember(null)} />;
        if (isAddingMember) return <MemberForm onSave={handleSaveNewMember} onCancel={() => setIsAddingMember(false)} existingNumbers={appState.members.map(s => s.member_number)} existingDnis={appState.members.map(s => s.dni)} />;
        return <MembersList members={appState.members} onAdd={() => setIsAddingMember(true)} onSelect={setSelectedMember} />;
      case 'publicidad': return <AdvertisingPanels panels={appState.panels} advertisingContracts={appState.advertisingContracts} advertisingRates={appState.advertisingRates} clubConfig={appState.clubConfig} userRole={appState.user?.role || UserRole.COBRADOR} onRegisterContract={(contract) => { StorageService.addAdvertisingContract(contract, appState.user?.id || 'admin'); refreshData(); }} onRegisterPayment={(cid, amount) => { StorageService.registerAdvertisingPayment(cid, amount, appState.user?.id || 'admin'); refreshData(); }} onRefresh={refreshData} />;
      case 'contabilidad':
        return (
          <AccountingModule
            movements={appState.movements}
            members={appState.members}
            userRole={appState.user?.role}
            onAddExpense={() => setShowEgresoModal(true)}
            onRefresh={refreshData}
          />
        );
      case 'reportes': return <ReportsModule movements={appState.movements} members={appState.members} advertisingContracts={appState.advertisingContracts} />;
      case 'admin':
        if (adminView === 'usuarios') return <UserManagement onRefresh={refreshData} onBack={() => setAdminView('main')} />;

        if (adminView === 'cuotas') {
          return (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <button onClick={() => setAdminView('main')} className="text-emerald-700 font-bold flex items-center gap-1 hover:underline"><ArrowLeft size={18} /> Volver</button>
                <div className="h-6 w-px bg-slate-200"></div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Valores de Cuotas</h2>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-600 rounded-2xl text-white shadow-lg"><Calendar size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-emerald-800 tracking-widest leading-none mb-1">Periodo Fiscal</p>
                    <p className="text-xl font-black text-emerald-950">Configurando año {adminSelectedYear}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-emerald-800">Cambiar Año:</label>
                  <select
                    value={adminSelectedYear}
                    onChange={(e) => {
                      const y = Number(e.target.value);
                      setAdminSelectedYear(y);
                      StorageService.initializeYear(y);
                      refreshData();
                    }}
                    className="bg-white border-2 border-emerald-200 p-3 rounded-2xl font-black text-emerald-900 outline-none focus:ring-4 focus:ring-emerald-500/10 min-w-[120px]"
                  >
                    {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {['general', 'family_group'].map(cat => (
                  <div key={cat} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                    <div className="flex justify-between items-center border-b pb-4 border-slate-50">
                      <h3 className="text-lg font-black uppercase tracking-widest text-emerald-700">{cat.replace('_', ' ')}</h3>
                      <CreditCard className="text-emerald-200" size={24} />
                    </div>
                    <div className="space-y-4">
                      {appState.membershipRates.filter(c => c.year === adminSelectedYear && c.category === cat).slice(0, 1).map(c => (
                        <div key={c.id} className="flex flex-col gap-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">VALOR MENSUAL ACTUAL ($)</label>
                          <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300">$</span>
                            <input
                              type="number"
                              defaultValue={c.amount}
                              onBlur={(e) => {
                                const newVal = Number(e.target.value);
                                appState.membershipRates
                                  .filter(cf => cf.year === adminSelectedYear && cf.category === cat)
                                  .forEach(cf => StorageService.updateMembershipRate(cf.id, newVal));
                                refreshData();
                              }}
                              className="w-full pl-10 pr-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
                            />
                          </div>
                          <div className="flex gap-2 items-start p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <AlertCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">Al cambiar este valor, se aplicará automáticamente a los 12 meses de {adminSelectedYear} para la categoría {cat.replace('_', ' ')}.</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (adminView === 'publicidad_config') {
          return (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <button onClick={() => setAdminView('main')} className="text-indigo-700 font-bold flex items-center gap-1 hover:underline"><ArrowLeft size={18} /> Volver</button>
                <div className="h-6 w-px bg-slate-200"></div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Valores de Cartelería</h2>
              </div>

              <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-[2rem] flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg"><LayoutGrid size={24} /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-indigo-800 tracking-widest leading-none mb-1">Tarifario Publicidad</p>
                    <p className="text-xl font-black text-indigo-950">Ajuste de Precios Año {adminSelectedYear}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-indigo-800">Cambiar Año:</label>
                  <select
                    value={adminSelectedYear}
                    onChange={(e) => {
                      const y = Number(e.target.value);
                      setAdminSelectedYear(y);
                      StorageService.initializeYear(y);
                      refreshData();
                    }}
                    className="bg-white border-2 border-indigo-200 p-3 rounded-2xl font-black text-indigo-900 outline-none focus:ring-4 focus:ring-indigo-500/10 min-w-[120px]"
                  >
                    {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {appState.advertisingRates.filter(v => v.year === adminSelectedYear).map(config => (
                  <div key={config.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600 transition-all group-hover:w-4"></div>
                    <div className="flex justify-between items-center mb-6 pl-2">
                      <h3 className="text-xl font-black uppercase tracking-widest text-indigo-800">{config.panel_type.replace(/_/g, ' ')}</h3>
                      <div className="px-3 py-1 bg-indigo-50 rounded-lg text-[10px] font-black text-indigo-600 uppercase">Valores {adminSelectedYear}</div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pl-2">
                      {[
                        { field: 'cash_price', label: 'Pago Contado' },
                        { field: 'one_installment_price', label: '1 Cuota' },
                        { field: 'two_installments_price', label: '2 Cuotas (c/u)' },
                        { field: 'three_installments_price', label: '3 Cuotas (c/u)' }
                      ].map(item => (
                        <div key={item.field} className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{item.label}</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                            <input
                              type="number"
                              defaultValue={(config as any)[item.field]}
                              onBlur={(e) => {
                                StorageService.updateAdvertisingRate(config.id, item.field as any, Number(e.target.value));
                                refreshData();
                              }}
                              className="w-full pl-7 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-lg outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        if (adminView === 'institucional') {
          return (
            <div className="space-y-8">
              <button onClick={() => setAdminView('main')} className="text-emerald-700 font-bold flex items-center gap-1 hover:underline"><ArrowLeft size={18} /> Volver</button>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Datos Presidente */}
                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
                  <h3 className="text-xl font-black flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl"><UserCheck size={20} /></div>
                    Datos del Presidente
                  </h3>
                  <form onSubmit={handleSavePresident} className="space-y-5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nombre y Apellido</label>
                      <input name="presi_nombre" defaultValue={appState.clubConfig.president.full_name} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-emerald-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">DNI</label>
                        <input name="presi_dni" defaultValue={appState.clubConfig.president.dni} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-emerald-500" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Estado Civil</label>
                        <input name="presi_civil" defaultValue={appState.clubConfig.president.civil_status} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-emerald-500" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Dirección</label>
                      <input name="presi_dire" defaultValue={appState.clubConfig.president.address} className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-emerald-500" />
                    </div>
                    <button type="submit" className="w-full py-5 bg-emerald-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-emerald-200 flex items-center justify-center gap-2 hover:-translate-y-1 transition-all">
                      <Save size={18} /> Actualizar Datos Contractuales
                    </button>
                  </form>
                </div>

                {/* Agentes de Cobranza */}
                <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm space-y-6">
                  <h3 className="text-xl font-black flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl"><Briefcase size={20} /></div>
                    Agentes de Cobranza
                  </h3>
                  <div className="space-y-6">
                    <div className="flex flex-col gap-3 p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-1">Agregar Nuevo Agente</p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          placeholder="Nombre y Apellido"
                          value={newAgenteName}
                          onChange={(e) => setNewAgenteName(e.target.value)}
                          className="flex-1 p-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-indigo-500 shadow-sm"
                        />
                        <input
                          placeholder="DNI"
                          value={newAgenteDni}
                          onChange={(e) => setNewAgenteDni(e.target.value)}
                          className="w-full sm:w-32 p-4 bg-white border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-indigo-500 shadow-sm"
                        />
                        <button onClick={handleAddCollector} className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center"><Plus size={24} /></button>
                      </div>
                    </div>
                    <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-2">
                      {appState.clubConfig.collectors.length === 0 ? (
                        <div className="p-10 border-2 border-dashed border-slate-100 rounded-3xl text-center">
                          <p className="text-slate-400 font-bold italic">No hay agentes registrados.</p>
                        </div>
                      ) : (
                        appState.clubConfig.collectors.map(a => (
                          <div key={a.id} className="flex justify-between items-center p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-200 transition-all">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black">{a.full_name.charAt(0)}</div>
                              <div>
                                <p className="font-bold text-slate-900">{a.full_name}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DNI: {a.dni}</p>
                              </div>
                            </div>
                            <button onClick={() => { StorageService.removeCollector(a.id); refreshData(); }} className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={20} /></button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        }

        if (adminView === 'recibos') {
          const isAdmin = appState.user?.role === UserRole.ADMIN_GENERAL;
          const filteredRecibos = appState.payments.sort((a,b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());

          return (
            <div className="space-y-6">
              <button onClick={() => setAdminView('main')} className="text-emerald-700 font-bold flex items-center gap-1 hover:underline"><ArrowLeft size={18} /> Volver</button>
              <h2 className="text-2xl font-black">Historial y Auditoría de Recibos</h2>
              <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-black tracking-widest"><tr><th className="px-6 py-5">N° Recibo</th><th className="px-6 py-5">Socio</th><th className="px-6 py-5">Periodo</th><th className="px-6 py-5 text-right">Monto</th><th className="px-6 py-5 text-center">Acciones</th></tr></thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredRecibos.map(p => {
                         const member = appState.members.find(s => s.id === p.member_id);
                         return (
                          <tr key={p.id} className={`${p.is_annulled ? 'opacity-40 grayscale bg-red-50/10' : 'hover:bg-slate-50'} transition-all`}>
                            <td className="px-6 py-4 font-black text-emerald-700">#{p.receipt_number}</td>
                            <td className="px-6 py-4 font-bold text-slate-900">{member?.first_name} {member?.last_name}</td>
                            <td className="px-6 py-4"><span className="text-[10px] font-black uppercase text-slate-400 border border-slate-200 px-2 py-0.5 rounded-md">{MONTHS[p.month - 1]} {p.year}</span></td>
                            <td className="px-6 py-4 text-right font-black text-slate-900">$ {p.amount.toLocaleString()}</td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button onClick={() => member && printReceipt(p, member)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Printer size={18} /></button>
                                {!p.is_annulled && isAdmin && <button onClick={() => setPagoToAnnul(p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Ban size={18} /></button>}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              <ConfirmationModal isOpen={!!pagoToAnnul} title="¿Anular Recibo?" message="Esta acción marcará el recibo como nulo y revertirá el ingreso contable." onConfirm={handleAnnulPayment} onCancel={() => setPagoToAnnul(null)} type="danger" />
            </div>
          );
        }

        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-8">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Administración Central</h2>
                <p className="text-slate-500 font-medium">Configuración de parámetros institucionales y valores base.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { id: 'cuotas', label: 'Valores Cuotas', desc: 'Precios de socios por categoría.', icon: CreditCard, color: 'text-emerald-700', bg: 'bg-emerald-50' },
                { id: 'publicidad_config', label: 'Valores Publicidad', desc: 'Precios planes de cartelería.', icon: LayoutGrid, color: 'text-indigo-700', bg: 'bg-indigo-50' },
                { id: 'institucional', label: 'Datos Institucionales', desc: 'Firmas de contrato y cobradores.', icon: Building2, color: 'text-emerald-700', bg: 'bg-emerald-50' },
                { id: 'recibos', label: 'Gestión de Recibos', desc: 'Auditoría histórica de cobros.', icon: Printer, color: 'text-emerald-700', bg: 'bg-emerald-50' },
                { id: 'usuarios', label: 'Gestión Usuarios', desc: 'Cuentas y permisos de acceso.', icon: Users, color: 'text-indigo-700', bg: 'bg-indigo-50' }
              ].map(card => (
                <button
                  key={card.id}
                  onClick={() => setAdminView(card.id as any)}
                  className="group p-8 bg-white rounded-[2.5rem] border border-slate-100 hover:border-slate-300 hover:shadow-2xl transition-all text-left flex flex-col items-start gap-4 relative overflow-hidden active:scale-95"
                >
                  <div className={`p-4 ${card.bg} ${card.color} rounded-2xl group-hover:scale-110 transition-transform duration-500`}>
                    <card.icon size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-slate-900 mb-1">{card.label}</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{card.desc}</p>
                  </div>
                  <ChevronRight size={24} className="absolute bottom-8 right-8 text-slate-200 group-hover:text-slate-400 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <>
      <Layout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={appState.user?.role || UserRole.COBRADOR}
        onLogout={() => setShowLogoutConfirm(true)}
        isOffline={appState.isOffline}
      >
        <div className={appState.isOffline ? 'pt-10' : ''}>{renderContent()}</div>

        {showEgresoModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Registrar Egreso</h3>
                <button onClick={() => setShowEgresoModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} className="text-slate-400" /></button>
              </div>
              <form onSubmit={handleSaveExpense} className="space-y-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Grupo de Gasto *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setExpenseGroup('members')} className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${expenseGroup === 'members' ? 'bg-emerald-700 text-white border-emerald-800 shadow-xl shadow-emerald-200' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>Socios</button>
                    <button type="button" onClick={() => setExpenseGroup('advertising')} className={`py-4 rounded-2xl font-black text-xs uppercase tracking-widest border-2 transition-all ${expenseGroup === 'advertising' ? 'bg-indigo-700 text-white border-indigo-800 shadow-xl shadow-indigo-200' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>Publicidad</button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Categoría de Gasto</label>
                  <select name="categoria" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:border-indigo-500 transition-colors">
                    {expenseGroup === 'members' ? (
                      <><option value="stationery">Librería</option><option value="materials">Materiales</option><option value="member_commissions">Comisiones Socios</option><option value="cash_closing">Cierre de Caja</option><option value="others">Otros</option></>
                    ) : (
                      <><option value="panel_painting">Pintado Cartel</option><option value="panel_whitewashing">Blanqueo Cartel</option><option value="paint">Pintura</option><option value="advertising_commissions">Comisiones Cartelería</option><option value="cash_closing">Cierre de Caja</option><option value="others">Otros</option></>
                    )}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Monto del Egreso ($)</label>
                  <input name="monto" type="number" step="0.01" required placeholder="0.00" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-black text-2xl focus:border-indigo-500 transition-colors" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Concepto / Detalle</label>
                  <textarea name="descripcion" required placeholder="Explica el motivo del gasto..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium text-sm focus:border-indigo-500 transition-colors" rows={3}></textarea>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowEgresoModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-[10px]">Cancelar</button>
                  <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:-translate-y-1 transition-all">Registrar Gasto</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Layout>

      <ConfirmationModal
        isOpen={showLogoutConfirm}
        title="¿Cerrar Sesión?"
        message="¿Estás seguro que deseas salir del sistema? Deberás ingresar tus credenciales nuevamente."
        confirmLabel="Salir"
        cancelLabel="Cancelar"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
        type="danger"
      />
    </>
  );
};

export default App;
