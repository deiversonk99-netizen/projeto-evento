
import React, { useState, useEffect } from 'react';
import { Package, Product } from '../../types';
import { FirebaseService } from '../../firebase';
import { Plus, Package as PackageIcon, Trash2, Box } from 'lucide-react';

export const PackageList: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      FirebaseService.getPackages(),
      FirebaseService.getProducts()
    ]).then(([pkgs, prods]) => {
      setPackages(pkgs);
      setProducts(prods);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Pacotes de Eventos</h2>
          <p className="text-slate-500 text-sm">Templates pré-definidos para facilitar a montagem de propostas.</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
          <Plus size={18} /> Novo Pacote
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.length > 0 ? packages.map(pkg => (
          <div key={pkg.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Box size={24} />
              </div>
              <h3 className="font-bold text-slate-800">{pkg.name}</h3>
            </div>
            <div className="space-y-2 mb-6">
              {pkg.productIds.map(pid => {
                const p = products.find(prod => prod.id === pid);
                return <div key={pid} className="text-xs text-slate-500 flex items-center gap-2">• {p?.name}</div>;
              })}
            </div>
            <div className="flex justify-end gap-2">
              <button className="text-rose-600 p-2 hover:bg-rose-50 rounded-lg"><Trash2 size={16}/></button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 bg-white rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
            <PackageIcon size={48} className="mb-4 opacity-20" />
            <p>Nenhum pacote cadastrado ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
};
