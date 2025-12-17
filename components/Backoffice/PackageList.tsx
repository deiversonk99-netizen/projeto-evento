
import React, { useState, useEffect } from 'react';
import { Package, Product } from '../../types';
import { ApiService } from '../../api';
import { Plus, Box } from 'lucide-react';

export const PackageList: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ApiService.getPackages(),
      ApiService.getProducts()
    ]).then(([pkgs, prods]) => {
      setPackages(pkgs || []);
      setProducts(prods || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center">Buscando templates relacionais...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Templates de Eventos (SQL)</h2>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold"><Plus size={18} /> Novo Pacote</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map(pkg => (
          <div key={pkg.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-4"><Box className="text-indigo-600" /><h3 className="font-bold">{pkg.name}</h3></div>
            <div className="space-y-1">{pkg.productIds.map(pid => <div key={pid} className="text-xs text-slate-500">• {products.find(p => p.id === pid)?.name}</div>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
