
import React from 'react';
import { PanelPublicidad, PanelStatus, UserRole, ContratoPublicidad, PublicidadValorConfig, PanelType, ClubConfig } from '../types';
import { Grid, CheckCircle2, Clock, User, Phone, DollarSign, X, BookmarkPlus, Ban, ArrowLeft, Layers, Link as LinkIcon, Unlink, Info, FileText, Printer, Calendar, Search, Filter, AlertTriangle } from 'lucide-react';
import { StorageService } from '../services/storage';

interface PublicidadPanelesProps {
  paneles: PanelPublicidad[];
  contratos: ContratoPublicidad[];
  valores: PublicidadValorConfig[];
  clubConfig: ClubConfig;
  userRole: UserRole;
  onRegisterContract: (contrato: ContratoPublicidad) => void;
  onRegisterPayment: (contrato_id: string, monto: number) => void;
  onRefresh: () => void;
}

const PublicidadPaneles: React.FC<PublicidadPanelesProps> = ({ 
  paneles, 
  contratos, 
  valores, 
  clubConfig,
  userRole, 
  onRegisterContract,
  onRegisterPayment,
  onRefresh
}) => {
  const [selectedPanel, setSelectedPanel] = React.useState<PanelPublicidad | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [viewState, setViewState] = React.useState<'choice' | 'details' | 'sell' | 'associate'>('choice');
  const [activeTab, setActiveTab] = React.useState<'mapa' | 'vencimientos'>('mapa');
  
  // Estados para filtros de vencimientos
  const [searchClient, setSearchClient] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<'todos' | 'activos' | 'proximos' | 'vencidos'>('todos');

  const canManage = userRole === UserRole.ADMIN_GENERAL || userRole === UserRole.TESORERO || userRole === UserRole.COBRADOR;

  const getStatusColor = (status: PanelStatus) => {
    switch (status) {
      case 'disponible': return 'bg-white border-slate-200 text-slate-400 hover:border-indigo-400';
      case 'reservado': return 'bg-yellow-50 border-yellow-200 text-yellow-600';
      case 'vendido': return 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm';
    }
  };

  const getStatusIcon = (status: PanelStatus) => {
    switch (status) {
      case 'disponible': return null;
      case 'reservado': return <Clock size={12} />;
      case 'vendido': return <CheckCircle2 size={12} />;
    }
  };

  const isOneAndHalf = (num: number) => num === 51 || num === 53;
  const isHidden = (num: number) => num === 52;

  const handlePanelClick = (panel: PanelPublicidad) => {
    setSelectedPanel(panel);
    setViewState('choice');
    setShowForm(true);
  };

  const toggleReservation = () => {
    if (!selectedPanel) return;
    const newStatus: PanelStatus = selectedPanel.estado === 'reservado' ? 'disponible' : 'reservado';
    StorageService.updatePanelStatus(selectedPanel.id, newStatus);
    onRefresh();
    setShowForm(false);
  };

  const handleAssociate = (targetPanelNum: number) => {
    if (!selectedPanel) return;
    if (isOneAndHalf(selectedPanel.numero_panel)) {
      alert("Los paneles de 1.5 ya tienen un tamaño especial y no pueden asociarse.");
      return;
    }
    const target = paneles.find(p => p.numero_panel === targetPanelNum);
    if (!target) return;
    if (isHidden(target.numero_panel)) {
        const nextTarget = paneles.find(p => p.numero_panel === (targetPanelNum + (targetPanelNum > selectedPanel.numero_panel ? 1 : -1)));
        if (nextTarget) handleAssociate(nextTarget.numero_panel);
        return;
    }
    if (target.estado !== 'disponible' || selectedPanel.estado !== 'disponible') {
      alert("Solo se pueden asociar paneles disponibles.");
      return;
    }
    const mergedIds = Array.from(new Set([
        ...(selectedPanel.agrupacion_id ? paneles.filter(p => p.agrupacion_id === selectedPanel.agrupacion_id).map(p => p.id) : [selectedPanel.id]),
        ...(target.agrupacion_id ? paneles.filter(p => p.agrupacion_id === target.agrupacion_id).map(p => p.id) : [target.id])
    ]));
    if (mergedIds.length > 3) {
      alert("No se pueden asociar más de 3 paneles.");
      return;
    }
    StorageService.associatePanels(mergedIds);
    onRefresh();
    setShowForm(false);
  };

  const handleDisassociate = () => {
    if (!selectedPanel || !selectedPanel.agrupacion_id) return;
    StorageService.disassociatePanels(selectedPanel.agrupacion_id);
    onRefresh();
    setShowForm(false);
  };

  const printContract = (contrato: ContratoPublicidad) => {
    const agente = clubConfig.agentes_cobranza.find(a => a.id === contrato.agente_cobranza_id);
    const presi = clubConfig.presidente;
    const panelNum = selectedPanel?.numero_panel || 0;
    const contractDate = new Date(contrato.fecha_inicio);
    const dateStr = contractDate.toLocaleDateString();

    const getDueDate = (days: number) => {
      const d = new Date(contractDate);
      d.setDate(d.getDate() + days);
      return d.toLocaleDateString();
    };

    const numCuotas = contrato.modalidad_pago === 'contado' ? 1 : parseInt(contrato.modalidad_pago);
    const esContado = contrato.modalidad_pago === 'contado';

    let paymentScheduleHTML = '';
    if (esContado) {
      paymentScheduleHTML = `<p><strong>Pago Único Contado:</strong> $${contrato.valor_total.toLocaleString()} - <strong>Vencimiento:</strong> Hoy (${dateStr})</p>`;
    } else {
      paymentScheduleHTML = '<ul>';
      for (let i = 1; i <= numCuotas; i++) {
        paymentScheduleHTML += `<li>Cuota ${i}: $${contrato.monto_cuota.toLocaleString()} - Vencimiento: ${getDueDate(i * 30)}</li>`;
      }
      paymentScheduleHTML += '</ul>';
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
      <head>
        <title>Contrato de Locacion - Panel ${panelNum}</title>
        <style>
          body { font-family: 'Times New Roman', serif; line-height: 1.6; padding: 40px; color: #000; font-size: 14px; max-width: 800px; margin: 0 auto; }
          .title { text-align: center; font-weight: bold; font-size: 20px; margin-bottom: 30px; text-decoration: underline; }
          .clause { margin-bottom: 20px; text-align: justify; }
          .clause-title { font-weight: bold; }
          .signatures { margin-top: 80px; display: flex; justify-content: space-between; }
          .signature-box { width: 45%; border-top: 1px solid #000; text-align: center; padding-top: 5px; }
          .payment-detail { background: #f9f9f9; padding: 15px; border: 1px solid #ddd; border-radius: 5px; margin: 10px 0; }
          ul { list-style-type: none; padding-left: 0; }
          li { margin-bottom: 5px; }
        </style>
      </head>
      <body>
        <div class="title">CONTRATO DE LOCACION</div>
        <p>En la ciudad de Chajari, Entre Ríos en fecha ${dateStr}, entre el CLUB 1 DE MAYO CUIT 30-67086212-3, representado por su presidente ${presi.nombre_apellido} D.N.I ${presi.dni}, con direccion ${presi.direccion}; en adelante EL CLUB, por una parte y ${contrato.cliente}, en adelante LA EMPRESA.</p>
        <div class="clause"><span class="clause-title">PRIMERA:</span> EL CLUB AUTORIZA A LA EMPRESA el uso de un espacio publicitario (Panel N° ${panelNum}) por el periodo de 1 (un) año.</div>
        <div class="clause"><span class="clause-title">VENCIMIENTO:</span> El presente contrato tiene vigencia hasta el día <strong>${new Date(contrato.fecha_vencimiento).toLocaleDateString()}</strong>.</div>
        <div class="clause"><span class="clause-title">QUINTA:</span> El PRECIO se estipula en $${contrato.valor_total.toLocaleString()}.</div>
        <div class="signatures">
          <div class="signature-box">EL CLUB</div>
          <div class="signature-box">LA EMPRESA</div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const getFilteredVencimientos = () => {
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(now.getMonth() + 1);

    return contratos.filter(c => {
      const expirationDate = new Date(c.fecha_vencimiento);
      const isExpired = expirationDate < now;
      const isSoon = expirationDate >= now && expirationDate <= nextMonth;
      
      const matchSearch = c.cliente.toLowerCase().includes(searchClient.toLowerCase());
      
      let matchStatus = true;
      if (filterStatus === 'activos') matchStatus = !isExpired;
      if (filterStatus === 'proximos') matchStatus = isSoon;
      if (filterStatus === 'vencidos') matchStatus = isExpired;

      return matchSearch && matchStatus;
    }).sort((a, b) => new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime());
  };

  const getExpirationStatus = (dateStr: string) => {
    const exp = new Date(dateStr);
    const now = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(now.getMonth() + 1);

    if (exp < now) return { label: 'Vencido', color: 'text-red-600 bg-red-50', icon: <X size={10} /> };
    if (exp <= nextMonth) return { label: 'Próximo', color: 'text-yellow-600 bg-yellow-50', icon: <AlertTriangle size={10} /> };
    return { label: 'Vigente', color: 'text-emerald-600 bg-emerald-50', icon: <CheckCircle2 size={10} /> };
  };

  const selectedContrato = selectedPanel?.contrato_id 
    ? contratos.find(c => c.id === selectedPanel.contrato_id) 
    : null;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setActiveTab('mapa')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'mapa' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
        >
          Mapa de Paneles
        </button>
        <button 
          onClick={() => setActiveTab('vencimientos')}
          className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'vencimientos' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
        >
          Vencimientos
        </button>
      </div>

      {activeTab === 'mapa' ? (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Grid className="text-indigo-600" />
              Estado de Cartelería
            </h2>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest bg-white px-4 py-2 rounded-xl border shadow-sm">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-white border border-slate-300 rounded" /> Libre</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-yellow-400 rounded" /> Reserva</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-500 rounded" /> Vendido</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="grid grid-cols-24 gap-0 overflow-hidden rounded-lg">
              {paneles.map((panel) => {
                if (isHidden(panel.numero_panel)) return null;
                const isSpecial = isOneAndHalf(panel.numero_panel);
                return (
                  <button
                    key={panel.id}
                    onClick={() => handlePanelClick(panel)}
                    style={{ gridColumn: isSpecial ? 'span 3' : 'span 2' }}
                    className={`
                      aspect-square flex flex-col items-center justify-center gap-1 transition-all relative
                      ${getStatusColor(panel.estado)}
                      ${isSpecial ? 'ring-2 ring-indigo-200 ring-inset bg-indigo-50/10' : ''}
                      ${!panel.agrupacion_id ? 'border-[1px]' : ''}
                    `}
                  >
                    <span className={`text-[10px] sm:text-xs font-bold`}>{panel.numero_panel}</span>
                    {getStatusIcon(panel.estado)}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="text-indigo-600" />
              Gestión de Vencimientos
            </h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar cliente..." 
                  className="pl-10 pr-4 py-2 bg-white border rounded-xl outline-none text-sm w-full sm:w-48"
                  value={searchClient}
                  onChange={(e) => setSearchClient(e.target.value)}
                />
              </div>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 bg-white border rounded-xl outline-none text-sm font-bold"
              >
                <option value="todos">Todos los Estados</option>
                <option value="activos">Sólo Activos</option>
                <option value="proximos">Próximos a Vencer</option>
                <option value="vencidos">Vencidos</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <tr>
                    <th className="px-6 py-5">Cliente</th>
                    <th className="px-6 py-5">Panel / Tipo</th>
                    <th className="px-6 py-5">Inicio Contrato</th>
                    <th className="px-6 py-5">Vencimiento</th>
                    <th className="px-6 py-5 text-center">Estado</th>
                    <th className="px-6 py-5 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {getFilteredVencimientos().map(c => {
                    const status = getExpirationStatus(c.fecha_vencimiento);
                    const panel = paneles.find(p => p.id === c.panel_id);
                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{c.cliente}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">Panel #{panel?.numero_panel}</span>
                            <span className="text-[10px] text-slate-400 uppercase font-bold">{c.tipo_panel.replace(/_/g, ' ')}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-500">
                          {new Date(c.fecha_inicio).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-black ${status.label === 'Vencido' ? 'text-red-600' : 'text-slate-900'}`}>
                            {new Date(c.fecha_vencimiento).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${status.color}`}>
                            {status.icon} {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => { setSelectedPanel(panel || null); setViewState('details'); setShowForm(true); }}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          >
                            <Info size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {getFilteredVencimientos().length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-bold italic">
                        No hay contratos que coincidan con la búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {showForm && selectedPanel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-[2rem] w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="px-8 pt-8 pb-4 flex justify-between items-start bg-white rounded-t-[2rem] sticky top-0 z-10">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Panel #{selectedPanel.numero_panel}</h3>
                <p className="text-slate-500 text-sm font-medium">Gestión de Espacio Publicitario</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900"><X size={24} /></button>
            </div>

            <div className="px-8 pb-8 overflow-y-auto custom-scrollbar flex-1">
              {viewState === 'choice' && (
                <div className="space-y-4 pt-4">
                  <button onClick={() => setViewState(selectedContrato ? 'details' : 'sell')} className="w-full p-6 bg-indigo-600 text-white font-bold rounded-2xl flex items-center gap-4 hover:bg-indigo-700 shadow-xl transition-all">
                    <div className="bg-white/20 p-3 rounded-xl"><DollarSign size={24} /></div>
                    <div className="text-left"><p className="text-lg leading-none mb-1">Gestionar</p><p className="text-xs text-indigo-100/80 font-medium">{selectedContrato ? 'Ver Contrato / Registrar Cobro' : 'Realizar Venta o Reserva'}</p></div>
                  </button>
                  {canManage && !selectedContrato && !isOneAndHalf(selectedPanel.numero_panel) && (
                    <button onClick={() => setViewState('associate')} className="w-full p-5 bg-blue-50 text-blue-700 font-bold rounded-2xl flex items-center justify-center gap-3 border border-blue-100 shadow-sm">
                      <LinkIcon size={20} /> Asociar Paneles Adyacentes
                    </button>
                  )}
                  <button onClick={() => setShowForm(false)} className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors">Cancelar</button>
                </div>
              )}

              {viewState === 'details' && selectedContrato && (
                <div className="space-y-6 pt-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="bg-indigo-100 p-2.5 rounded-xl text-indigo-600"><User size={24} /></div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Información Cliente</p>
                        <p className="font-black text-slate-900">{selectedContrato.cliente}</p>
                        <p className="text-xs text-slate-500 font-medium">Inicio: {new Date(selectedContrato.fecha_inicio).toLocaleDateString()}</p>
                        <p className="text-xs text-slate-500 font-medium">Vence: {new Date(selectedContrato.fecha_vencimiento).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="p-6 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-200">
                      <p className="text-[10px] text-indigo-200 font-bold uppercase mb-1">Total a Cobrar</p>
                      <p className="text-4xl font-black tracking-tighter">${selectedContrato.monto_cuota.toLocaleString()}</p>
                      {selectedContrato.cuotas_pagadas < (selectedContrato.modalidad_pago === 'contado' ? 1 : Number(selectedContrato.modalidad_pago)) && (
                        <button onClick={() => { onRegisterPayment(selectedContrato.id, selectedContrato.monto_cuota); setShowForm(false); }} className="mt-4 bg-white text-indigo-600 w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg">Registrar Pago</button>
                      )}
                    </div>
                    <button onClick={() => printContract(selectedContrato)} className="w-full py-5 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest shadow-xl"><Printer size={18} /> Imprimir Contrato</button>
                  </div>
                </div>
              )}

              {viewState === 'sell' && !selectedContrato && (
                <div className="pt-4">
                  <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const mod = formData.get('modalidad') as string;
                        let type: PanelType = isOneAndHalf(selectedPanel.numero_panel) ? '1_5_panel' : '1_panel';
                        const groupPanels = selectedPanel.agrupacion_id ? paneles.filter(p => p.agrupacion_id === selectedPanel.agrupacion_id) : [selectedPanel];
                        if (groupPanels.length === 2) type = '2_paneles';
                        if (groupPanels.length === 3) type = '3_paneles';
                        const config = valores.find(v => v.tipo_panel === type);
                        let total = 0; let cuota = 0;
                        if (config) {
                            if (mod === 'contado') total = config.valor_contado;
                            else if (mod === '1') total = config.valor_1_cuota;
                            else if (mod === '2') total = config.valor_2_cuotas;
                            else if (mod === '3') total = config.valor_3_cuotas;
                            cuota = mod === 'contado' ? total : (total / Number(mod));
                        }
                        
                        // CALCULO DE VENCIMIENTO basado en FECHA DE INICIO seleccionada
                        const startDateVal = formData.get('fecha_inicio') as string;
                        const startDate = new Date(startDateVal);
                        const expirationDate = new Date(startDate);
                        expirationDate.setFullYear(startDate.getFullYear() + 1);

                        onRegisterContract({
                            id: crypto.randomUUID(), año: new Date().getFullYear(),
                            cliente: formData.get('cliente') as string,
                            representante_legal: formData.get('representante') as string,
                            dni_representante: formData.get('dni_rep') as string,
                            telefono: formData.get('telefono') as string,
                            direccion: formData.get('direccion') as string,
                            agente_cobranza_id: formData.get('agente_cobranza') as string,
                            panel_id: selectedPanel.id, tipo_panel: type, modalidad_pago: mod as any,
                            valor_total: total, monto_cuota: cuota, cuotas_pagadas: 0, 
                            created_at: new Date().toISOString(),
                            fecha_inicio: startDate.toISOString(),
                            fecha_vencimiento: expirationDate.toISOString()
                        });
                        setShowForm(false);
                    }}
                    className="space-y-6"
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Cliente *</label>
                      <input name="cliente" required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Fecha de Inicio de Contrato *</label>
                      <input 
                        name="fecha_inicio" 
                        type="date" 
                        required 
                        defaultValue={new Date().toISOString().split('T')[0]} 
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold" 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Modalidad *</label>
                        <select name="modalidad" required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm">
                          <option value="contado">Contado</option>
                          <option value="1">1 Cuota</option>
                          <option value="2">2 Cuotas</option>
                          <option value="3">3 Cuotas</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Cobrador *</label>
                        <select name="agente_cobranza" required className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm">
                          {clubConfig.agentes_cobranza.map(a => (<option key={a.id} value={a.id}>{a.nombre_apellido}</option>))}
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={toggleReservation} className="flex-1 py-5 font-black text-xs uppercase bg-yellow-400 text-yellow-900 rounded-2xl shadow-lg">Reservar</button>
                        <button type="submit" className="flex-1 py-5 bg-indigo-600 text-white font-black text-xs uppercase rounded-2xl shadow-xl">Confirmar Venta</button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicidadPaneles;
