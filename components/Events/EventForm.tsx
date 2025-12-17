
import React, { useState, useEffect, useMemo } from 'react';
import { AppEvent, Product, ExtraCost, Package, EventStatus, EventItem, EventExtra } from '../../types';
import { FirebaseService } from '../../firebase';
import { Plus, X, Calculator, Save, ChevronLeft, Download, FileCheck } from 'lucide-react';

interface EventFormProps {
  onNavigate: (view: any) => void;
  eventId?: string | null;
}

export const EventForm: React.FC<EventFormProps> = ({ onNavigate, eventId }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [extrasAvailable, setExtrasAvailable] = useState<ExtraCost[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState<Partial<AppEvent>>({
    id: Math.random().toString(36).substr(2, 9),
    clientName: '',
    clientDoc: '',
    date: '',
    time: '',
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
      const [prods, exts, pkgs] = await Promise.all([
        FirebaseService.getProducts(),
        FirebaseService.getExtras(),
        FirebaseService.getPackages()
      ]);
      setProducts(prods);
      setExtrasAvailable(exts);
      setPackages(pkgs);

      if (eventId) {
        const events = await FirebaseService.getEvents();
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
      items: [...(prev.items || []), { productId, qtyPlanned: formData.pax! * prod.factor }]
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

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveExtra = (index: number) => {
    setFormData(prev => ({
      ...prev,
      extras: prev.extras?.filter((_, i) => i !== index)
    }));
  };

  const totals = useMemo(() => {
    const costItems = (formData.items || []).reduce((acc, item) => {
      const prod = products.find(p => p.id === item.productId);
      return acc + (prod ? item.qtyPlanned * prod.unitCost : 0);
    }, 0);

    const costExtras = (formData.extras || []).reduce((acc, ext) => acc + ext.cost, 0);
    
    const totalCost = costItems + costExtras;
    const margin = formData.desiredMargin || 0;
    // Calculation: Suggested Price = Cost * (1 + margin / 100)
    const suggestedPrice = totalCost * (1 + (margin / 100));
    
    return {
      totalCost,
      suggestedPrice,
      perPerson: formData.pax ? suggestedPrice / formData.pax : 0
    };
  }, [formData, products, extrasAvailable]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName || !formData.clientDoc) {
      alert('Dados do cliente são obrigatórios');
      return;
    }

    const eventToSave: AppEvent = {
      ...formData as AppEvent,
      plannedCost: totals.totalCost,
      plannedPrice: totals.suggestedPrice,
    };

    await FirebaseService.saveEvent(eventToSave);
    alert('Evento salvo com sucesso!');
    onNavigate('events');
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <button type="button" onClick={() => onNavigate('events')} className="text-slate-500 flex items-center gap-1 hover:text-slate-800">
          <ChevronLeft size={20} /> Voltar para lista
        </button>
        <div className="flex items-center gap-3">
          <button type="button" className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50">
            <Download size={18} /> Proposta (PDF)
          </button>
          <button type="button" className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50">
            <FileCheck size={18} /> Contrato (PDF)
          </button>
          <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">
            <Save size={18} /> Salvar Evento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Dados Gerais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Cliente / Empresa *</label>
                <input 
                  type="text" required
                  value={formData.clientName}
                  onChange={e => setFormData(prev => ({...prev, clientName: e.target.value}))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">CNPJ / CPF *</label>
                <input 
                  type="text" required
                  value={formData.clientDoc}
                  onChange={e => setFormData(prev => ({...prev, clientDoc: e.target.value}))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Data</label>
                <input 
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData(prev => ({...prev, date: e.target.value}))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Início</label>
                  <input 
                    type="time"
                    value={formData.time}
                    onChange={e => setFormData(prev => ({...prev, time: e.target.value}))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pessoas</label>
                  <input 
                    type="number"
                    value={formData.pax}
                    onChange={e => setFormData(prev => ({...prev, pax: Number(e.target.value)}))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Selection */}
          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800">Cardápio e Itens</h3>
              <div className="flex gap-2">
                <select 
                  onChange={(e) => e.target.value && handleAddItem(e.target.value)}
                  className="text-xs bg-slate-100 border-none rounded-lg p-1 outline-none"
                >
                  <option value="">+ Add Produto</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select 
                  onChange={(e) => e.target.value && handleAddExtra(e.target.value)}
                  className="text-xs bg-slate-100 border-none rounded-lg p-1 outline-none"
                >
                  <option value="">+ Add Extra</option>
                  {extrasAvailable.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Produtos (Consumo Estimado)</h4>
              {formData.items?.map((item, idx) => {
                const prod = products.find(p => p.id === item.productId);
                return (
                  <div key={idx} className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{prod?.name}</p>
                      <p className="text-[10px] text-slate-500">Custo Unit: R$ {prod?.unitCost.toFixed(2)} | Fator: {prod?.factor}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        value={item.qtyPlanned}
                        onChange={e => {
                          const newItems = [...(formData.items || [])];
                          newItems[idx].qtyPlanned = Number(e.target.value);
                          setFormData(prev => ({...prev, items: newItems}));
                        }}
                        className="w-20 px-2 py-1 text-sm bg-white border border-slate-200 rounded text-center"
                      />
                      <button type="button" onClick={() => handleRemoveItem(idx)} className="p-1 text-slate-400 hover:text-rose-500"><X size={16}/></button>
                    </div>
                  </div>
                );
              })}

              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-4">Custos Fixos / Extras</h4>
              {formData.extras?.map((extItem, idx) => {
                const ext = extrasAvailable.find(e => e.id === extItem.extraId);
                return (
                  <div key={idx} className="flex items-center gap-4 bg-indigo-50/50 p-3 rounded-xl">
                    <div className="flex-1 text-sm font-semibold">{ext?.name}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-500">R$</span>
                      <input 
                        type="number" 
                        value={extItem.cost}
                        onChange={e => {
                          const newExtras = [...(formData.extras || [])];
                          newExtras[idx].cost = Number(e.target.value);
                          setFormData(prev => ({...prev, extras: newExtras}));
                        }}
                        className="w-24 px-2 py-1 text-sm bg-white border border-slate-200 rounded text-right"
                      />
                      <button type="button" onClick={() => handleRemoveExtra(idx)} className="p-1 text-slate-400 hover:text-rose-500"><X size={16}/></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3">Observações e Condições</h3>
            <textarea 
              value={formData.paymentTerms}
              onChange={e => setFormData(prev => ({...prev, paymentTerms: e.target.value}))}
              placeholder="Termos de pagamento e observações gerais..."
              className="w-full h-24 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </section>
        </div>

        {/* Pricing Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl sticky top-24">
            <div className="flex items-center gap-2 mb-6">
              <Calculator className="text-indigo-400" size={20} />
              <h3 className="font-bold">Resumo Financeiro</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Custo Base Total</span>
                <span className="font-bold">R$ {totals.totalCost.toLocaleString()}</span>
              </div>
              
              <div className="pt-4 border-t border-slate-800">
                <label className="block text-xs font-bold text-indigo-300 uppercase mb-2">Margem de Lucro Desejada (%)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" min="0" max="100" step="1"
                    value={formData.desiredMargin}
                    onChange={e => setFormData(prev => ({...prev, desiredMargin: Number(e.target.value)}))}
                    className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                  <span className="w-10 text-right font-bold text-indigo-400">{formData.desiredMargin}%</span>
                </div>
              </div>

              <div className="pt-6 space-y-4">
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Preço Sugerido (Total)</p>
                  <p className="text-2xl font-bold text-indigo-400">R$ {totals.suggestedPrice.toLocaleString()}</p>
                </div>
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Valor por Pessoa</p>
                  <p className="text-xl font-bold text-white">R$ {totals.perPerson.toFixed(2)}</p>
                </div>
              </div>
              
              <div className="pt-4">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Status do Evento</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData(prev => ({...prev, status: e.target.value as EventStatus}))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {Object.values(EventStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
