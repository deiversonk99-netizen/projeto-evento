
import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { ApiService } from '../../api';
import { Plus, Edit2, X, Save, AlertCircle } from 'lucide-react';

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ApiService.getProducts().then(setProducts);
  }, []);

  const handleSave = async () => {
    setError(null);
    try {
      const product = {
        id: editForm.id || Math.random().toString(36).substr(2, 9),
        name: editForm.name || '',
        unitCost: editForm.unitCost || 0,
        factor: editForm.factor || 0,
      } as Product;
      
      await ApiService.saveProduct(product);
      const updated = await ApiService.getProducts();
      setProducts(updated);
      setIsEditing(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Produtos (SQL Table)</h2>
        <button onClick={() => { setIsEditing('new'); setEditForm({}); setError(null); }} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
          <Plus size={18} /> Novo Produto
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}. Verifique se as tabelas no SQL Editor estão configuradas!</p>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr><th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Nome</th><th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Custo Unit</th><th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Ações</th></tr>
          </thead>
          <tbody className="divide-y">
            {isEditing === 'new' && (
              <tr className="bg-indigo-50/30">
                <td className="px-6 py-4"><input className="w-full p-2 border rounded" placeholder="Nome" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} /></td>
                <td className="px-6 py-4"><input type="number" className="w-full p-2 border rounded" value={editForm.unitCost || ''} onChange={e => setEditForm({...editForm, unitCost: Number(e.target.value)})} /></td>
                <td className="px-6 py-4 flex gap-2">
                  <button onClick={handleSave} className="text-emerald-600 p-2 hover:bg-emerald-50 rounded-lg"><Save size={18}/></button>
                  <button onClick={() => setIsEditing(null)} className="text-slate-400 p-2 hover:bg-slate-50 rounded-lg"><X size={18}/></button>
                </td>
              </tr>
            )}
            {products.map(product => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">{product.name}</td>
                <td className="px-6 py-4 text-slate-600">R$ {product.unitCost.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <button onClick={() => { setIsEditing(product.id); setEditForm(product); setError(null); }} className="text-indigo-600 p-2 hover:bg-indigo-50 rounded-lg">
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
