
import React, { useEffect, useState } from 'react';
import { AppEvent, EventStatus } from '../types';
import { FirebaseService } from '../firebase';
import { 
  TrendingUp, 
  Users, 
  CalendarDays, 
  DollarSign,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

interface DashboardProps {
  onNavigate: (view: any, id?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    FirebaseService.getEvents().then(data => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  const stats = {
    totalEvents: events.length,
    paxTotal: events.reduce((sum, e) => sum + e.pax, 0),
    totalRevenue: events.reduce((sum, e) => sum + (e.realRevenue || e.plannedPrice), 0),
    profitability: events.length > 0 
      ? (events.filter(e => e.status === EventStatus.CLOSED).reduce((sum, e) => sum + (e.realRevenue! - e.realCost!), 0) / 
         events.filter(e => e.status === EventStatus.CLOSED).reduce((sum, e) => sum + e.realRevenue!, 1) * 100).toFixed(1)
      : 0
  };

  const recentEvents = events.slice(0, 5).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const chartData = [
    { name: 'Jan', revenue: 4000, profit: 2400 },
    { name: 'Fev', revenue: 3000, profit: 1398 },
    { name: 'Mar', revenue: 2000, profit: 9800 },
    { name: 'Abr', revenue: 2780, profit: 3908 },
    { name: 'Mai', revenue: 1890, profit: 4800 },
    { name: 'Jun', revenue: 2390, profit: 3800 },
  ];

  if (loading) return <div className="animate-pulse">Carregando dados...</div>;

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Eventos Totais', value: stats.totalEvents, icon: CalendarDays, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pessoas Atendidas', value: stats.paxTotal, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Receita Prevista', value: `R$ ${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Margem Média', value: `${stats.profitability}%`, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-50' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
            <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
              <stat.icon size={20} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Desempenho de Vendas</h3>
            <select className="text-sm border-none bg-slate-100 rounded-lg px-2 py-1 outline-none">
              <option>Últimos 6 meses</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Próximos Eventos</h3>
            <button onClick={() => onNavigate('events')} className="text-indigo-600 text-xs font-semibold flex items-center gap-1 hover:underline">
              Ver todos <ChevronRight size={14} />
            </button>
          </div>
          <div className="space-y-4">
            {recentEvents.length > 0 ? recentEvents.map((event) => (
              <div 
                key={event.id} 
                onClick={() => onNavigate('edit-event', event.id)}
                className="group cursor-pointer flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex flex-col items-center justify-center text-[10px] font-bold leading-none">
                    <span className="text-slate-500 uppercase">{new Date(event.date).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span>
                    <span className="text-lg text-slate-800">{new Date(event.date).getDate() + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 truncate max-w-[120px]">{event.clientName}</p>
                    <p className="text-xs text-slate-500">{event.pax} pessoas</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">R$ {event.plannedPrice.toLocaleString()}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    event.status === EventStatus.CONFIRMED ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {event.status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="text-center py-10">
                <p className="text-sm text-slate-400">Nenhum evento agendado</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
