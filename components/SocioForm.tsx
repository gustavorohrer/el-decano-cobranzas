
import React from 'react';
import { Socio, SocioCategory } from '../types';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';

interface SocioFormProps {
  onSave: (socio: Omit<Socio, 'id' | 'created_at'>) => void;
  onCancel: () => void;
  existingNumbers: string[];
  existingDnis: string[];
}

const SocioForm: React.FC<SocioFormProps> = ({ onSave, onCancel, existingNumbers, existingDnis }) => {
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    const numero = (formData.get('numero_socio') as string).trim();
    const dni = (formData.get('dni') as string).trim();

    if (existingNumbers.includes(numero)) {
      setError(`El número de socio ${numero} ya existe en el sistema.`);
      return;
    }

    if (existingDnis.includes(dni)) {
      setError(`El DNI ${dni} ya se encuentra registrado con otro socio.`);
      return;
    }

    onSave({
      numero_socio: numero,
      nombre: formData.get('nombre') as string,
      apellido: formData.get('apellido') as string,
      dni: dni,
      telefono: formData.get('telefono') as string,
      direccion: formData.get('direccion') as string,
      categoria: formData.get('categoria') as SocioCategory,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onCancel} className="text-emerald-700 hover:text-emerald-900 flex items-center gap-2 font-black uppercase tracking-widest text-xs transition-colors">
          <ArrowLeft size={18} />
          Volver al listado
        </button>
        <h2 className="text-2xl font-black text-emerald-950 flex items-center gap-2">
          <UserPlus className="text-emerald-700" />
          Nuevo Socio
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-md rounded-3xl border border-emerald-100 shadow-2xl p-8 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold border border-red-100 animate-in fade-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="block text-xs font-black text-emerald-900 uppercase tracking-widest">Número de Socio *</label>
            <input 
              name="numero_socio" 
              type="text" 
              required 
              className="w-full px-4 py-3.5 rounded-2xl border border-emerald-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
              placeholder="Ej: 1050"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-black text-emerald-900 uppercase tracking-widest">DNI *</label>
            <input 
              name="dni" 
              type="text" 
              required 
              className="w-full px-4 py-3.5 rounded-2xl border border-emerald-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
              placeholder="Ej: 35.123.456"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-black text-emerald-900 uppercase tracking-widest">Nombre *</label>
            <input 
              name="nombre" 
              type="text" 
              required 
              className="w-full px-4 py-3.5 rounded-2xl border border-emerald-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
              placeholder="Juan"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-black text-emerald-900 uppercase tracking-widest">Apellido *</label>
            <input 
              name="apellido" 
              type="text" 
              required 
              className="w-full px-4 py-3.5 rounded-2xl border border-emerald-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
              placeholder="Pérez"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-black text-emerald-900 uppercase tracking-widest">Teléfono</label>
            <input 
              name="telefono" 
              type="tel" 
              className="w-full px-4 py-3.5 rounded-2xl border border-emerald-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
              placeholder="Ej: 11 1234 5678"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="block text-xs font-black text-emerald-900 uppercase tracking-widest">Dirección</label>
            <input 
              name="direccion" 
              type="text" 
              className="w-full px-4 py-3.5 rounded-2xl border border-emerald-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
              placeholder="Ej: Av. Rivadavia 1234, CABA"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="block text-xs font-black text-emerald-900 uppercase tracking-widest">Situación (Categoría) *</label>
            <select 
              name="categoria" 
              required 
              className="w-full px-4 py-3.5 rounded-2xl border border-emerald-50 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all bg-white shadow-sm font-bold text-emerald-950"
            >
              <option value="general">Socio General</option>
              <option value="grupo_familiar">Grupo Familiar</option>
            </select>
          </div>
        </div>

        <div className="pt-6 flex gap-4">
          <button 
            type="button" 
            onClick={onCancel}
            className="flex-1 py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-xs bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="flex-1 py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-xs bg-emerald-700 text-white hover:bg-emerald-800 shadow-xl shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
          >
            <Save size={18} />
            Guardar Socio
          </button>
        </div>
      </form>
    </div>
  );
};

export default SocioForm;
