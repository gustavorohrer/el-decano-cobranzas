
import React from 'react';
import { Search, Plus, Phone, MapPin, ChevronRight, UserCircle } from 'lucide-react';
import { Member } from '../types';

interface MembersListProps {
  socios: Member[];
  onAdd: () => void;
  onSelect: (socio: Member) => void;
}

const MembersList: React.FC<MembersListProps> = ({ socios, onAdd, onSelect }) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredSocios = socios.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.member_number.includes(searchTerm)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-2xl font-bold text-emerald-900">Gestión de Socios</h2>
        <button
          onClick={onAdd}
          className="bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/20 font-bold"
        >
          <Plus size={20} />
          Nuevo Socio
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre o número de socio..."
          className="w-full pl-12 pr-4 py-3.5 bg-white/80 backdrop-blur-sm border border-emerald-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSocios.map((socio) => (
          <button
            key={socio.id}
            onClick={() => onSelect(socio)}
            className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-emerald-50 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-left flex items-start gap-4 group"
          >
            <div className="bg-emerald-50 p-3 rounded-full text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
              <UserCircle size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mb-1 uppercase tracking-tighter">
                  N° {socio.member_number}
                </p>
                <ChevronRight size={16} className="text-emerald-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-slate-900 truncate">{socio.first_name} {socio.last_name}</h3>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Phone size={14} className="text-emerald-400" />
                  <span>{socio.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin size={14} className="text-emerald-400" />
                  <span className="truncate">{socio.address}</span>
                </div>
              </div>
              <div className="mt-3 text-[10px] font-black text-emerald-800/40 uppercase tracking-widest border-t border-emerald-50 pt-2">
                Categoría: {socio.category === 'grupo_familiar' ? 'Grupo Familiar' : 'General'}
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredSocios.length === 0 && (
        <div className="bg-white/60 p-12 text-center rounded-3xl border-2 border-dashed border-emerald-200">
          <p className="text-emerald-800 font-medium">No se encontraron socios que coincidan con la búsqueda.</p>
        </div>
      )}
    </div>
  );
};

export default MembersList;
