
import React, { useState, useEffect } from 'react';
import { AppEvent, Product, EventStatus } from '../../types';
import { ApiService } from '../../api';
import { ChevronLeft, Save, CheckCircle2 } from 'lucide-react';

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
        ApiService.getEvents(),
        ApiService.getProducts()
      ]);
      const found = events.find(e => e.id === eventId);
      if (found) setEvent(found);
      setProducts(prods);
      setLoading(false);
    };
    load();
  }, [eventId]);

  const handleSave = async () => {
    if (!event) return;
    const realCostItems = event.items.reduce((acc, item) => {
      const prod = products.find(p => p.id === item.productId);
      return acc + (prod ? (item.qtyReal || 0) * prod.unitCost : 0);
    }, 0);
    const finalEvent: AppEvent = {
      ...event,
      realCost: realCostItems + event.extras.reduce((acc, e) => acc + e.cost, 0),
      realRevenue: event.plannedPrice,
      status: EventStatus.CLOSED
    };
    await ApiService.saveEvent(finalEvent);
    alert('Fechamento SQL Concluído!');
    onNavigate('events');
  };

  if (loading || !event) return <div className="p-8 text-center">Carregando dados para fechamento SQL...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <button onClick={() => onNavigate('events')} className="text-slate-500 flex items-center gap-1 hover:text-slate-800"><ChevronLeft size={20} /> Voltar</button>
        <button onClick={handleSave} className="bg-emerald-600 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><CheckCircle2 size={18} /> Finalizar SQL</button>
      </div>
      <header className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-800">{event.clientName}</h2>
        <p className="text-slate-500">Fechamento de Rentabilidade Real (Relacional)</p>
      </header>
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-6">Consumo Real</h3>
        {event.items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl mb-2">
            <span className="text-sm font-bold">{products.find(p => p.id === item.productId)?.name}</span>
            <input type="number" value={item.qtyReal || item.qtyPlanned} onChange={e => {
               const newItems = [...event.items];
               newItems[idx].qtyReal = Number(e.target.value);
               setEvent({...event, items: newItems});
            }} className="w-24 text-center border rounded p-1" />
          </div>
        ))}
      </section>
    </div>
  );
};
