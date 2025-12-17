
import React, { useState, useEffect } from 'react';
import { ExtraCost } from '../../types';
import { FirebaseService } from '../../firebase';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';

export const ExtraCostList: React.FC = () => {
  const [extras, setExtras] = useState<ExtraCost[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ExtraCost>>({});

  useEffect(() => {
    FirebaseService.getExtras().then(setExtras);
  }, []);

  const handleSave = async () => {
    const extra = {
      id: editForm.id || Math.random().toString(36).substr(2, 9),
      name: editForm.name || '',
      cost: editForm.cost || 0,
    } as ExtraCost;

    await FirebaseService.saveExtra(extra);
    const updated = await FirebaseService.getExtras();
    setExtras(updated);
    setIsEditing(null);
    setEditForm({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Custos Extras & Serviços</h2>
          <p className="text-slate-500 text-sm">Gerencie itens como Banda, Segurança, Freelancers, etc.</p>
        </div>
        <button 
          onClick={() => { setIsEditing('new'); setEditForm({}); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
        >
          <Plus size={18} /> Novo Custo Extra
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Nome do Serviço</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Custo Padrão</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isEditing === 'new' && (
              <tr className="bg-indigo-50/30">
                <td className="px-6 py-4">
                  <input 
                    autoFocus
                    className="w-full p-2 border rounded-lg"
                    placeholder="Ex: Banda Show"
                    value={editForm.name || ''}
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                  />
                </td>
                <td className="px-6 py-4">
                  <input 
                    type="number"
                    className="w-full p-2 border rounded-lg"
                    value={editForm.cost || ''}
                    onChange={e => setEditForm({...editForm, cost: Number(e.target.value)})}
                  />
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={handleSave} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg"><Save size={18}/></button>
                  <button onClick={() => setIsEditing(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={18}/></button>
                </td>
              </tr>
            )}
            {extras.map(extra => (
              <tr key={extra.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{extra.name}</td>
                <td className="px-6 py-4 text-slate-600">R$ {extra.cost.toLocaleString()}</td>
                <td className="px-6 py-4 flex gap-2">
                  <button 
                    onClick={() => { setIsEditing(extra.id); setEditForm(extra); }}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  >
                    <Edit2 size={16}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
