
import React from 'react';
import { Home, Users, LayoutGrid, BarChart3, Settings, Menu, X, LogOut, Wallet } from 'lucide-react';
import { UserRole } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: UserRole;
  onLogout: () => void;
  isOffline: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, userRole, onLogout, isOffline }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, roles: [UserRole.ADMIN_GENERAL, UserRole.TESORERO, UserRole.PRESIDENTE, UserRole.COBRADOR] },
    { id: 'members', label: 'Socios', icon: Users, roles: [UserRole.ADMIN_GENERAL, UserRole.TESORERO, UserRole.PRESIDENTE, UserRole.COBRADOR] },
    { id: 'publicidad', label: 'Publicidad', icon: LayoutGrid, roles: [UserRole.ADMIN_GENERAL, UserRole.TESORERO, UserRole.PRESIDENTE, UserRole.COBRADOR] },
    { id: 'contabilidad', label: 'Contabilidad', icon: Wallet, roles: [UserRole.ADMIN_GENERAL, UserRole.TESORERO, UserRole.PRESIDENTE] },
    { id: 'reportes', label: 'Reportes', icon: BarChart3, roles: [UserRole.ADMIN_GENERAL, UserRole.TESORERO, UserRole.PRESIDENTE] },
    { id: 'admin', label: 'Administración', icon: Settings, roles: [UserRole.ADMIN_GENERAL, UserRole.TESORERO] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden bg-emerald-950 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold tracking-tight">El Decano</h1>
        </div>
        <div className="flex items-center gap-4">
          {isOffline && <span className="bg-orange-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Offline</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1">
            {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-0 z-40 bg-emerald-950 text-emerald-100 transform transition-transform duration-300 ease-out md:relative md:translate-x-0 md:w-64 flex flex-col shadow-2xl
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 text-center border-b border-emerald-900/50">
          <h1 className="text-2xl font-black text-white tracking-tighter">C.D. 1° de Mayo</h1>
          <p className="text-[10px] text-emerald-400 mt-1 uppercase tracking-widest font-black opacity-80">Sistema de Gestión</p>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar">
          {filteredMenu.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`
                w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300
                ${activeTab === item.id 
                  ? 'bg-emerald-700 text-white shadow-xl shadow-emerald-900/60 font-bold translate-x-1' 
                  : 'hover:bg-emerald-900/40 hover:text-white text-emerald-200/70'}
              `}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-emerald-300' : 'opacity-60'} />
              <span className="text-sm tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-emerald-900/80 bg-emerald-950/50 backdrop-blur-sm">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-emerald-400/80 hover:text-white hover:bg-red-900/20 rounded-xl transition-all duration-300"
          >
            <LogOut size={18} />
            <span className="text-sm font-bold">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-y-auto relative bg-transparent z-10">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-emerald-950/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
