
import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  Package as PackageIcon, 
  Utensils, 
  Music, 
  Box, 
  BarChart3, 
  Settings 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: any) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'events', label: 'Eventos', icon: Calendar },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'backoffice-divider', label: 'Backoffice', isDivider: true },
    { id: 'products', label: 'Produtos', icon: Utensils },
    { id: 'extras', label: 'Custos Extras', icon: Music },
    { id: 'packages', label: 'Pacotes', icon: Box },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col hidden md:flex">
        <div className="p-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <PackageIcon className="text-indigo-400" />
            <span>EventMaster <span className="text-indigo-400">Pro</span></span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Sistema de Gestão</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
          {navItems.map((item) => {
            if (item.isDivider) {
              return (
                <div key={item.id} className="pt-4 pb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase px-3">{item.label}</span>
                </div>
              );
            }
            const Icon = item.icon!;
            const active = currentView === item.id || (item.id === 'events' && (currentView === 'new-event' || currentView === 'edit-event' || currentView === 'closing'));
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  active 
                  ? 'bg-indigo-600 text-white font-medium shadow-lg shadow-indigo-900/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">RE</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Restaurante Gourmet</p>
              <p className="text-xs text-slate-400 truncate">Administrador</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800 capitalize">
            {currentView.replace('-', ' ')}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
              <Settings size={20} />
            </button>
            {currentView !== 'new-event' && (
               <button 
                  onClick={() => onNavigate('new-event')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <Calendar size={18} />
                  Novo Evento
                </button>
            )}
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};
