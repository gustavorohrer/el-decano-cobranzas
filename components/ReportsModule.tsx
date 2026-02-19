
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import {
  FileText, Download, TrendingUp, TrendingDown,
  PieChart as PieIcon, BarChart3, Filter, Calendar, X, Search, ArrowUpDown, ChevronDown, ListFilter, Trash2
} from 'lucide-react';
import { AccountingMovement, Member, AdvertisingContract } from '../types';
import { MONTHS } from '../constants';
import * as XLSX from 'xlsx';

interface ReportsModuleProps {
  movimientos: AccountingMovement[];
  socios: Member[];
  contratos: AdvertisingContract[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const ReportsModule: React.FC<ReportsModuleProps> = ({ movimientos, socios, contratos }) => {
  // Filtros de Estado
  const [filterGroup, setFilterGroup] = React.useState<'all' | 'socios' | 'publicidad'>('all');
  const [filterType, setFilterType] = React.useState<'all' | 'ingreso' | 'egreso'>('all');
  const [filterCategory, setFilterCategory] = React.useState<string>('all');
  const [startDate, setStartDate] = React.useState<string>('');
  const [endDate, setEndDate] = React.useState<string>('');
  const [showFilters, setShowFilters] = React.useState(true);

  // Obtener categorías disponibles basadas en el grupo
  const getCategories = () => {
    if (filterGroup === 'socios') {
      return [
        { id: 'cuotas_socios', label: 'Cuotas Socios (Ingreso)' },
        { id: 'libreria', label: 'Librería (Egreso)' },
        { id: 'materiales', label: 'Materiales (Egreso)' },
        { id: 'comisiones_socios', label: 'Comisiones Socios (Egreso)' },
        { id: 'cierre_caja', label: 'Cierre de Caja (Egreso)' },
        { id: 'otros', label: 'Otros (Egreso)' }
      ];
    } else if (filterGroup === 'publicidad') {
      return [
        { id: 'publicidad', label: 'Publicidad (Ingreso)' },
        { id: 'pintado_cartel', label: 'Pintado Cartel (Egreso)' },
        { id: 'blanqueo_cartel', label: 'Blanqueo Cartel (Egreso)' },
        { id: 'pintura', label: 'Pintura (Egreso)' },
        { id: 'comisiones_carteleria', label: 'Comisiones Cartelería (Egreso)' },
        { id: 'cierre_caja', label: 'Cierre de Caja (Egreso)' },
        { id: 'otros', label: 'Otros (Egreso)' }
      ];
    }
    return []; // Para TOTAL no mostramos categorías específicas por ahora o sumamos todas
  };

  // Lógica de Filtrado de Datos
  const filteredMovimientos = movimientos.filter(m => {
    if (m.anulado) return false;

    // Filtro por Grupo
    if (filterGroup !== 'all') {
      const isSocioRelated = m.origen === 'socios' || m.grupo_egreso === 'socios';
      const isPublicidadRelated = m.origen === 'publicidad' || m.grupo_egreso === 'publicidad';
      if (filterGroup === 'socios' && !isSocioRelated) return false;
      if (filterGroup === 'publicidad' && !isPublicidadRelated) return false;
    }

    // Filtro por Tipo (Ingreso/Egreso)
    if (filterType !== 'all' && m.tipo !== filterType) return false;

    // Filtro por Categoría Específica
    if (filterCategory !== 'all' && m.categoria_id !== filterCategory) return false;

    // Filtro por Fecha
    const mDate = new Date(m.fecha).getTime();
    if (startDate && mDate < new Date(startDate).getTime()) return false;
    if (endDate && mDate > new Date(endDate).setHours(23, 59, 59, 999)) return false;

    return true;
  });

  // Totales Filtrados
  const totalIngresos = filteredMovimientos.filter(m => m.tipo === 'ingreso').reduce((acc, m) => acc + m.monto, 0);
  const totalEgresos = filteredMovimientos.filter(m => m.tipo === 'egreso').reduce((acc, m) => acc + m.monto, 0);
  const balance = totalIngresos - totalEgresos;

  // Datos para Gráfico de Área (Evolución)
  const areaChartData = MONTHS.map((month, index) => {
    const mesIndex = index + 1;
    const year = new Date().getFullYear(); // Simplificado al año actual o al año del startDate si existe
    const mesMovs = filteredMovimientos.filter(m => {
      const d = new Date(m.fecha);
      return d.getMonth() + 1 === mesIndex;
    });
    return {
      name: month.substring(0, 3),
      ingresos: mesMovs.filter(m => m.tipo === 'ingreso').reduce((acc, m) => acc + m.monto, 0),
      egresos: mesMovs.filter(m => m.tipo === 'egreso').reduce((acc, m) => acc + m.monto, 0),
    };
  });

  const resetFilters = () => {
    setFilterGroup('all');
    setFilterType('all');
    setFilterCategory('all');
    setStartDate('');
    setEndDate('');
  };

  const exportToExcel = () => {
    const data = filteredMovimientos.map(m => ({
      Fecha: new Date(m.fecha).toLocaleDateString(),
      Tipo: m.tipo.toUpperCase(),
      Grupo: m.grupo_egreso || m.origen || 'N/A',
      Categoría: m.categoria_id.replace(/_/g, ' '),
      Descripción: m.descripcion,
      Monto: m.monto,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte Filtrado");
    XLSX.writeFile(wb, `Reporte_Club_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
              <BarChart3 size={24} />
            </div>
            Reportes Avanzados
          </h2>
          <p className="text-slate-500 font-medium">Filtros dinámicos y análisis de movimientos</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 font-bold text-sm ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'}`}
          >
            <Filter size={18} />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
          <button
            onClick={exportToExcel}
            className="bg-slate-900 text-white px-5 py-3 rounded-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all"
          >
            <Download size={18} /> Exportar Selección
          </button>
        </div>
      </div>

      {/* Panel de Filtros */}
      {showFilters && (
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Grupo Principal */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Grupo Principal</label>
              <select
                value={filterGroup}
                onChange={(e) => {
                  setFilterGroup(e.target.value as any);
                  setFilterCategory('all'); // Reset categoria al cambiar grupo
                }}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-sm"
              >
                <option value="all">TOTAL (Consolidado)</option>
                <option value="socios">Socios</option>
                <option value="publicidad">Publicidad</option>
              </select>
            </div>

            {/* Tipo de Movimiento */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tipo Movimiento</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-sm"
              >
                <option value="all">Ingresos y Egresos</option>
                <option value="ingreso">Solo Ingresos</option>
                <option value="egreso">Solo Egresos</option>
              </select>
            </div>

            {/* Categoría Dinámica */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Categoría Específica</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                disabled={filterGroup === 'all'}
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-sm disabled:opacity-40"
              >
                <option value="all">Todas las Categorías</option>
                {getCategories().map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Rango de Fechas */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Rango de Fecha</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={resetFilters}
              className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2 hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
            >
              <Trash2 size={14} /> Limpiar Filtros
            </button>
          </div>
        </div>
      )}

      {/* Cards Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
             <TrendingUp size={120} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Ingresos Filtrados</p>
          <h3 className="text-4xl font-black text-emerald-600 tracking-tighter">${totalIngresos.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
             <TrendingDown size={120} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Egresos Filtrados</p>
          <h3 className="text-4xl font-black text-red-600 tracking-tighter">${totalEgresos.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden group bg-slate-50/50">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
             <ArrowUpDown size={120} />
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Balance del Filtro</p>
          <h3 className={`text-4xl font-black tracking-tighter ${balance >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
            ${balance.toLocaleString()}
          </h3>
        </div>
      </div>

      {/* Gráfico de Evolución */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-2">
          <TrendingUp className="text-indigo-600" size={20} />
          Flujo de Movimientos por Mes
        </h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaChartData}>
              <defs>
                <linearGradient id="colorIng" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEgr" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#94a3b8'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} tickFormatter={(v) => `$${v/1000}k`} />
              <Tooltip
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="ingresos" stroke="#10b981" strokeWidth={4} fill="url(#colorIng)" name="Ingresos" />
              <Area type="monotone" dataKey="egresos" stroke="#ef4444" strokeWidth={4} fill="url(#colorEgr)" name="Egresos" />
              <Legend verticalAlign="top" align="right" iconType="circle" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla Detallada */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-lg font-black text-slate-900">Auditoría de Movimientos</h3>
          <span className="text-[10px] font-black uppercase text-slate-400">Mostrando {filteredMovimientos.length} resultados</span>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-5">Fecha</th>
                  <th className="px-6 py-5">Grupo</th>
                  <th className="px-6 py-5">Categoría</th>
                  <th className="px-6 py-5">Descripción</th>
                  <th className="px-6 py-5 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredMovimientos.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">
                      {new Date(m.fecha).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                        (m.origen === 'socios' || m.grupo_egreso === 'socios') ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'
                      }`}>
                        {m.grupo_egreso || m.origen}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-xs font-bold text-slate-700 capitalize">
                         {m.categoria_id.replace(/_/g, ' ')}
                       </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                      {m.descripcion}
                    </td>
                    <td className={`px-6 py-4 text-right font-black ${m.tipo === 'ingreso' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {m.tipo === 'ingreso' ? '+' : '-'} ${m.monto.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {filteredMovimientos.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-bold">
                      No se encontraron movimientos para los filtros seleccionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsModule;
