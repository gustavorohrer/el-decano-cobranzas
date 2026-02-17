
import React from 'react';
import { User, Lock, LogIn, AlertCircle } from 'lucide-react';
import { StorageService } from '../services/storage';
import { User as UserType } from '../types';

interface LoginProps {
  onLogin: (user: UserType) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const data = StorageService.getData();
    const user = data.users.find(u => u.email === email && u.password === password);

    if (user) {
      if (user.active) {
        StorageService.setCurrentUser(user);
        onLogin(user);
      } else {
        setError('Tu cuenta ha sido desactivada. Contacta al administrador.');
      }
    } else {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-slate-50 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/50 rounded-full -mr-20 -mt-20 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/50 rounded-full -ml-20 -mb-20 blur-3xl" />

      <div className="w-full max-w-md relative animate-in fade-in zoom-in duration-500">
        <div className="bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-[3rem] p-10 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-black text-emerald-950 tracking-tighter">EL DECANO</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Portal de Gestión de Cobranzas</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-3 animate-in slide-in-from-top-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Email de Acceso</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold"
                  placeholder="ejemplo@club.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-5 bg-emerald-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-950/20 hover:bg-emerald-950 transition-all hover:-translate-y-1 flex items-center justify-center gap-3 active:translate-y-0"
            >
              <LogIn size={18} />
              Ingresar al Sistema
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Club 1° de Mayo - Chajarí, E.R.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
