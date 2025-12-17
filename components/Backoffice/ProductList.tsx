
import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { FirebaseService } from '../../firebase';
import { Plus, Edit2, Trash2, X, Save } from 'lucide-react';

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});

  useEffect(() => {
    FirebaseService.getProducts().then(setProducts);
  }, []);

  const handleSave = async () => {
    const product = {
      id: editForm.id || Math.random().toString(36).substr(2, 9),
      name: editForm.name || '',
      unitCost: editForm.unitCost || 0,
      factor: editForm.factor || 0,
    } as Product;

    await FirebaseService.saveProduct(product);
    const updated = await FirebaseService.getProducts();
    setProducts(updated);
    setIsEditing(null);
    setEditForm({});
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Produtos & Insumos</h2>
          <p className="text-slate-500 text-sm">Gerencie itens e seus coeficientes de consumo padrão.</p>
        </div>
        <button 
          onClick={() => { setIsEditing('new'); setEditForm({}); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
        >
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Nome</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Custo Unit.</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Fator Consumo</th>
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
                    placeholder="Nome do item"
                    value={editForm.name || ''}
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                  />
                </td>
                <td className="px-6 py-4">
                  <input 
                    type="number"
                    className="w-full p-2 border rounded-lg"
                    value={editForm.unitCost || ''}
                    onChange={e => setEditForm({...editForm, unitCost: Number(e.target.value)})}
                  />
                </td>
                <td className="px-6 py-4">
                  <input 
                    type="number" step="0.01"
                    className="w-full p-2 border rounded-lg"
                    value={editForm.factor || ''}
                    onChange={e => setEditForm({...editForm, factor: Number(e.target.value)})}
                  />
                </td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={handleSave} className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg"><Save size={18}/></button>
                  <button onClick={() => setIsEditing(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-lg"><X size={18}/></button>
                </td>
              </tr>
            )}
            {products.map(product => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">{product.name}</td>
                <td className="px-6 py-4 text-slate-600">R$ {product.unitCost.toFixed(2)}</td>
                <td className="px-6 py-4 text-slate-600 font-mono">{product.factor.toFixed(2)}/pax</td>
                <td className="px-6 py-4 flex gap-2">
                  <button 
                    onClick={() => { setIsEditing(product.id); setEditForm(product); }}
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
