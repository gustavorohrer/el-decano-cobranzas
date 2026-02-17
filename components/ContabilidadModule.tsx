
import React from 'react';
import { MovimientoContable, UserRole, Socio } from '../types';
import { ArrowUpCircle, ArrowDownCircle, Plus, Edit2, Trash2, X, Info, Users, LayoutGrid, Eye, EyeOff } from 'lucide-react';
import { StorageService } from '../services/storage';
import ConfirmationModal from './ConfirmationModal';

interface ContabilidadModuleProps {
  movimientos: MovimientoContable[];
  socios?: Socio[];
  userRole?: UserRole;
  onAddEgreso: () => void;
  onRefresh: () => void;
}

const ContabilidadModule: React.FC<ContabilidadModuleProps> = ({ movimientos, socios = [], userRole, onAddEgreso, onRefresh }) => {
  const [editingMov, setEditingMov] = React.useState<MovimientoContable | null>(null);
  const [editGrupo, setEditGrupo] = React.useState<'socios' | 'publicidad'>('socios');
  const [movToDelete, setMovToDelete] = React.useState<string | null>(null);
  const [showDetailed, setShowDetailed] = React.useState(false);
  
  const isAdmin = userRole === UserRole.ADMIN_GENERAL;
  const ingresos = movimientos.filter(m => m.tipo === 'ingreso' && !m.anulado).reduce((acc, m) => acc + m.monto, 0);
  const egresos = movimientos.filter(m => m.tipo === 'egreso' && !m.anulado).reduce((acc, m) => acc + m.monto, 0);
  const balance = ingresos - egresos;

  const processMovimientos = () => {
    if (showDetailed) {
      return movimientos
        .filter(m => !m.anulado)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
    }

    const processed: (MovimientoContable & { count?: number; isGrouped?: boolean })[] = [];
    const socioGroups: Record<string, { total: number; count: number; ids: string[]; fecha: string }> = {};

    movimientos.forEach(m => {
      if (m.anulado) return;

      if (m.origen === 'socios' && m.tipo === 'ingreso') {
        const dateKey = new Date(m.fecha).toLocaleDateString();
        if (!socioGroups[dateKey]) {
          socioGroups[dateKey] = { total: 0, count: 0, ids: [], fecha: m.fecha };
        }
        socioGroups[dateKey].total += m.monto;
        socioGroups[dateKey].count += 1;
        socioGroups[dateKey].ids.push(m.id);
      } else {
        processed.push({ ...m });
      }
    });

    Object.entries(socioGroups).forEach(([dateKey, data]) => {
      processed.push({
        id: `group-socios-${dateKey}`,
        fecha: data.fecha,
        tipo: 'ingreso',
        categoria_id: 'cuotas_socios',
        descripcion: `Resumen Cobro Cuotas Socios (${data.count} pagos)`,
        monto: data.total,
        origen: 'socios',
        anulado: false,
        usuario_registro: 'system',
        count: data.count,
        isGrouped: true
      });
    });

    return processed.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  };

  const displayMovs = processMovimientos();

  const handleDelete = () => {
    if (movToDelete) {
      StorageService.deleteMovimiento(movToDelete);
      setMovToDelete(null);
      onRefresh();
    }
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingMov) return;
    const formData = new FormData(e.currentTarget);
    StorageService.updateMovimiento(editingMov.id, {
      descripcion: formData.get('descripcion') as string,
      monto: Number(formData.get('monto')),
      categoria_id: formData.get('categoria') as string,
      grupo_egreso: editGrupo
    });
    setEditingMov(null);
    onRefresh();
  };

  const startEdit = (m: MovimientoContable) => {
    setEditingMov(m);
    setEditGrupo(m.grupo_egreso || (m.origen === 'socios' ? 'socios' : 'publicidad'));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Módulo Contable</h2>
          <p className="text-sm text-slate-500">Gestión de ingresos y egresos del club.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowDetailed(!showDetailed)}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all border-2 ${showDetailed ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200'}`}
          >
            {showDetailed ? <EyeOff size={18} /> : <Eye size={18} />}
            {showDetailed ? 'Vista Resumida' : 'Vista Detallada'}
          </button>
          <button 
            onClick={onAddEgreso}
            className="bg-red-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-red-700 transition-colors shadow-lg font-bold"
          >
            <Plus size={20} />
            Registrar Egreso
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Total Ingresos</p>
          <h4 className="text-2xl font-black text-emerald-600">${ingresos.toLocaleString()}</h4>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Total Egresos</p>
          <h4 className="text-2xl font-black text-red-600">${egresos.toLocaleString()}</h4>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Balance Neto</p>
          <h4 className="text-2xl font-black text-indigo-600">${balance.toLocaleString()}</h4>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          <Info size={14} className="text-indigo-500" />
          <span>{showDetailed ? "Modo Auditoría: Acciones individuales habilitadas para administradores." : "Modo Resumido: Los cobros de socios se agrupan por día."}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider font-black">
              <tr>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4">Origen / Tipo</th>
                <th className="px-6 py-4">Descripción / Categoría</th>
                <th className="px-6 py-4 text-right">Monto</th>
                <th className="px-6 py-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayMovs.map((m) => (
                <tr key={m.id} className={`hover:bg-slate-50 transition-colors ${m.isGrouped ? 'bg-indigo-50/10' : ''}`}>
                  <td className="px-6 py-4 text-sm whitespace-nowrap font-medium">
                    {new Date(m.fecha).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${m.tipo === 'ingreso' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {m.tipo === 'ingreso' ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
                        {m.tipo === 'ingreso' ? 'Ingreso' : 'Egreso'}
                      </span>
                      <span className={`text-[8px] font-black uppercase flex items-center gap-1 px-2 py-0.5 rounded-full w-fit ${m.origen === 'socios' || m.grupo_egreso === 'socios' ? 'bg-emerald-50 text-emerald-700' : 'bg-indigo-50 text-indigo-700'}`}>
                        {m.origen === 'socios' || m.grupo_egreso === 'socios' ? <Users size={10} /> : <LayoutGrid size={10} />}
                        {m.grupo_egreso || m.origen}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div className="flex flex-col">
                      <span className={m.isGrouped ? 'font-bold text-slate-900' : 'text-slate-900 font-medium'}>
                        {m.descripcion}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                        Cat: {m.categoria_id.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-sm font-black text-right ${m.tipo === 'ingreso' ? 'text-emerald-600' : 'text-red-600'}`}>
                    ${m.monto.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-1">
                      {isAdmin && !m.isGrouped && (
                        <>
                          <button 
                            onClick={() => startEdit(m)} 
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Editar monto/descripción"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => setMovToDelete(m.id)} 
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Borrar registro y revertir estado"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                      {m.isGrouped && (
                         <button 
                          onClick={() => setShowDetailed(true)}
                          className="text-[8px] font-black text-indigo-600 uppercase hover:underline"
                         >
                           Ver Detalle
                         </button>
                      )}
                      {!isAdmin && !m.isGrouped && m.origen === 'manual' && (
                         <button 
                         onClick={() => setMovToDelete(m.id)} 
                         className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                       >
                         <Trash2 size={16} />
                       </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={!!movToDelete}
        title="Eliminar Registro"
        message="¿Está seguro de eliminar este registro? Si es un pago de socio, el mes volverá a estar pendiente. Si es cartelería, se descontará la cuota pagada del contrato."
        confirmLabel="Sí, Eliminar"
        onConfirm={handleDelete}
        onCancel={() => setMovToDelete(null)}
        type="danger"
      />

      {editingMov && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black">Editar Movimiento</h3>
              <button onClick={() => setEditingMov(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24} className="text-slate-400" /></button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 mb-2">Monto ($)</label>
                <input name="monto" type="number" step="0.01" required defaultValue={editingMov.monto} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-500/10 font-black text-lg" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 mb-2">Descripción</label>
                <textarea name="descripcion" required defaultValue={editingMov.descripcion} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-slate-500/10" rows={3}></textarea>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditingMov(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold uppercase tracking-widest text-xs">Cancelar</button>
                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-200">Actualizar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContabilidadModule;
