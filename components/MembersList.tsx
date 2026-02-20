
import React from 'react';
import { Search, Plus, Phone, MapPin, ChevronRight, UserCircle, Upload } from 'lucide-react';
import { Member } from '../types';
import ImportMembersModal from './ImportMembersModal';

interface MembersListProps {
  members: Member[];
  onAdd: () => void;
  onSelect: (member: Member) => void;
  onRefresh: () => void;
}

const MembersList: React.FC<MembersListProps> = ({ members, onAdd, onSelect, onRefresh }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);

  const filteredMembers = members.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.member_number.includes(searchTerm)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-2xl font-bold text-emerald-900">Gestión de Socios</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="bg-white border-2 border-emerald-100 text-emerald-700 px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-emerald-50 transition-all shadow-sm font-bold"
          >
            <Upload size={20} />
            Importar Excel
          </button>
          <button
            onClick={onAdd}
            className="bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/20 font-bold"
          >
            <Plus size={20} />
            Nuevo Socio
          </button>
        </div>
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
        {filteredMembers.map((member) => (
          <button
            key={member.id}
            onClick={() => onSelect(member)}
            className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-emerald-50 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all text-left flex items-start gap-4 group"
          >
            <div className="bg-emerald-50 p-3 rounded-full text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
              <UserCircle size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full mb-1 uppercase tracking-tighter">
                  N° {member.member_number}
                </p>
                <ChevronRight size={16} className="text-emerald-200 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-bold text-slate-900 truncate">{member.first_name} {member.last_name}</h3>
              <div className="mt-2 space-y-1">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Phone size={14} className="text-emerald-400" />
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin size={14} className="text-emerald-400" />
                  <span className="truncate">{member.address}</span>
                </div>
              </div>
              <div className="mt-3 text-[10px] font-black text-emerald-800/40 uppercase tracking-widest border-t border-emerald-50 pt-2">
                Categoría: {member.category === 'family_group' ? 'Grupo Familiar' : 'General'}
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="bg-white/60 p-12 text-center rounded-3xl border-2 border-dashed border-emerald-200">
          <p className="text-emerald-800 font-medium">No se encontraron socios que coincidan con la búsqueda.</p>
        </div>
      )}

      <ImportMembersModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        existingMembers={members}
        onImportComplete={onRefresh}
      />
    </div>
  );
};

export default MembersList;
