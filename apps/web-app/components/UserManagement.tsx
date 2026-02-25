
import React from 'react';
import { User, UserRole } from '../types';
import { Shield, Plus, Trash2, Key, Mail, CheckCircle, XCircle, X, ArrowLeft } from 'lucide-react';
import { StorageService } from '../services/storage';

interface UserManagementProps {
  onRefresh: () => void;
  onBack: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onRefresh, onBack }) => {
  const [showAddForm, setShowAddForm] = React.useState(false);
  const users = StorageService.getData().users;

  const handleAddUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newUser: User = {
      id: crypto.randomUUID(),
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      role: formData.get('role') as UserRole,
      active: true,
    };
    StorageService.addUser(newUser);
    onRefresh();
    setShowAddForm(false);
  };

  const toggleUserStatus = (id: string, current: boolean) => {
    StorageService.updateUser(id, { active: !current });
    onRefresh();
  };

  const handleDeleteUser = (id: string, role: UserRole) => {
    if (role === UserRole.ADMIN_GENERAL) {
      alert("No se puede eliminar al administrador general.");
      return;
    }
    if (confirm("¿Estás seguro de eliminar este usuario?")) {
      StorageService.deleteUser(id);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <button 
          onClick={onBack} 
          className="text-indigo-700 font-bold flex items-center gap-1 hover:text-indigo-900 transition-colors w-fit"
        >
          <ArrowLeft size={18} /> Volver a Administración
        </button>
        
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="text-indigo-600" />
            Gestión de Usuarios
          </h2>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold shadow-lg hover:bg-indigo-700 transition-all"
          >
            <Plus size={20} /> Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <tr>
                <th className="px-6 py-5">Usuario / Email</th>
                <th className="px-6 py-5">Rol Asignado</th>
                <th className="px-6 py-5 text-center">Estado</th>
                <th className="px-6 py-5 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                        <Mail size={16} />
                      </div>
                      <span className="font-bold text-slate-900">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
                      {u.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => toggleUserStatus(u.id, u.active)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                        u.active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {u.active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {u.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleDeleteUser(u.id, u.role)}
                      className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Eliminar usuario"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowAddForm(false)} />
          <div className="relative bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-900">Crear Cuenta</h3>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
                <input name="email" type="email" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contraseña</label>
                <div className="relative">
                  <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input name="password" type="text" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Rol / Permisos</label>
                <select name="role" required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm">
                  <option value={UserRole.ADMIN_GENERAL}>Admin General</option>
                  <option value={UserRole.TESORERO}>Tesorero</option>
                  <option value={UserRole.PRESIDENTE}>Presidente</option>
                  <option value={UserRole.COBRADOR}>Cobrador</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all"
              >
                Crear Usuario
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
