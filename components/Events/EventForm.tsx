
import React, { useState, useEffect, useMemo } from 'react';
import { AppEvent, Product, ExtraCost, Package, EventStatus } from '../../types';
import { ApiService } from '../../api';
import { X, Calculator, Save, ChevronLeft, Download, Clock } from 'lucide-react';

interface EventFormProps {
  onNavigate: (view: any) => void;
  eventId?: string | null;
}

export const EventForm: React.FC<EventFormProps> = ({ onNavigate, eventId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [extrasAvailable, setExtrasAvailable] = useState<ExtraCost[]>([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<Partial<AppEvent>>({
    id: Math.random().toString(36).substr(2, 9),
    clientName: '',
    clientDoc: '',
    date: '',
    time: '12:00', // Valor padrão para evitar erros SQL
    duration: 4,
    pax: 30,
    items: [],
    extras: [],
    desiredMargin: 30,
    status: EventStatus.PROPOSAL,
    plannedCost: 0,
    plannedPrice: 0,
    paymentTerms: '50% sinal, 50% no dia do evento.',
  });

  useEffect(() => {
    const loadData = async () => {
      const [prods, exts] = await Promise.all([
        ApiService.getProducts(),
        ApiService.getExtras()
      ]);
      setProducts(prods);
      setExtrasAvailable(exts);

      if (eventId) {
        const events = await ApiService.getEvents();
        const existing = events.find(e => e.id === eventId);
        if (existing) setFormData(existing);
      }
      setLoading(false);
    };
    loadData();
  }, [eventId]);

  const handleAddItem = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), { productId, qtyPlanned: (formData.pax || 0) * prod.factor }]
    }));
  };

  const handleAddExtra = (extraId: string) => {
    const ext = extrasAvailable.find(e => e.id === extraId);
    if (!ext) return;
    setFormData(prev => ({
      ...prev,
      extras: [...(prev.extras || []), { extraId, cost: ext.cost }]
    }));
  };

  const totals = useMemo(() => {
    const costItems = (formData.items || []).reduce((acc, item) => {
      const prod = products.find(p => p.id === item.productId);
      return acc + (prod ? item.qtyPlanned * prod.unitCost : 0);
    }, 0);
    const costExtras = (formData.extras || []).reduce((acc, ext) => acc + ext.cost, 0);
    const totalCost = costItems + costExtras;
    const suggestedPrice = totalCost * (1 + ((formData.desiredMargin || 0) / 100));
    return { totalCost, suggestedPrice, perPerson: formData.pax ? suggestedPrice / formData.pax : 0 };
  }, [formData, products]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.clientDoc) return alert('Nome e Documento do cliente são obrigatórios');
    
    try {
      const eventToSave: AppEvent = {
        ...formData as AppEvent,
        plannedCost: totals.totalCost,
        plannedPrice: totals.suggestedPrice,
      };
      await ApiService.saveEvent(eventToSave);
      alert('Evento salvo com sucesso no Banco SQL!');
      onNavigate('events');
    } catch (err: any) {
      alert(`Erro ao salvar: ${err.message}`);
    }
  };

  if (loading) return <div className="p-8 text-center">Carregando dados relacionais...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => onNavigate('events')} className="text-slate-500 flex items-center gap-1 hover:text-slate-800">
          <ChevronLeft size={20} /> Voltar
        </button>
        <div className="flex items-center gap-3">
          <button type="button" className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50"><Download size={18} /> Proposta</button>
          <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20"><Save size={18} /> Salvar no SQL</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Dados Gerais do Evento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Cliente</label>
                <input type="text" placeholder="Nome do Cliente" value={formData.clientName} onChange={e => setFormData(prev => ({...prev, clientName: e.target.value}))} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">CPF / CNPJ</label>
                <input type="text" placeholder="Documento" value={formData.clientDoc} onChange={e => setFormData(prev => ({...prev, clientDoc: e.target.value}))} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Data</label>
                <input type="date" value={formData.date} onChange={e => setFormData(prev => ({...prev, date: e.target.value}))} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Horário</label>
                <div className="relative">
                  <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="time" value={formData.time} onChange={e => setFormData(prev => ({...prev, time: e.target.value}))} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Duração (Horas)</label>
                <input type="number" value={formData.duration} onChange={e => setFormData(prev => ({...prev, duration: Number(e.target.value)}))} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nº de Pessoas (PAX)</label>
                <input type="number" placeholder="Pessoas" value={formData.pax} onChange={e => setFormData(prev => ({...prev, pax: Number(e.target.value)}))} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none" required />
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800">Itens e Serviços</h3>
              <div className="flex gap-2">
                <select onChange={(e) => e.target.value && handleAddItem(e.target.value)} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg px-2 py-1 outline-none font-bold">
                  <option value="">+ Produto</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select onChange={(e) => e.target.value && handleAddExtra(e.target.value)} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg px-2 py-1 outline-none font-bold">
                  <option value="">+ Extra</option>
                  {extrasAvailable.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
            </div>
            
            <div className="space-y-3">
              {(formData.items || []).length === 0 && (formData.extras || []).length === 0 && (
                <p className="text-center py-6 text-slate-400 text-sm">Nenhum item selecionado.</p>
              )}
              
              {formData.items?.map((item, idx) => {
                const prod = products.find(p => p.id === item.productId);
                return (
                  <div key={`item-${idx}`} className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 group">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">{prod?.name}</p>
                      <p className="text-[10px] text-slate-500 uppercase">Fator: {prod?.factor} /pessoa</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Qtd</label>
                      <input type="number" value={item.qtyPlanned} onChange={e => {
                        const newItems = [...(formData.items || [])];
                        newItems[idx].qtyPlanned = Number(e.target.value);
                        setFormData(prev => ({...prev, items: newItems}));
                      }} className="w-20 px-2 py-1 bg-white border border-slate-200 rounded text-center text-sm font-bold" />
                    </div>
                    <button type="button" onClick={() => setFormData(prev => ({...prev, items: prev.items?.filter((_, i) => i !== idx)}))} className="text-slate-300 hover:text-rose-500 transition-colors"><X size={18}/></button>
                  </div>
                );
              })}

              {formData.extras?.map((extra, idx) => {
                const ext = extrasAvailable.find(e => e.id === extra.extraId);
                return (
                  <div key={`extra-${idx}`} className="flex items-center gap-4 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-indigo-900">{ext?.name}</p>
                      <p className="text-[10px] text-indigo-500 uppercase">Serviço Terceirizado</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-bold text-indigo-400 uppercase">Custo R$</label>
                      <input type="number" value={extra.cost} onChange={e => {
                        const newExtras = [...(formData.extras || [])];
                        newExtras[idx].cost = Number(e.target.value);
                        setFormData(prev => ({...prev, extras: newExtras}));
                      }} className="w-24 px-2 py-1 bg-white border border-indigo-200 rounded text-center text-sm font-bold text-indigo-700" />
                    </div>
                    <button type="button" onClick={() => setFormData(prev => ({...prev, extras: prev.extras?.filter((_, i) => i !== idx)}))} className="text-indigo-300 hover:text-rose-500 transition-colors"><X size={18}/></button>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl sticky top-24 border border-slate-800">
            <div className="flex items-center gap-2 mb-6 text-indigo-400">
              <Calculator size={20} />
              <h3 className="font-bold">Resumo Financeiro</h3>
            </div>
            
            <div className="space-y-5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Custo Base</span>
                <span className="font-medium">R$ {totals.totalCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div className="pt-4 border-t border-slate-800">
                <label className="block text-xs font-bold text-indigo-300 uppercase mb-2">Margem de Lucro Sugerida (%)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={formData.desiredMargin} 
                    onChange={e => setFormData(prev => ({...prev, desiredMargin: Number(e.target.value)}))} 
                    className="flex-1 accent-indigo-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm font-bold w-10 text-right">{formData.desiredMargin}%</span>
                </div>
              </div>

              <div className="pt-6 space-y-3">
                <div className="bg-indigo-600/20 p-4 rounded-xl border border-indigo-500/30">
                  <p className="text-[10px] text-indigo-300 uppercase font-bold mb-1 tracking-wider">Valor Sugerido Total</p>
                  <p className="text-2xl font-black text-white">R$ {totals.suggestedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">Por Pessoa (PAX)</p>
                  <p className="text-lg font-bold text-slate-200">R$ {totals.perPerson.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div className="pt-2 text-center">
                <p className="text-[10px] text-slate-500 italic">Cálculos baseados em custos unitários sincronizados do banco SQL.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
