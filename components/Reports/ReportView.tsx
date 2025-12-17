
import React, { useEffect, useState, useMemo } from 'react';
import { AppEvent, Product, ExtraCost } from '../../types';
import { ApiService } from '../../api';
import { 
  FileSpreadsheet, 
  Download, 
  TrendingUp, 
  ArrowDownCircle, 
  ArrowUpCircle,
  BarChart3,
  Search
} from 'lucide-react';
import * as XLSX from 'xlsx';

export const ReportView: React.FC = () => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [extras, setExtras] = useState<ExtraCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      const [evs, prods, exts] = await Promise.all([
        ApiService.getEvents(),
        ApiService.getProducts(),
        ApiService.getExtras()
      ]);
      setEvents(evs);
      setProducts(prods);
      setExtras(exts);
      setLoading(false);
    };
    loadData();
  }, []);

  const financialStats = useMemo(() => {
    const closedEvents = events.filter(e => e.status === 'FECHADO');
    const totalPlannedRev = events.reduce((s, e) => s + e.plannedPrice, 0);
    const totalRealRev = closedEvents.reduce((s, e) => s + (e.realRevenue || 0), 0);
    const totalRealCost = closedEvents.reduce((s, e) => s + (e.realCost || 0), 0);
    const totalProfit = totalRealRev - totalRealCost;

    return { totalPlannedRev, totalRealRev, totalRealCost, totalProfit };
  }, [events]);

  const exportToExcel = () => {
    // 1. Relatório Geral
    const generalData = events.map(e => ({
      Data: e.date,
      Cliente: e.clientName,
      Documento: e.clientDoc,
      PAX: e.pax,
      'Valor Vendido': e.plannedPrice,
      'Custo Previsto': e.plannedCost,
      Status: e.status
    }));

    // 2. Relatório de Consumo (Itens)
    const consumptionData: any[] = [];
    events.forEach(e => {
      e.items.forEach(item => {
        const prod = products.find(p => p.id === item.productId);
        consumptionData.push({
          Evento: e.clientName,
          Data: e.date,
          Item: prod?.name || 'Desconhecido',
          'Qtd Prevista': item.qtyPlanned,
          'Qtd Real': item.qtyReal || 0,
          'Diferença': (item.qtyReal || 0) - item.qtyPlanned,
          'Coeficiente Previsto': prod?.factor || 0,
          'Coeficiente Real': (item.qtyReal || 0) / (e.pax || 1)
        });
      });
    });

    // 3. Financeiro Analítico
    const analyticalData = events.map(e => {
      const lucroReal = (e.realRevenue || 0) - (e.realCost || 0);
      const margemReal = e.realRevenue ? (lucroReal / e.realRevenue) * 100 : 0;
      return {
        Evento: e.clientName,
        Data: e.date,
        'Receita Real': e.realRevenue || 0,
        'Custo Real': e.realCost || 0,
        'Lucro Real': lucroReal,
        'Margem Real %': margemReal.toFixed(2),
        'Status': e.status
      };
    });

    const wb = XLSX.utils.book_new();
    
    const wsGeneral = XLSX.utils.json_to_sheet(generalData);
    XLSX.utils.book_append_sheet(wb, wsGeneral, "Geral de Eventos");

    const wsConsumption = XLSX.utils.json_to_sheet(consumptionData);
    XLSX.utils.book_append_sheet(wb, wsConsumption, "Consumo e Itens");

    const wsAnalytical = XLSX.utils.json_to_sheet(analyticalData);
    XLSX.utils.book_append_sheet(wb, wsAnalytical, "Financeiro Analítico");

    XLSX.writeFile(wb, `Relatorio_EventMaster_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Processando relatórios SQL...</div>;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Business Intelligence</h2>
          <p className="text-slate-500 text-sm">Análise de rentabilidade e consumo baseada no banco SQL.</p>
        </div>
        <button 
          onClick={exportToExcel}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
        >
          <FileSpreadsheet size={18} /> Exportar Excel (.xlsx)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Faturamento Previsto (Pipeline)</p>
          <h4 className="text-2xl font-black mt-2 text-slate-800">R$ {financialStats.totalPlannedRev.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Faturamento Realizado</p>
          <div className="flex items-center gap-2 mt-2">
            <h4 className="text-2xl font-black text-indigo-600">R$ {financialStats.totalRealRev.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
            <TrendingUp size={18} className="text-indigo-400" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Custo Real Total</p>
          <h4 className="text-2xl font-black mt-2 text-rose-500">R$ {financialStats.totalRealCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm bg-emerald-50/50 border-emerald-100">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Lucro Líquido Real</p>
          <h4 className="text-2xl font-black mt-2 text-emerald-700">R$ {financialStats.totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 size={18} className="text-indigo-500" />
            Financeiro Analítico por Evento
          </h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Filtrar evento..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Evento / Data</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Receita Real</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Custo Real</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Lucro</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Margem Real</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Desempenho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {events
                .filter(e => e.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((e) => {
                const lucro = (e.realRevenue || 0) - (e.realCost || 0);
                const margem = e.realRevenue ? (lucro / e.realRevenue) * 100 : 0;
                const isPositive = lucro >= 0;
                const isClosed = e.status === 'FECHADO';

                return (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{e.clientName}</p>
                      <p className="text-[10px] text-slate-500">{new Date(e.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">R$ {(e.realRevenue || 0).toLocaleString('pt-BR')}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">R$ {(e.realCost || 0).toLocaleString('pt-BR')}</td>
                    <td className={`px-6 py-4 text-sm font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                      R$ {lucro.toLocaleString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{margem.toFixed(1)}%</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${margem > 30 ? 'bg-emerald-500' : margem > 15 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                            style={{ width: `${Math.min(Math.max(margem, 0), 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {!isClosed ? (
                        <span className="text-[10px] font-bold text-slate-400 uppercase italic">Aguardando Fechamento</span>
                      ) : isPositive ? (
                        <div className="flex items-center justify-center text-emerald-500" title="Lucro Positivo">
                          <ArrowUpCircle size={20} />
                        </div>
                      ) : (
                        <div className="flex items-center justify-center text-rose-500" title="Prejuízo">
                          <ArrowDownCircle size={20} />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-indigo-900 p-8 rounded-3xl text-white shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold">Inteligência de Itens e Coeficientes</h3>
            <p className="text-indigo-200 text-sm max-w-xl">
              Ao fechar um evento, o sistema compara o consumo previsto vs. real. 
              Isso ajuda a ajustar o Fator de Consumo dos seus produtos no backoffice para precificações futuras mais assertivas.
            </p>
          </div>
          <button 
             onClick={exportToExcel}
             className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-50 transition-colors"
          >
            <Download size={18} /> Baixar Relatório Analítico
          </button>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-800 rounded-full -mr-32 -mt-32 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-800 rounded-full -ml-16 -mb-16 opacity-50"></div>
      </div>
    </div>
  );
};
