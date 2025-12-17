
import React, { useState, useEffect } from 'react';
import { AppEvent, Product, EventStatus } from '../../types';
import { FirebaseService } from '../../firebase';
import { ChevronLeft, Save, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react';

interface EventClosingProps {
  onNavigate: (view: any) => void;
  eventId: string;
}

export const EventClosing: React.FC<EventClosingProps> = ({ onNavigate, eventId }) => {
  const [event, setEvent] = useState<AppEvent | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [events, prods] = await Promise.all([
        FirebaseService.getEvents(),
        FirebaseService.getProducts()
      ]);
      const found = events.find(e => e.id === eventId);
      if (found) {
        // Initialize qtyReal with qtyPlanned if not set
        const updatedItems = found.items.map(item => ({
          ...item,
          qtyReal: item.qtyReal !== undefined ? item.qtyReal : item.qtyPlanned
        }));
        setEvent({ ...found, items: updatedItems });
      }
      setProducts(prods);
      setLoading(false);
    };
    load();
  }, [eventId]);

  const handleUpdateQty = (index: number, val: number) => {
    if (!event) return;
    const newItems = [...event.items];
    newItems[index].qtyReal = val;
    setEvent({ ...event, items: newItems });
  };

  const handleSave = async () => {
    if (!event) return;
    
    // Calculate Real Cost
    const realCostItems = event.items.reduce((acc, item) => {
      const prod = products.find(p => p.id === item.productId);
      return acc + (prod ? (item.qtyReal || 0) * prod.unitCost : 0);
    }, 0);
    const costExtras = event.extras.reduce((acc, ext) => acc + ext.cost, 0);
    
    const finalEvent: AppEvent = {
      ...event,
      realCost: realCostItems + costExtras,
      realRevenue: event.plannedPrice, // Assuming agreed price was paid
      status: EventStatus.CLOSED
    };

    await FirebaseService.saveEvent(finalEvent);
    alert('Fechamento realizado com sucesso!');
    onNavigate('events');
  };

  if (loading || !event) return <div>Carregando...</div>;

  const realCost = event.items.reduce((acc, item) => {
    const prod = products.find(p => p.id === item.productId);
    return acc + (prod ? (item.qtyReal || 0) * prod.unitCost : 0);
  }, 0) + event.extras.reduce((acc, e) => acc + e.cost, 0);

  const profitDiff = (event.plannedPrice - realCost) - (event.plannedPrice - event.plannedCost);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={() => onNavigate('events')} className="text-slate-500 flex items-center gap-1 hover:text-slate-800">
          <ChevronLeft size={20} /> Voltar
        </button>
        <button 
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20"
        >
          <CheckCircle2 size={18} /> Finalizar Fechamento
        </button>
      </div>

      <header className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">{event.clientName}</h2>
          <p className="text-slate-500">{new Date(event.date + 'T00:00:00').toLocaleDateString('pt-BR')} • {event.pax} pessoas</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase">Receita</p>
            <p className="text-lg font-bold">R$ {event.plannedPrice.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase">Lucro Real Est.</p>
            <p className={`text-lg font-bold ${profitDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              R$ {(event.plannedPrice - realCost).toLocaleString()}
            </p>
          </div>
        </div>
      </header>

      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          Consumo Real vs. Previsto
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <div className="col-span-6">Produto</div>
            <div className="col-span-3 text-center">Previsto</div>
            <div className="col-span-3 text-center">Realizado</div>
          </div>
          
          {event.items.map((item, idx) => {
            const prod = products.find(p => p.id === item.productId);
            const isBetter = (item.qtyReal || 0) < item.qtyPlanned;
            
            return (
              <div key={idx} className="grid grid-cols-12 items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="col-span-6">
                  <p className="text-sm font-bold text-slate-800">{prod?.name}</p>
                  <p className="text-[10px] text-slate-500">Coef. Real: {((item.qtyReal || 0) / event.pax).toFixed(2)} (Prev: {prod?.factor})</p>
                </div>
                <div className="col-span-3 text-center">
                  <span className="text-sm text-slate-500 font-medium">{item.qtyPlanned}</span>
                </div>
                <div className="col-span-3">
                  <div className="relative">
                    <input 
                      type="number"
                      value={item.qtyReal}
                      onChange={e => handleUpdateQty(idx, Number(e.target.value))}
                      className={`w-full text-center px-3 py-1.5 rounded-lg border text-sm font-bold ${
                        isBetter ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'
                      }`}
                    />
                    <div className="absolute -right-2 -top-2">
                      {isBetter ? <TrendingDown size={14} className="text-emerald-500" /> : <TrendingUp size={14} className="text-rose-500" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-4">Análise Financeira</h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Custo Previsto</span>
              <span className="font-medium">R$ {event.plannedCost.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Custo Realizado</span>
              <span className={`font-bold ${realCost <= event.plannedCost ? 'text-emerald-600' : 'text-rose-600'}`}>
                R$ {realCost.toLocaleString()}
              </span>
            </div>
            <div className="pt-3 border-t flex justify-between">
              <span className="font-bold text-slate-800">Resultado Financeiro</span>
              <span className={`font-black ${profitDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {profitDiff >= 0 ? '+' : ''} R$ {profitDiff.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-center">
          <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-1">Lucro Líquido Real</p>
          <h3 className="text-3xl font-black">R$ {(event.plannedPrice - realCost).toLocaleString()}</h3>
          <p className="text-sm text-indigo-300 mt-2">Margem Real: {(((event.plannedPrice - realCost) / event.plannedPrice) * 100).toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
};
