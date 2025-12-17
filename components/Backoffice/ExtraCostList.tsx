
import React, { useState, useEffect } from 'react';
import { ExtraCost } from '../../types';
import { ApiService } from '../../api';
import { Plus, Edit2, X, Save } from 'lucide-react';

export const ExtraCostList: React.FC = () => {
  const [extras, setExtras] = useState<ExtraCost[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ExtraCost>>({});

  useEffect(() => {
    ApiService.getExtras().then(setExtras);
  }, []);

  const handleSave = async () => {
    const extra = {
      id: editForm.id || Math.random().toString(36).substr(2, 9),
      name: editForm.name || '',
      cost: editForm.cost || 0,
    } as ExtraCost;
    await ApiService.saveExtra(extra);
    const updated = await ApiService.getExtras();
    setExtras(updated);
    setIsEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Serviços Extras (SQL Table)</h2>
        <button onClick={() => { setIsEditing('new'); setEditForm({}); }} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold"><Plus size={18} /> Novo Serviço</button>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr><th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Serviço</th><th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Custo</th><th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Ações</th></tr>
          </thead>
          <tbody className="divide-y">
            {extras.map(extra => (
              <tr key={extra.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">{extra.name}</td>
                <td className="px-6 py-4 text-slate-600">R$ {extra.cost.toLocaleString()}</td>
                <td className="px-6 py-4"><button onClick={() => { setIsEditing(extra.id); setEditForm(extra); }} className="text-indigo-600"><Edit2 size={16}/></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
