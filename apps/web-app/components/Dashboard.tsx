
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, DollarSign, Wallet, TrendingUp, X, Filter } from 'lucide-react';
import { AccountingMovement } from '../types';
import { MONTHS } from '../constants';

interface DashboardProps {
  membersCount: number;
  movements: AccountingMovement[];
}

const Dashboard: React.FC<DashboardProps> = ({ membersCount, movements }) => {
  const [showFilterModal, setShowFilterModal] = React.useState(false);
  const [filterType, setFilterType] = React.useState<'all' | 'members' | 'advertising'>('all');

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const chartData = MONTHS.map((month, index) => {
    const monthIndex = index + 1;
    const monthMovements = movements.filter(m => {
      const d = new Date(m.date);
      return d.getMonth() + 1 === monthIndex && d.getFullYear() === currentYear && !m.is_annulled;
    });

    return {
      name: month.substring(0, 3),
      income: monthMovements.filter(m => m.type === 'income').reduce((acc, m) => acc + m.amount, 0),
      expense: monthMovements.filter(m => m.type === 'expense').reduce((acc, m) => acc + m.amount, 0),
    };
  });

  const totalIncome = movements.filter(m => m.type === 'income' && !m.is_annulled).reduce((acc, m) => acc + m.amount, 0);
  const totalExpense = movements.filter(m => m.type === 'expense' && !m.is_annulled).reduce((acc, m) => acc + m.amount, 0);
  const balance = totalIncome - totalExpense;

  const currentMonthIncome = movements.filter(m => {
    const d = new Date(m.date);
    return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear && m.type === 'income' && !m.is_annulled;
  });

  const filteredIncome = filterType === 'all'
    ? currentMonthIncome
    : currentMonthIncome.filter(m => m.origin === filterType);

  const totalFiltered = filteredIncome.reduce((acc, m) => acc + m.amount, 0);

  const stats = [
    { label: 'Socios Activos', value: membersCount, icon: Users, color: 'bg-emerald-600', onClick: null },
    { label: 'Ingresos del Mes', value: `$${totalFiltered.toLocaleString()}`, icon: DollarSign, color: 'bg-green-600', onClick: () => setShowFilterModal(true) },
    { label: 'Gastos del Mes', value: `$${(chartData[currentMonth - 1]?.expense || 0).toLocaleString()}`, icon: Wallet, color: 'bg-red-500', onClick: null },
    { label: 'Balance Total', value: `$${balance.toLocaleString()}`, icon: TrendingUp, color: 'bg-teal-600', onClick: null },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <button
            key={i}
            onClick={stat.onClick ? stat.onClick : undefined}
            className={`bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-emerald-100 flex items-center gap-4 text-left transition-all ${stat.onClick ? 'hover:shadow-md hover:border-green-300 cursor-pointer' : ''}`}
          >
            <div className={`${stat.color} p-3 rounded-xl text-white shadow-lg shadow-emerald-900/20`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
                {stat.label} {stat.onClick && <Filter size={10} className="text-emerald-300" />}
              </p>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-emerald-100">
          <h3 className="text-lg font-bold mb-6 text-emerald-900">Ingresos vs Egresos ({currentYear})</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(v) => `$${v}`} />
                <Tooltip />
                <Bar dataKey="income" fill="#047857" radius={[4, 4, 0, 0]} name="Ingresos" />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Egresos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-emerald-100">
          <h3 className="text-lg font-bold mb-6 text-emerald-900">Tendencia de Ingresos</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(v) => `$${v}`} />
                <Tooltip />
                <Line type="monotone" dataKey="income" stroke="#059669" strokeWidth={3} dot={{r: 4}} name="Ingresos" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {showFilterModal && (
        <div className="fixed inset-0 bg-emerald-950/60 backdrop-blur-md flex items-center justify-center z-[70] p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-emerald-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-emerald-900">Filtrar Ingresos - {MONTHS[currentMonth-1]}</h3>
              <button onClick={() => setShowFilterModal(false)} className="p-2 hover:bg-emerald-50 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => setFilterType('all')}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${filterType === 'all' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-100 hover:border-emerald-200'}`}
              >
                <p className="font-bold text-emerald-900">Todos los Ingresos</p>
                <p className="text-sm text-slate-500">Muestra el total recaudado en el mes.</p>
              </button>
              <button
                onClick={() => setFilterType('members')}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${filterType === 'members' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-100 hover:border-emerald-200'}`}
              >
                <p className="font-bold text-emerald-900">Solo Socios</p>
                <p className="text-sm text-slate-500">Muestra solo lo recaudado por cuotas sociales.</p>
              </button>
              <button
                onClick={() => setFilterType('advertising')}
                className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${filterType === 'advertising' ? 'border-emerald-600 bg-emerald-50' : 'border-slate-100 hover:border-emerald-200'}`}
              >
                <p className="font-bold text-emerald-900">Solo Publicidad</p>
                <p className="text-sm text-slate-500">Muestra solo lo recaudado por cartelería.</p>
              </button>
              <button onClick={() => setShowFilterModal(false)} className="w-full py-4 bg-emerald-800 text-white font-bold rounded-2xl mt-4 shadow-lg hover:bg-emerald-900 transition-colors">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
