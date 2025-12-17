
import React, { useEffect, useState } from 'react';
import { AppEvent, EventStatus } from '../../types';
import { FirebaseService } from '../../firebase';
import { FileSpreadsheet, Download, Filter, BarChart2 } from 'lucide-react';

export const ReportView: React.FC = () => {
  const [events, setEvents] = useState<AppEvent[]>([]);

  useEffect(() => {
    FirebaseService.getEvents().then(setEvents);
  }, []);

  const handleExportExcel = () => {
    // In a real app, use the 'xlsx' library here
    alert('Exportando relatório geral para Excel (.xlsx)...');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Relatórios Gerenciais</h2>
          <p className="text-slate-500 text-sm">Analise rentabilidade e consumo histórico.</p>
        </div>
        <button 
          onClick={handleExportExcel}
          className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20"
        >
          <FileSpreadsheet size={18} /> Exportar Excel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Faturado', value: `R$ ${events.reduce((s, e) => s + (e.realRevenue || e.plannedPrice), 0).toLocaleString()}`, icon: Download },
          { label: 'Lucro Real Acumulado', value: `R$ ${events.reduce((s, e) => s + ((e.realRevenue || 0) - (e.realCost || 0)), 0).toLocaleString()}`, icon: BarChart2 },
          { label: 'Média Pessoas/Evento', value: (events.reduce((s, e) => s + e.pax, 0) / (events.length || 1)).toFixed(0), icon: Filter },
        ].map((c, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{c.label}</p>
            <h4 className="text-2xl font-bold mt-2">{c.value}</h4>
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="font-bold text-slate-800">Detalhamento Financeiro (Real vs Previsto)</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Evento</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Lucro Previsto</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Lucro Real</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Variação</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {events.map(e => {
              const plannedProfit = e.plannedPrice - e.plannedCost;
              const realProfit = e.status === EventStatus.CLOSED ? (e.realRevenue! - e.realCost!) : null;
              const diff = realProfit !== null ? realProfit - plannedProfit : null;

              return (
                <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{e.clientName}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] px-2 py-0.5 bg-slate-100 rounded-full font-bold uppercase">{e.status}</span>
                  </td>
                  <td className="px-6 py-4 text-sm">R$ {plannedProfit.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm font-bold">
                    {realProfit !== null ? `R$ ${realProfit.toLocaleString()}` : '---'}
                  </td>
                  <td className={`px-6 py-4 text-sm font-bold ${diff !== null ? (diff >= 0 ? 'text-emerald-600' : 'text-rose-600') : 'text-slate-400'}`}>
                    {diff !== null ? `${diff >= 0 ? '+' : ''} R$ ${diff.toLocaleString()}` : '---'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
